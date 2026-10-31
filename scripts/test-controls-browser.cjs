const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
exports.testControls = async ({ evaluate, send, session, root }) => {
  await evaluate(`(() => {
    const inspect=document.getElementById('inspectorToggleBtn'),dock=document.getElementById('inspectorDockToggleBtn');
    const check=(value,message)=>{if(!value)throw new Error(message)};
    check(inspect.closest('.studio-shell-header') && dock.closest('.studio-shell-header'),'Inspect and Dock belong beside theme selector');
    check(dock.disabled && dock.getAttribute('aria-pressed')==='false','Dock disabled when Inspect off');
    inspect.click();dock.click();check(!document.getElementById('inspectorDockPanel').hidden,'Dock opens while inspecting');
    inspect.click();check(dock.disabled && dock.getAttribute('aria-pressed')==='false' && document.getElementById('inspectorDockPanel').hidden,'Turning Inspect off clears dock');
    DesignSystemStudioShell.activatePanel('components');
    const utility=document.querySelector('[data-utility-toggle="lock"]');
    for(let node=utility;node;node=node.parentElement){node.hidden=false;if(node.tagName==='DETAILS')node.open=true;}
    utility.focus();const before=utility.innerHTML;utility.click();
    check(document.activeElement===utility && utility.getAttribute('aria-pressed')==='true','Utility click retains keyboard focus');
    check(before!==utility.innerHTML && utility.title==='Unlock controls' && utility.getAttribute('aria-label')==='Lock controls','Current glyph and next-action title agree');
    utility.dispatchEvent(new MouseEvent('mouseenter'));check(utility.innerHTML!==before,'Hover does not flip current glyph');
    window.controlFixtures=[];
    document.body.replaceChildren();document.body.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:8px;overflow:hidden';
    for(const theme of DesignSystemThemeRegistry.themes){
      const frame=document.createElement('iframe');frame.style.cssText='width:100%;height:216px;border:0';document.body.append(frame);
      const d=frame.contentDocument;d.open();d.write('<!doctype html><html data-theme="'+theme.id+'"><head><style>'+DesignSystemThemePackageAssets.css+'</style></head><body style="padding:16px"><strong>'+theme.label+'</strong><div style="display:flex;gap:16px;margin:12px 0"><label class="ds-switch"><input type="checkbox" aria-label="Off"><span class="ds-switch-track"></span></label><label class="ds-switch"><input type="checkbox" checked aria-label="On"><span class="ds-switch-track"></span></label><button class="ds-btn ds-btn-text ds-utility-toggle" aria-pressed="true">L</button></div><input type="range" value="50" aria-label="Range"><div style="display:flex;gap:8px;margin-top:12px"><button class="ds-btn">Enabled</button><button class="ds-btn" disabled>Disabled</button><button class="ds-btn ds-btn-primary" disabled>Disabled</button></div></body></html>');d.close();
      window.controlFixtures.push({id:theme.id,frame});
    }
  })()`);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1660,deviceScaleFactor:1,mobile:false},session);
  const samples = await evaluate(`(() => {
    const check=(value,message)=>{if(!value)throw new Error(message)};
    const rgba=(css)=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const c=canvas.getContext('2d');c.fillStyle=css;c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data]};
    return controlFixtures.map(({id,frame})=>{
      const d=frame.contentDocument,w=frame.contentWindow,get=el=>w.getComputedStyle(el);
      for(const input of d.querySelectorAll('.ds-switch input')){
        const track=input.nextElementSibling,r=track.getBoundingClientRect(),p=w.getComputedStyle(track,'::after'),border=parseFloat(get(track).borderTopWidth);
        const y=border+parseFloat(p.top)+16/2-16/2;
        check(Math.abs(y-r.height/2)<0.6,id+' switch thumb is vertically centered');
        const x=border+parseFloat(p.left),inner=r.width-border*2;
        check(Math.abs((input.checked?inner-16-2:2)-(x-border))<0.6,id+' switch end inset');
        check(get(input).display!=='none',id+' switch remains keyboard focusable');
      }
      const normal=d.querySelector('.ds-btn:not(.ds-utility-toggle):not([disabled])'),disabled=d.querySelector('.ds-btn[disabled]');
      const a=rgba(get(normal).color),b=rgba(get(disabled).color);
      check(Math.hypot(...a.slice(0,3).map((n,i)=>n-b[i]))>20,id+' disabled text differs from enabled');
      const utility=d.querySelector('.ds-utility-toggle');check(rgba(get(utility).backgroundColor)[3]===0,id+' utility state has no persistent container fill');
      const range=d.querySelector('input[type=range]'),r=range.getBoundingClientRect(),f=frame.getBoundingClientRect();
      const marker=d.createElement('span');marker.style.color='var(--ds-range-thumb-bg)';d.body.append(marker);const color=rgba(get(marker).color);marker.remove();
      check(color[3]===255,id+' thumb fill is opaque');
      return {id,x:f.x+r.x+r.width/2,y:f.y+r.y+r.height/2,color};
    });
  })()`);
  const capture=await send('Page.captureScreenshot',{format:'png'},session);
  const geometry=await evaluate(`(async()=>{
    const image=new Image();image.src='data:image/png;base64,'+${JSON.stringify(capture.data)};await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d');c.drawImage(image,0,0);const p=c.getImageData(0,0,canvas.width,canvas.height).data;
    return ${JSON.stringify(samples)}.map(s=>{const hits=[];for(let y=Math.floor(s.y-13);y<=Math.ceil(s.y+13);y++){const i=(y*canvas.width+Math.round(s.x))*4;if(Math.hypot(...s.color.slice(0,3).map((n,k)=>n-p[i+k]))<25)hits.push(y)}return {id:s.id,height:hits.length,offset:hits.length?Math.abs((hits[0]+hits[hits.length-1]+1)/2-s.y):null}});
  })()`);
  await evaluate(`controlFixtures[0].frame.contentDocument.querySelector('.ds-switch input').focus()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},session);
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},session);
  assert.equal(await evaluate(`controlFixtures[0].frame.contentDocument.querySelector('.ds-switch input').checked`),true,'Space toggles focused native switch');
  const directory=path.resolve(root,'../_docs/data/control-polish');fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'controls-2026-10-30.png'),Buffer.from(capture.data,'base64'));
  fs.writeFileSync(path.join(directory,'geometry-2026-10-30.json'),JSON.stringify(geometry,null,2)+'\n');
  for (const sample of geometry) { assert.ok(sample.height>=8,sample.id+' has a visible filled thumb core');assert.ok(sample.offset<=1,sample.id+' slider thumb centered: '+sample.offset); }
  console.log('PASS all 21 default themes: switch placement, keyboard access, opaque centered slider thumbs, quiet utility states and distinct disabled text; Inspect/Dock dependency');
};
