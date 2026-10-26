const fs = require('node:fs');
const path = require('node:path');

// Runs through test-browser.cjs's existing server/CDP harness. No duplicate browser driver.
async function auditRendering({ evaluate, send, session, root, suffix = '' }) {
  const ids = await evaluate(`(() => {
    const frame = document.createElement('iframe');
    document.body.replaceChildren(frame);
    document.body.style.cssText = 'margin:0;padding:0;overflow:hidden';
    frame.style.cssText = 'width:100vw;height:100vh;display:block;border:0';
    const d = frame.contentDocument;
    d.open(); d.write('<!doctype html><html lang="en"><head><title>Theme surface audit</title></head><body></body></html>'); d.close();
    const style = d.createElement('style');
    style.textContent = DesignSystemThemePackageAssets.css + \`
      *, *::before, *::after { animation:none!important; transition:none!important; }
      body { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; padding:16px; }
      .audit-case { min-width:0; min-height:92px; padding:16px; display:grid; gap:8px; align-content:center; }
      .audit-body { grid-column:1/-1; min-height:110px; }
      .audit-control { min-height:44px; width:100%; }
      .audit-sampling .audit-label { visibility:hidden; }
      .audit-sampling input { text-indent:-9999px; caret-color:transparent; }
    \`;
    d.head.appendChild(style);
    const card = (id, cls) => '<section class="audit-case '+cls+'" data-audit="'+id+'"><span class="audit-label">'+id+' / readable supporting text</span><span class="audit-label ds-muted">Muted metadata and secondary text</span></section>';
    const control = (id, cls, attrs='') => '<button class="audit-control '+cls+'" data-audit="'+id+'" '+attrs+'><span class="audit-label">'+id+'</span></button>';
    d.body.innerHTML = card('body','audit-body') + card('card','ds-card') + card('secondary-card','ds-card ds-card-secondary') +
      '<section class="ds-card"><div class="audit-case ds-card ds-card-secondary" data-audit="nested-card"><span class="audit-label">Nested card text</span><span class="audit-label ds-muted">Nested supporting text</span></div></section>' +
      '<input class="ds-input audit-control" data-audit="input" aria-label="Input sample" value="Input text">' +
      '<input class="ds-input audit-control" data-audit="readonly-input" aria-label="Read only sample" readonly value="Read only text">' +
      control('button','ds-btn') + control('primary','ds-btn ds-btn-primary') + control('tertiary','ds-btn ds-btn-tertiary') +
      control('selected-button','ds-btn','aria-pressed="true"') + control('tab','ds-tab','aria-selected="false"') +
      control('selected-tab','ds-tab','aria-selected="true"') + control('chip','ds-chip') +
      control('accent-chip','ds-chip ds-chip-accent') + control('alt-chip','ds-chip ds-chip-alt') +
      '<section class="audit-case ds-card" data-audit="status-card"><span class="audit-label ds-status success">Success feedback</span><span class="audit-label ds-status danger">Danger feedback</span></section>';
    window.__themeAuditFrame = frame;
    return DesignSystemThemeRegistry.themes.map((theme)=>theme.id);
  })()`);
  const reports = [], images = [];
  for (const id of ids) {
    const samples = await evaluate(`(() => {
      const d = __themeAuditFrame.contentDocument;
      d.documentElement.classList.remove('audit-sampling');
      d.documentElement.setAttribute('data-theme', ${JSON.stringify(id)});
      const rgba = (css) => { const c=document.createElement('canvas'); c.width=c.height=1; const x=c.getContext('2d'); x.fillStyle=css; x.fillRect(0,0,1,1); return [...x.getImageData(0,0,1,1).data].map((n)=>n/255); };
      return [...d.querySelectorAll('[data-audit]')].map((el) => {
        const r=el.getBoundingClientRect();
        const labels=el.querySelectorAll('.audit-label');
        const colors=labels.length ? [...labels].map((label)=>({ text:label.textContent, rgba:rgba(getComputedStyle(label).color) })) : [{text:el.value,rgba:rgba(getComputedStyle(el).color)}];
        return { id:el.dataset.audit, radius:Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius)||0,r.width/2,r.height/2), rect:{x:r.x,y:r.y,width:r.width,height:r.height}, colors };
      });
    })()`);
    images.push({ id, data: (await send('Page.captureScreenshot', { format: 'png' }, session)).data });
    await evaluate(`__themeAuditFrame.contentDocument.documentElement.classList.add('audit-sampling')`);
    const blank = await send('Page.captureScreenshot', { format: 'png' }, session);
    const result = await evaluate(`(async () => {
      const image=new Image(); image.src='data:image/png;base64,'+${JSON.stringify(blank.data)}; await image.decode();
      const canvas=document.createElement('canvas'); canvas.width=image.width; canvas.height=image.height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true}); ctx.drawImage(image,0,0);
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      const ratio=DesignSystemThemeContrast.ratio;
      return ${JSON.stringify(samples)}.map((sample)=>{
        const minima=sample.colors.map(()=>Infinity);
        for(let y=0;y<9;y++) for(let x=0;x<17;x++) {
          const px=Math.round(sample.rect.x+8+(sample.rect.width-16)*x/16);
          const py=Math.round(sample.rect.y+8+(sample.rect.height-16)*y/8);
          if(px<0||py<0||px>=canvas.width||py>=canvas.height) continue;
          const lx=px-sample.rect.x,ly=py-sample.rect.y,r=sample.radius;
          const cx=lx<r?r:lx>sample.rect.width-r?sample.rect.width-r:lx;
          const cy=ly<r?r:ly>sample.rect.height-r?sample.rect.height-r:ly;
          if(Math.hypot(lx-cx,ly-cy)>r-4 && (cx!==lx||cy!==ly)) continue;
          const owner=__themeAuditFrame.contentDocument;
          const element=owner.querySelector('[data-audit="'+sample.id+'"]');
          const hit=owner.elementFromPoint(px,py);
          if (!hit || (hit!==element && !element.contains(hit))) continue;
          const offset=(py*canvas.width+px)*4;
          const bg=[pixels[offset]/255,pixels[offset+1]/255,pixels[offset+2]/255,1];
          sample.colors.forEach((color,i)=>{ const fg=color.rgba.map((v,k)=>k<3?v*color.rgba[3]+bg[k]*(1-color.rgba[3]):1); minima[i]=Math.min(minima[i],ratio(fg,bg)); });
        }
        return { surface:sample.id, foregrounds:sample.colors.map((color,i)=>({text:color.text,minimumRatio:Number.isFinite(minima[i])?+minima[i].toFixed(3):null})) };
      });
    })()`);
    reports.push({ id, surfaces: result, failures: result.flatMap((surface) => surface.foregrounds.filter((entry) => entry.minimumRatio === null || entry.minimumRatio < 4.5).map((entry) => ({ surface: surface.surface, ...entry }))) });
  }
  const sheet = await evaluate(`(async () => {
    const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=${Math.ceil(images.length / 4) * 275};
    const ctx=canvas.getContext('2d');ctx.fillStyle='#16191d';ctx.fillRect(0,0,canvas.width,canvas.height);
    const images=${JSON.stringify(images)};
    for(let i=0;i<images.length;i++) { const image=new Image();image.src='data:image/png;base64,'+images[i].data;await image.decode();const x=(i%4)*360,y=Math.floor(i/4)*275;ctx.drawImage(image,x,y+25,360,250);ctx.fillStyle='#fff';ctx.font='14px sans-serif';ctx.fillText(images[i].id,x+8,y+18); }
    return canvas.toDataURL('image/png').split(',')[1];
  })()`);
  const output = path.join(root, '_docs/data');
  fs.writeFileSync(path.join(output, 'theme-surfaces' + suffix + '.png'), Buffer.from(sheet, 'base64'));
  fs.writeFileSync(path.join(output, 'theme-rendering-audit' + suffix + '.json'), JSON.stringify({ method: '153 interior background samples per surface at 1440x1000, text hidden for raster samples, normal resting state, optional web fonts blocked. Rounded inset highlight/border bands are excluded with a 4px curved-boundary guard. Conservative small-text threshold 4.5; sample coverage is not exhaustive accessibility certification.', themes: reports }, null, 2) + '\n');
  console.log(JSON.stringify(reports.map(({ id, failures }) => ({ id, failures })), null, 2));
  if (!suffix && reports.some((theme) => theme.failures.length)) throw new Error('Rendered surface audit found contrast failures; inspect _docs/data/theme-rendering-audit.json');
}
module.exports = { auditRendering };
