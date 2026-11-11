const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadModel } = require('./build-themes.cjs');
const { context, composer, data, defaults } = loadModel();
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/studio-theme-drafts.js'), 'utf8'), context);
const api = context.window.DesignSystemStudioThemeDrafts;
const session = context.window.DesignSystemThemeComposer.createSession(composer);
const recipe = data.baseThemePresetMap['steel-night'];
session.load({ recipe, overrides: {} });
const before = JSON.stringify(session.snapshot());
const exported = { schemaVersion: 1, baseTheme: 'steel-night', layers: recipe, overrides: {}, tokens: session.tokens };
const decoded = api.decodeRecipe(exported, session);
assert.equal(decoded.themeName, 'steel-night', 'legacy package without themeName opens');
assert.equal(decoded.compatibilityOverrides, 0);
assert.equal(JSON.stringify(session.snapshot()), before, 'decode does not mutate active draft');
const drift = { ...exported, tokens: { ...exported.tokens, '--ds-card-shadow': '0 0 7px #123456' } };
const restored = api.decodeRecipe(drift, session);
assert.equal(restored.compatibilityOverrides, 1);
assert.deepEqual(JSON.parse(JSON.stringify(session.validate(restored.state))), JSON.parse(JSON.stringify(drift.tokens)), 'drift restores exact raw token snapshot');
const oldSession = context.window.DesignSystemThemeComposer.createSession(composer);
oldSession.load({ recipe, overrides: { '--ds-accent': 'var(--ds-text)' } });
const migratedCycle = api.decodeRecipe({ ...exported, layers: { ...recipe, scheme: 'eva-wire-alert' }, overrides: oldSession.overrides, tokens: oldSession.tokens }, session);
assert.equal(session.validate(migratedCycle.state)['--ds-text'], oldSession.tokens['--ds-text'], 'saved snapshot reconciles a reference cycle introduced by changed presets');
// Frozen pre-consolidation definitions exercise real old font/scale combinations.
const legacyType = require('./fixtures/legacy-typography.json');
const legacyData = { ...data, typographyPresets: { ...data.typographyPresets, ...legacyType }, typographyAliases: {} };
const presetUtils = context.window.DesignSystemStudioBuilderPresets.initBuilderPresets(legacyData);
const legacyComposer = context.window.DesignSystemThemeComposer.createComposer(legacyData,
  defaults, presetUtils.buildColorBundle);
