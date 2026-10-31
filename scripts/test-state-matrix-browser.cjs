const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

exports.testStateMatrix = async ({ evaluate, send, session, root }) => {
  await send('DOM.enable', {}, session);
  await send('CSS.enable', {}, session);
  await evaluate(`(() => {
    DesignSystemStudioShell.activatePanel('components');
    // Headless Edge reports no hover device. Disable only that fallback to test
    // desktop reveal behavior, then restore it for the touch-device assertion.
    const rules = (sheet) => {
      try { return [...sheet.cssRules].flatMap((rule) => [rule, ...(rule.styleSheet ? rules(rule.styleSheet) : rule.cssRules ? rules(rule) : [])]); }
      catch (_) { return []; } // External font imports are not local component rules.
    };
    window.noHoverRules = [...document.styleSheets].flatMap(rules).filter((rule) => rule.media && rule.conditionText === '(any-hover: none)');
    if (!noHoverRules.length) throw new Error('No-hover accessibility fallback was not located');
    noHoverRules.forEach((rule) => { rule.media.mediaText = 'not all'; });
    const style = document.createElement('style');
    style.textContent = '* { transition:none!important; animation:none!important; }';
    document.head.append(style);
    const fixture = document.createElement('div');
    fixture.id = 'tabStateFixture'; fixture.className = 'ds-tablist'; fixture.style.margin = '0';
    fixture.innerHTML = '<button class="ds-tab" aria-selected="false">Inactive</button><button class="ds-tab" aria-selected="true">Selected</button>';
    document.querySelector('.component-library-flow').prepend(fixture);
  })()`);
  const documentNode = await send('DOM.getDocument', {}, session);
  const actual = (await send('DOM.querySelectorAll', {
    nodeId: documentNode.root.nodeId, selector: '.button-state-matrix tbody tr td:first-of-type button'
  }, session)).nodeIds;
  assert.equal(actual.length, 4, 'four button variants have table rows');
  const themes = await evaluate('DesignSystemThemeRegistry.themes.map((theme) => theme.id)');
  const failures = [];
  const tabRatios = [];
  for (const theme of themes) {
    await evaluate(`(() => {
      const select = document.getElementById('themeSelect'); select.value = ${JSON.stringify(theme)}; select.dispatchEvent(new Event('change'));
    })()`);
    for (const [column, pseudo] of [[2, ['hover']], [3, ['hover', 'active']], [4, ['focus', 'focus-visible']]]) {
      await Promise.all(actual.map((nodeId) => send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: pseudo }, session)));
      failures.push(...await evaluate(`(() => {
        const properties = ['backgroundColor','backgroundImage','borderTopColor','color','webkitTextFillColor','boxShadow','transform','outlineStyle','outlineWidth','outlineColor','outlineOffset'];
        return [...document.querySelectorAll('.button-state-matrix tbody tr')].flatMap((row) => {
          const live = getComputedStyle(row.querySelector('td button'));
          const sample = getComputedStyle(row.querySelectorAll('td button')[${column - 1}]);
          return properties.filter((key) => live[key] !== sample[key]).map((key) => ${JSON.stringify(theme)} + ' ' + row.querySelector('th').textContent + ' ${pseudo.join('+')} ' + key + ': ' + live[key] + ' != ' + sample[key]);
        });
      })()`));
    }
    await Promise.all(actual.map((nodeId) => send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] }, session)));
    tabRatios.push(await evaluate(`(() => {
      const [off,on] = [...document.querySelectorAll('#tabStateFixture button')].map((el) => getComputedStyle(el));
      const contrast = DesignSystemThemeContrast;
      for (const row of document.querySelectorAll('.button-state-matrix tbody tr')) {
        const buttons = row.querySelectorAll('td button');
        const hover = getComputedStyle(buttons[1]), pressed = getComputedStyle(buttons[2]);
        if (hover.boxShadow === pressed.boxShadow && hover.transform === pressed.transform && hover.outlineStyle === pressed.outlineStyle && hover.outlineOffset === pressed.outlineOffset) throw new Error(${JSON.stringify(theme)} + ' ' + row.querySelector('th').textContent + ' lacks distinct pressure feedback');
      }
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      const color = (value) => { context.clearRect(0,0,1,1); context.fillStyle = value; context.fillRect(0,0,1,1); return [...context.getImageData(0,0,1,1).data].map((v) => v/255); };
      const ratio = (fg,bg) => contrast.ratio(color(fg),color(bg));
      return { theme: ${JSON.stringify(theme)}, label: ratio(off.color,off.backgroundColor), inactive: ratio(off.borderTopColor,off.backgroundColor), selectedWeight: Number(on.fontWeight), inactiveWeight: Number(off.fontWeight) };
    })()`));
  }
  assert.deepEqual(failures, [], 'real browser pseudo states match every matrix specimen');
  for (const tab of tabRatios) {
    assert.ok(tab.label >= 4.49, tab.theme + ' inactive tab label stays readable');
    assert.ok(tab.selectedWeight > tab.inactiveWeight, tab.theme + ' selection has stronger text weight');
    assert.ok(tab.inactive < 4.5, tab.theme + ' decorative inactive border is quieter than text');
  }
  await evaluate(`(() => {
    const select = document.getElementById('themeSelect'); select.value = 'steel-night'; select.dispatchEvent(new Event('change'));
    const utility = document.querySelector('[data-utility-toggle="visibility"]');
    for (let node = utility; node; node = node.parentElement) { node.hidden = false; if (node.tagName === 'DETAILS') node.open = true; }
    document.activeElement.blur();
    const check = (value,message) => { if (!value) throw new Error(message); };
    check(utility.getAttribute('aria-pressed') === 'false' && getComputedStyle(utility).opacity === '0', 'Visible overlay is the quiet default: pressed=' + utility.getAttribute('aria-pressed') + ' opacity=' + getComputedStyle(utility).opacity + ' hover=' + matchMedia('(hover:hover)').matches);
    utility.focus();
    check(getComputedStyle(utility).opacity === '1', 'Keyboard focus reveals utility');
    const visibleGlyph = utility.innerHTML;
    utility.click(); utility.blur();
    check(utility.getAttribute('aria-pressed') === 'true' && getComputedStyle(utility).opacity === '1', 'Hidden overlay persists at rest');
    check(utility.innerHTML !== visibleGlyph && utility.title === 'Show overlay', 'Hidden glyph and next action agree');
    utility.click(); utility.blur();
    check(getComputedStyle(utility).opacity === '0', 'Visible overlay returns to quiet rest');
    const lock = document.querySelector('[data-utility-toggle="lock"]');
    check(lock.getAttribute('aria-pressed') === 'false' && getComputedStyle(lock).opacity === '0', 'Unlocked is the quiet default');
    lock.focus(); lock.click(); lock.blur();
    check(getComputedStyle(lock).opacity === '1' && lock.title === 'Unlock controls', 'Locked icon persists');
    lock.click(); lock.blur();
  })()`);
  await evaluate(`(() => {
    noHoverRules.forEach((rule) => { rule.media.mediaText = '(any-hover: none)'; });
    if (matchMedia('(any-hover:none)').matches && [...document.querySelectorAll('[data-utility-toggle]')].some((button) => getComputedStyle(button).opacity !== '1')) {
      throw new Error('Non-hover devices must expose utility actions');
    }
  })()`);
  const layout = await evaluate(`(() => {
    document.querySelector('#panel-components .studio-workspace-main').scrollTop = 0;
    const side = document.querySelector('.studio-context-body');
    const sideParent = document.querySelector('.studio-context');
    const panel = document.getElementById('panel-components');
    const viewport = panel.querySelector('.studio-workspace-main');
    return { sideWidth: side.clientWidth, sideScrollWidth: side.scrollWidth, sideHeight: side.clientHeight, sideParentHeight: sideParent.clientHeight, width: viewport.clientWidth, scrollWidth: viewport.scrollWidth, height: viewport.clientHeight, availableHeight: panel.clientHeight,
      nestedScroll: [...panel.querySelectorAll('.component-stage, .component-block')].filter((el) => /auto|scroll/.test(getComputedStyle(el).overflowY)).length };
  })()`);
  assert.ok(layout.scrollWidth <= layout.width + 1, 'gallery has no horizontal overflow: ' + JSON.stringify(layout));
  assert.ok(layout.height > layout.availableHeight * .75, 'gallery uses available height: ' + JSON.stringify(layout));
  assert.equal(layout.nestedScroll, 0, 'component cards do not introduce nested vertical scroll areas');
  assert.ok(layout.sideScrollWidth <= layout.sideWidth + 1 && layout.sideHeight > layout.sideParentHeight * .8, 'Sidebar uses available height without horizontal scrolling: ' + JSON.stringify(layout));
  const directory = path.resolve(root, '../_docs/data/state-matrix'); fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'tab-contrast.json'), JSON.stringify(tabRatios, null, 2) + '\n');
  const capture = await send('Page.captureScreenshot', { format: 'png' }, session);
  fs.writeFileSync(path.join(directory, 'components-desktop.png'), Buffer.from(capture.data, 'base64'));
  for (const width of [1200, 900, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, session);
    const geometry = await evaluate(`(() => {
      const viewport = document.querySelector('#panel-components .studio-workspace-main');
      return { overflow: [...viewport.querySelectorAll('*')].filter((el) => !el.closest('.button-state-scroll') && el.getBoundingClientRect().right > viewport.getBoundingClientRect().right + 1).map((el) => el.className).slice(0,12), width: viewport.clientWidth, scrollWidth: viewport.scrollWidth, documentWidth: document.documentElement.scrollWidth, innerWidth };
    })()`);
    assert.ok(geometry.scrollWidth <= geometry.width + 1 && geometry.documentWidth <= geometry.innerWidth + 1, width + 'px gallery contains overflow in its table: ' + JSON.stringify(geometry));
    if (width === 390) {
      await evaluate(`document.querySelector('.button-state-matrix').scrollIntoView({block:'start'})`);
      const mobile = await send('Page.captureScreenshot', { format: 'png' }, session);
      fs.writeFileSync(path.join(directory, 'components-mobile.png'), Buffer.from(mobile.data, 'base64'));
    }
  }
  console.log('PASS 21-theme real/simulated button states, readable quiet tabs, utility defaults and gallery geometry');
};
