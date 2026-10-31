const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

exports.testComponentLayout = async ({ evaluate, send, session, root }) => {
  await evaluate(`(() => {
    DesignSystemStudioShell.activatePanel('components');
    const style = document.createElement('style'); style.textContent = '* {transition:none!important;scroll-behavior:auto!important}'; document.head.append(style);
  })()`);
  const directory = path.resolve(root, '../_docs/data/component-layout'); fs.mkdirSync(directory, { recursive: true });
  await send('Input.dispatchMouseEvent', { type:'mouseMoved', x:2, y:2 }, session);
  assert.equal(await evaluate(`document.documentElement.dataset.utilityInput`), 'mouse', 'real mouse input overrides a no-hover hardware report');
  for (const kind of ['visibility', 'lock']) {
    const header = await evaluate(`(() => {
      const card = document.getElementById('inspectorUtilityDemo'); card.scrollIntoView({block:'center'});
      const rect = card.querySelector('header').getBoundingClientRect(); return {x:rect.x+20,y:rect.y+rect.height/2};
    })()`);
    await send('Input.dispatchMouseEvent', {type:'mouseMoved', ...header}, session);
    assert.equal(await evaluate(`[...document.querySelectorAll('[data-utility-toggle]')].every((button) => getComputedStyle(button).opacity === '0')`), true, 'card header does not reveal row actions');

    const point = await evaluate(`(() => {
      const button = document.querySelector('[data-utility-toggle="${kind}"]');
      const scope = button.closest('.ds-utility-scope'); scope.scrollIntoView({ block: 'center' });
      const rect = scope.getBoundingClientRect();
      return { x: rect.x + 20, y: rect.y + rect.height / 2 };
    })()`);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point }, session);
    const hover = await evaluate(`(() => {
      const button = document.querySelector('[data-utility-toggle="${kind}"]'), row = button.closest('.ds-utility-demo-item');
      const rect = button.getBoundingClientRect(), style = getComputedStyle(button);
      return { rowHover: row.matches(':hover'), scopeHover: button.closest('.ds-utility-scope').matches(':hover'), opacity: style.opacity, pointer: style.pointerEvents,
        x: rect.x + rect.width/2, y: rect.y + rect.height/2, width: rect.width, height: rect.height,
        hit: document.elementFromPoint(rect.x + rect.width/2, rect.y + rect.height/2)?.closest('button') === button };
    })()`);
    console.log(kind + ' hover: ' + JSON.stringify(hover));
    assert.equal(hover.rowHover, true, kind + ' pointer is over the owning row');
    assert.equal(hover.scopeHover, true, kind + ' parent row is the hover trigger');
    assert.equal(hover.opacity, '1', kind + ' parent hover reveals its action');
    assert.ok(hover.hit && hover.width > 0 && hover.height > 0, kind + ' revealed action is hit-testable');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-utility-toggle="${kind === 'lock' ? 'visibility' : 'lock'}"]')).opacity`), '0', 'hovering one row does not reveal its sibling');
    const beforeGlyph = await evaluate(`document.querySelector('[data-utility-toggle="${kind}"]').innerHTML`);
    if (kind === 'lock') {
      const image = await send('Page.captureScreenshot', { format:'png', clip:{ x:hover.x-hover.width/2, y:hover.y-hover.height/2, width:hover.width, height:hover.height, scale:3 } }, session);
      fs.writeFileSync(path.join(directory,'lock-unlocked.png'),Buffer.from(image.data,'base64'));
    }
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hover.x, y: hover.y }, session);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: hover.x, y: hover.y, button: 'left', clickCount: 1 }, session);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: hover.x, y: hover.y, button: 'left', clickCount: 1 }, session);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 }, session);
    assert.equal(await evaluate(`(() => {
      const button = document.querySelector('[data-utility-toggle="${kind}"]');
      return button.getAttribute('aria-pressed') === 'true' && getComputedStyle(button).opacity === '1';
    })()`), true, kind + ' click toggles and keeps active icon visible');
    assert.notEqual(await evaluate(`document.querySelector('[data-utility-toggle="${kind}"]').innerHTML`), beforeGlyph, kind + ' changes glyph on activation');
    assert.equal(await evaluate(`(() => {
      const other = document.querySelector('[data-utility-toggle="${kind === 'lock' ? 'visibility' : 'lock'}"]');
      return other.getAttribute('aria-pressed') === 'false' && getComputedStyle(other).opacity === '0';
    })()`), true, 'mouse focus must not reveal other default-state actions');
    if (kind === 'lock') {
      const image = await send('Page.captureScreenshot', { format:'png', clip:{ x:hover.x-hover.width/2, y:hover.y-hover.height/2, width:hover.width, height:hover.height, scale:3 } }, session);
      fs.writeFileSync(path.join(directory,'lock-locked.png'),Buffer.from(image.data,'base64'));
    }
    await send('Input.dispatchMouseEvent', { type:'mouseMoved', x:hover.x, y:hover.y }, session);
    await send('Input.dispatchMouseEvent', { type:'mousePressed', x:hover.x, y:hover.y, button:'left', clickCount:1 }, session);
    await send('Input.dispatchMouseEvent', { type:'mouseReleased', x:hover.x, y:hover.y, button:'left', clickCount:1 }, session);
    await send('Input.dispatchMouseEvent', { type:'mouseMoved', x:2, y:2 }, session);
    assert.equal(await evaluate(`[...document.querySelectorAll('[data-utility-toggle]')].every((button) => button.getAttribute('aria-pressed') === 'false' && getComputedStyle(button).opacity === '0')`), true, 'reset defaults disappear after pointer leaves, without blur');

  }
  await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Tab', code:'Tab', windowsVirtualKeyCode:9, modifiers:8 }, session);
  await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Tab', code:'Tab', windowsVirtualKeyCode:9, modifiers:8 }, session);
  assert.equal(await evaluate(`document.activeElement.matches('[data-utility-toggle="visibility"]:focus-visible') && getComputedStyle(document.activeElement).opacity === '1' && getComputedStyle(document.querySelector('[data-utility-toggle="lock"]')).opacity === '0'`), true, 'real keyboard navigation reveals only the owning row');
  const capture = await send('Page.captureScreenshot', { format: 'png' }, session);
  fs.writeFileSync(path.join(directory, 'utility-hover.png'), Buffer.from(capture.data, 'base64'));
  const compact = await evaluate(`(() => {
    const inspector = document.getElementById('inspectorUtilityDemo').closest('.custom-demo-group');
    const spatial = inspector.nextElementSibling;
    const master = spatial.nextElementSibling;
    const a = inspector.getBoundingClientRect(), b = spatial.getBoundingClientRect(), c = master.getBoundingClientRect();
    return { a: { x:a.x, y:a.y, width:a.width }, b: { x:b.x, y:b.y, width:b.width }, masterWidth:c.width, heading: spatial.querySelector('h4').textContent };
  })()`);
  assert.equal(compact.heading, 'Spatial Control Pads');
  assert.ok(Math.abs(compact.a.y-compact.b.y) < 1 && compact.b.x > compact.a.x, 'compact examples share a row: ' + JSON.stringify(compact));
  assert.ok(compact.masterWidth > compact.a.width*1.8, 'data-heavy control panel retains full width');
  for (const width of [1440,1200,900,390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false }, session);
    const geometry = await evaluate(`(() => {
      const viewport = document.querySelector('#panel-components .studio-workspace-main');
      return { width: viewport.clientWidth, scrollWidth: viewport.scrollWidth, documentWidth: document.documentElement.scrollWidth, innerWidth };
    })()`);
    assert.ok(geometry.scrollWidth <= geometry.width + 1 && geometry.documentWidth <= geometry.innerWidth + 1, width + 'px keeps gallery within viewport: ' + JSON.stringify(geometry));
    if (width === 1440 || width === 390) {
      await evaluate(`document.getElementById('inspectorUtilityDemo').scrollIntoView({block:'start'})`);
      const capture = await send('Page.captureScreenshot', { format:'png' }, session);
      fs.writeFileSync(path.join(directory, 'components-' + width + '.png'), Buffer.from(capture.data, 'base64'));
    }
  }
  await send('Emulation.setTouchEmulationEnabled', { enabled:true, maxTouchPoints:1 }, session);
  await send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{x:20,y:100}] }, session);
  await send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] }, session);
  assert.equal(await evaluate(`document.documentElement.dataset.utilityInput === 'touch' && [...document.querySelectorAll('[data-utility-toggle]')].every((button) => getComputedStyle(button).opacity === '1')`), true, 'real touch input exposes actions');
  await send('Emulation.setTouchEmulationEnabled', { enabled:false }, session);
  await send('Input.dispatchMouseEvent', { type:'mouseMoved', x:3, y:3 }, session);
  assert.equal(await evaluate(`document.documentElement.dataset.utilityInput`), 'mouse', 'switching back to a mouse restores hover input mode');
  console.log('PASS parent-row mouse reveal and sibling isolation, hit testing, click/state persistence, compact groups and responsive gallery');
};