assert.deepEqual(Object.keys(legacyType).sort(), Object.keys(data.typographyAliases).sort(), 'every retired Type has migration coverage');
for (const [oldId, target] of Object.entries(data.typographyAliases)) {
  const legacySession = context.window.DesignSystemThemeComposer.createSession(legacyComposer);
  const oldRecipe = { ...recipe, typography: oldId };
  const edits = { '--ds-card-shadow': '0 0 9px #123456', '--ds-font-mono': '"My Code Face", monospace' };
  legacySession.load({ recipe: oldRecipe, overrides: edits });
  const oldExport = { ...exported, layers: oldRecipe, overrides: edits, tokens: legacySession.tokens };
  const oldSource = JSON.stringify(oldExport);
  const migrated = api.decodeRecipe(oldExport, session);
  assert.equal(migrated.state.recipe.typography, target, oldId + ' becomes a current selection');
  assert.deepEqual(JSON.parse(JSON.stringify(session.validate(migrated.state))), JSON.parse(JSON.stringify(oldExport.tokens)), oldId + ' retains exact saved appearance');
  assert.equal(JSON.stringify(oldExport), oldSource, oldId + ' import leaves source untouched');
  assert.equal(migrated.state.overrides['--ds-card-shadow'], edits['--ds-card-shadow'], oldId + ' preserves edits');
  const reopened = context.window.DesignSystemThemeComposer.createSession(composer);
  reopened.load(migrated.state);
  reopened.select({ ...reopened.recipe, typography: 'rr4-arcade' });
  assert.equal(reopened.overrides['--ds-font-mono'], edits['--ds-font-mono'], oldId + ' preserves edits on module changes');
  reopened.undo();
  assert.equal(reopened.recipe.typography, target, oldId + ' undo retains canonical selection');
  reopened.reset();
  assert.equal(Object.keys(reopened.overrides).length, 0, oldId + ' reset adopts consolidated Type');
  const withoutSnapshot = { ...oldExport }; delete withoutSnapshot.tokens;
  const mapped = api.decodeRecipe(withoutSnapshot, session);
  assert.equal(mapped.state.recipe.typography, target, oldId + ' maps without a saved snapshot');
  assert.deepEqual(JSON.parse(JSON.stringify(mapped.state.overrides)), edits, oldId + ' snapshotless mapping keeps only explicit edits');
  assert.equal(JSON.stringify(session.snapshot()), before, oldId + ' decode is transactional');
}
const typeKeysForIdentity = new Set(['--ds-font-sans', '--ds-font-mono', '--ds-fs-1', '--ds-fs-2', '--ds-fs-3', '--ds-fs-4', '--ds-fs-5', '--ds-lh-base']);
// Frozen definitions reconstruct actual pre-portable defaults and mixed recipes.
const previousType = require('./fixtures/pre-portable-type.json');
const previousData = { ...data, typographyPresets: { ...data.typographyPresets, ...previousType.typographyPresets } };
const previousUtils = context.window.DesignSystemStudioBuilderPresets.initBuilderPresets(previousData);
const previousComposer = context.window.DesignSystemThemeComposer.createComposer(previousData, defaults, previousUtils.buildColorBundle);
const expectedChanges = ['candy-spectrum', 'eva-wireframe', 'holo-nocturne', 'oilslick-nacre', 'saturn-alloy', 'type-four-sprint'];
const actualChanges = [];
for (const [baseTheme, previousRecipe] of Object.entries(previousType.baseThemePresetMap)) {
  const oldTokens = previousComposer.compose(previousRecipe).tokens;
  const currentTokens = composer.compose(data.baseThemePresetMap[baseTheme]).tokens;
  const changed = Object.keys(oldTokens).filter(token => oldTokens[token] !== currentTokens[token]);
  if (changed.length) actualChanges.push(baseTheme);
  assert.ok(changed.every(token => typeKeysForIdentity.has(token)), baseTheme + ' changes only Type-owned properties');
  const edits = { '--ds-card-shadow': '0 0 9px #123456', '--ds-font-mono': '"Personal Code", monospace' };
  const oldState = context.window.DesignSystemThemeComposer.createSession(previousComposer);
  oldState.load({ recipe: previousRecipe, overrides: edits });
  const imported = api.decodeRecipe({ schemaVersion: 1, baseTheme, layers: previousRecipe, overrides: edits, tokens: oldState.tokens }, session);
  const reopened = context.window.DesignSystemThemeComposer.createSession(composer);
  reopened.load(imported.state);
  assert.deepEqual(JSON.parse(JSON.stringify(reopened.tokens)), JSON.parse(JSON.stringify(oldState.tokens)), baseTheme + ' keeps old default snapshot and edits');
  reopened.select({ ...reopened.recipe, typography: 'precision-ui' });
  assert.equal(reopened.tokens['--ds-font-mono'], edits['--ds-font-mono'], baseTheme + ' preserves explicit code font through module change');
  reopened.undo();
  assert.deepEqual(JSON.parse(JSON.stringify(reopened.tokens)), JSON.parse(JSON.stringify(oldState.tokens)), baseTheme + ' Undo restores exact imported snapshot');
}
assert.deepEqual(actualChanges.sort(), expectedChanges.sort(), 'only the six intended defaults change');
assert.equal(new Set(Object.values(data.baseThemePresetMap).map(recipe => recipe.typography)).size, 12, 'all twelve distinct Type options are used by defaults');
for (const id of Object.keys(previousType.typographyPresets)) {
  const mixed = { ...recipe, typography: id, scheme: 'standard', texture: 'clean' };
  const oldTokens = previousComposer.compose(mixed).tokens;
  const imported = api.decodeRecipe({ ...exported, layers: mixed, overrides: {}, tokens: oldTokens }, session);
  assert.deepEqual(JSON.parse(JSON.stringify(session.validate(imported.state))), JSON.parse(JSON.stringify(oldTokens)), id + ' preserves a saved mixed recipe');
}
for (const typography of ['missing-type', 'constructor', '__proto__']) {
  assert.throws(() => api.decodeRecipe({ ...exported, layers: { ...recipe, typography } }, session), /Unknown typography/);
}
for (const invalid of [
  { ...exported, schemaVersion: 2 },
  { ...exported, generator: { contractVersion: 2 } },
  { ...exported, layers: { ...recipe, style: 'constructor' } },
  { ...exported, layers: { ...recipe, family: '__proto__' } },
  { ...exported, overrides: [] },
  { ...exported, overrides: { '--ds-text': 42 } },
  { ...exported, overrides: { '--ds-text': 'red; } body {display:none' } },
  { ...exported, overrides: { '--ds-text': 'var(--ds-text)' } },
  { ...exported, overrides: { '--ds-text': 'var(--missing)' } },
  { ...exported, overrides: { '--ds-btn-paint-image': 'none' } },
  { ...exported, overrides: JSON.parse('{"__proto__":"bad"}') },
  { ...exported, tokens: { ...exported.tokens, '--ds-no-such-token': 'red' } },
  { ...exported, tokens: { ...exported.tokens, '--ds-btn-paint-image': 'none' } },
  { ...drift, overrides: { '--ds-card-shadow': 'none' } },
]) assert.throws(() => api.decodeRecipe(invalid, session));
assert.throws(() => api.parse('{unfinished'), /JSON/);
assert.throws(() => api.parse(' '.repeat(api.maxFileBytes + 1)), /limit/);
assert.equal(JSON.stringify(session.snapshot()), before);

