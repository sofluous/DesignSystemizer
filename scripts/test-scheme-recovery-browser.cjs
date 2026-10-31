const assert = require('node:assert/strict');

async function testSchemeRecovery({ evaluate, send, session, url }) {
  await evaluate(`(async () => {
    const select = document.getElementById('themeSelect');
    select.value = 'signal-diagram'; select.dispatchEvent(new Event('change'));
    await new Promise((resolve) => setTimeout(resolve, 350));
    const editor = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root: document.documentElement }).themeSession;
    const recipe = editor.recipe;
    const oldColors = {
      '--ds-tab-fg': '#ffffff', '--ds-tab-border': '#ffffff',
      '--ds-btn-bg': 'linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 74%, white 26%) 0%, var(--ds-accent) 100%)',
      '--ds-btn-bg-hover': 'linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 64%, white 36%) 0%, color-mix(in oklab, var(--ds-accent) 88%, white 12%) 100%)',
      '--ds-btn-border': 'var(--ds-text)', '--ds-btn-text': '#101114',
      '--ds-btn-primary-bg': 'var(--ds-text)',
      '--ds-btn-primary-bg-hover': 'color-mix(in oklab, var(--ds-text) 88%, var(--ds-accent) 12%)',
      '--ds-btn-primary-border': 'color-mix(in oklab, var(--ds-text) 72%, var(--ds-accent) 28%)',
      '--ds-btn-primary-text': 'var(--ds-bg-elevated)',
      '--ds-btn-primary-text-hover': '#ffffff', '--ds-btn-primary-text-selected': '#ffffff'
    };
    const overrides = { '--ds-radius-2': '19px', '--ds-btn-shadow': '0 0 3px #123456' };
    const tokens = editor.validate({ recipe, overrides: { ...oldColors, ...overrides } });
    const key = DesignSystemStudioThemeDrafts.storageKey;
    const saved = JSON.parse(localStorage.getItem(key));
    saved.drafts['signal-diagram'] = { schemaVersion: 1, themeName: 'saved-diagram', baseTheme: 'signal-diagram', layers: recipe, overrides, tokens };
    localStorage.setItem(key, JSON.stringify(saved));
  })()`);
  async function reload(suffix) {
    await send('Page.navigate', { url: url + '/index.html?' + suffix }, session);
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`location.search === '?${suffix}' && document.readyState === 'complete' && !!window.DesignSystemStudioPageBootstrap`)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Scheme recovery reload timed out');
  }
  await reload('old-scheme-draft');
  assert.equal(await evaluate(`(async () => {
    DesignSystemStudioShell.activatePanel('builder');
    const editor = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root: document.documentElement }).themeSession;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    check(editor.tokens['--ds-btn-primary-bg'] === 'var(--ds-text)', 'Old snapshot reproduces black primary despite updated source');
    check(!document.getElementById('schemeColorNotice').hidden, 'Saved button override is explained');
    const before = JSON.stringify(editor.snapshot());
    const restore = document.getElementById('restoreSchemeColorsBtn');
    const frame = document.getElementById('builderPreviewFrame');
    const primary = frame.contentDocument.createElement('button');
    primary.className = 'ds-btn ds-btn-primary';
    primary.style.setProperty('transition', 'none', 'important');
    frame.contentDocument.body.append(primary);
    const paint = () => frame.contentWindow.getComputedStyle(primary).backgroundImage;
    check(!paint().includes('linear-gradient'), 'Old primary renders as a solid dark paint');
    restore.click();
    check(editor.tokens['--ds-btn-primary-bg'].includes('var(--ds-accent)'), 'Updated primary uses accent');
    check(editor.tokens['--ds-btn-bg'] === 'var(--ds-text)', 'Updated secondary uses ink');
    check(!Object.hasOwn(editor.overrides, '--ds-tab-fg') && !Object.hasOwn(editor.overrides, '--ds-tab-border'), 'Updated tab colors replace old snapshot overrides');
    check(paint().includes('linear-gradient'), 'Updated primary visibly renders accent gradient');
    check(editor.tokens['--ds-radius-2'] === '19px' && editor.tokens['--ds-btn-shadow'] === '0 0 3px #123456', 'Other edits survive');
    check(document.getElementById('schemeColorNotice').hidden, 'Recovery notice clears');
    check(document.activeElement.id === 'undoThemeEditBtn', 'Focus moves to Undo after hidden action');
    document.getElementById('undoThemeEditBtn').click();
    check(JSON.stringify(editor.snapshot()) === before && !document.getElementById('schemeColorNotice').hidden, 'Recovery is undoable');
    restore.click();
    primary.remove();
    await new Promise((resolve) => setTimeout(resolve, 350));
    return true;
  })()`), true);
  await reload('updated-scheme-draft');
  assert.equal(await evaluate(`(() => {
    const editor = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root: document.documentElement }).themeSession;
    return editor.recipe.scheme === 'signal-diagram' && editor.tokens['--ds-btn-primary-bg'].includes('var(--ds-accent)') &&
      editor.tokens['--ds-radius-2'] === '19px' && editor.tokens['--ds-btn-shadow'] === '0 0 3px #123456' &&
      document.getElementById('schemeColorNotice').hidden;
  })()`), true, 'Updated scheme and unrelated edits persist after reload');
}

module.exports = { testSchemeRecovery };