const memory = new Map();
let quota = false;
const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => {
  if (quota) throw new Error('Quota exceeded');
  memory.set(key, value);
} };
const first = api.createStore(() => storage), second = api.createStore(() => storage);
first.load(); second.load();
first.save('steel-night', exported);
second.save('paper-mint', exported);
assert.equal(Object.keys(JSON.parse(memory.get(api.storageKey)).drafts).length, 2, 'other theme changes merge');
assert.throws(() => second.save('steel-night', drift), /another tab/);
const fresh = api.createStore(() => storage);
const loaded = fresh.load();
assert.equal(loaded['steel-night'].schemaVersion, 1);
quota = true;
assert.throws(() => fresh.save('steel-night', drift), /Quota/);
quota = false;
fresh.save('steel-night', drift);
assert.equal(JSON.parse(memory.get(api.storageKey)).drafts['steel-night'].tokens['--ds-card-shadow'], '0 0 7px #123456');
for (const damaged of ['{broken', '{"format":"design-system-studio-drafts","version":2,"drafts":{}}']) {
  memory.set(api.storageKey, damaged);
  const store = api.createStore(() => storage);
  assert.throws(() => store.load());
  assert.throws(() => store.save('steel-night', exported), /paused/);
  assert.equal(memory.get(api.storageKey), damaged, 'unreadable storage is untouched');
}
const denied = api.createStore(() => { throw new Error('Storage denied'); });
assert.throws(() => denied.load(), /denied/);
assert.throws(() => denied.save('steel-night', exported), /paused/);
console.log('Passed: all 14 retired Type migrations, recipe compatibility, transactional import validation, prototype keys, snapshot drift, draft round trip, storage failures, cross-tab conflicts, and corrupt/future storage preservation.');
