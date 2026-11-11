const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadModel } = require('./build-themes.cjs');
const { contract, validateOwnership } = require('./theme-token-ownership.cjs');
const model = loadModel();
const { data, defaults, composer, context } = model;
const api = context.window.DesignSystemThemeComposer;
const plain = (value) => JSON.parse(JSON.stringify(value));
function inspect(changed, specification = contract) {
  const presets = context.window.DesignSystemStudioBuilderPresets.initBuilderPresets(changed);
  return validateOwnership({ data: changed, defaults, composer, buildColorBundle: presets.buildColorBundle, isDerived: api.isDerived }, specification);
}
assert.equal(inspect(data).tokenCount, Object.keys(composer.compose(data.baseThemePresetMap['steel-night']).tokens).length);
for (const [layer, token, value] of [
  ['scheme', '--ds-bg', '#000000'], ['style', '--ds-font-sans', 'serif'],
  ['typography', '--ds-space-1', '9px'], ['scale', '--ds-text', '#ffffff'],
  ['texture', '--ds-accent', '#abcdef'], ['scheme', '--ds-missing-token', '0'],
  ['style', '--ds-btn-paint-image', 'none']
]) {
  const changed = plain(data);
  changed[layer + 'Presets']['ownership-probe'] = { [token]: value };
  assert.throws(() => inspect(changed), /belongs to|Unowned token/, layer + ' cannot add off-owner values');
}
const invalidHue = plain(data);
invalidHue.huePresets.cyan['--ds-font-sans'] = 'serif';
assert.throws(() => inspect(invalidHue), /Hue is parameter-only/);
const directFamily = plain(data);
directFamily.colorFamilyPresets['race-ui']['--ds-bg'] = '#ffffff';
assert.throws(() => inspect(directFamily), /must use palette/);
const invalidFamily = plain(data);
invalidFamily.colorFamilyPresets['race-ui'].palette['--ds-font-sans'] = 'serif';
assert.throws(() => inspect(invalidFamily), /belongs to typography/);
invalidFamily.colorFamilyPresets['race-ui'].palette = [];
assert.throws(() => inspect(invalidFamily), /Invalid Family palette/);
const removedOwner = plain(contract);
removedOwner.groups.family.tokens = removedOwner.groups.family.tokens.filter((token) => token !== '--ds-bg');
assert.throws(() => inspect(data, removedOwner), /Missing ownership|Unowned token/);
const duplicateOwner = plain(contract);
duplicateOwner.groups.style.tokens.push('--ds-bg');
assert.throws(() => inspect(data, duplicateOwner), /Duplicate token owner/);
const unknownOwner = plain(contract);
unknownOwner.groups.mystery = { description: 'invalid', tokens: [] };
assert.throws(() => inspect(data, unknownOwner), /Unknown owner/);
const staleException = plain(contract);
staleException.exceptions.push({ layer: 'scheme', preset: 'rr4-sprint', tokens: ['--ds-bg'], reason: 'Already migrated' });
assert.throws(() => inspect(data, staleException), /Stale ownership exception/);
const missingException = plain(contract);
missingException.exceptions.shift();
assert.throws(() => inspect(data, missingException), /belongs to/);

const recipe = data.baseThemePresetMap['type-four-sprint'];
assert.equal(data.colorFamilyPresets['race-ui'].palette['--ds-bg'], '#ece8dd');
assert.ok(!Object.hasOwn(data.schemePresets['rr4-sprint'], '--ds-bg'));
assert.ok(!Object.hasOwn(data.schemePresets['rr4-sprint'], '--ds-input-readonly-shadow'));
assert.ok(!contract.exceptions.some((entry) => entry.layer === 'scheme' && entry.preset === 'rr4-sprint'), 'migrated Scheme has no off-owner assignments');
for (const family of ['bold', 'paper', 'alloy']) {
  const bundle = context.window.DesignSystemStudioBuilderPresets.initBuilderPresets(data).buildColorBundle(family, recipe.hue);
  assert.equal(composer.compose({ ...recipe, family }).tokens['--ds-bg'], bundle['--ds-bg'], 'RR4 Scheme respects ' + family + ' page palette');
}
assert.notEqual(composer.compose({ ...recipe, hue: 'cyan' }).tokens['--ds-accent'], composer.compose(recipe).tokens['--ds-accent'], 'race-ui still responds to Hue');

// Reconstruct pre-migration ownership to prove appearance and snapshot compatibility.
const legacy = plain(data);
delete legacy.colorFamilyPresets['race-ui'].palette;
legacy.schemePresets['rr4-sprint']['--ds-bg'] = '#ece8dd';
legacy.schemePresets['rr4-sprint']['--ds-input-readonly-shadow'] = 'none';
delete legacy.stylePresets['rr4-racing']['--ds-input-readonly-shadow'];
const legacyPresets = context.window.DesignSystemStudioBuilderPresets.initBuilderPresets(legacy);
const legacyComposer = api.createComposer(legacy, defaults, legacyPresets.buildColorBundle);
for (const [id, original] of Object.entries(data.baseThemePresetMap)) {
  assert.deepEqual(plain(composer.compose(original).tokens), plain(legacyComposer.compose(original).tokens), id + ' default appearance unchanged');
}
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/studio-theme-drafts.js'), 'utf8'), context);
for (const original of [recipe, { ...recipe, family: 'paper', style: 'paper' }, { ...recipe, scheme: 'standard' }]) {
  const oldSession = api.createSession(legacyComposer);
  const overrides = { '--ds-font-sans': '"Saved Custom Font", sans-serif', '--ds-card-shadow': '0 0 7px #123456' };
  oldSession.load({ recipe: original, overrides });
  const target = api.createSession(composer);
  const imported = context.window.DesignSystemStudioThemeDrafts.decodeRecipe({ schemaVersion: 1, baseTheme: 'type-four-sprint', layers: original, overrides, tokens: oldSession.tokens }, target);
  target.load(imported.state);
  assert.deepEqual(plain(target.tokens), plain(oldSession.tokens), 'old custom combination keeps exact appearance');
  target.select({ ...target.recipe, hue: 'teal' });
  assert.equal(target.overrides['--ds-font-sans'], overrides['--ds-font-sans']);
  target.undo();
  assert.deepEqual(plain(target.tokens), plain(oldSession.tokens));
}
const audit = require('./audit-theme-packages.cjs').audit();
assert.ok(audit.collisions.some((entry) => entry.token === '--ds-bg' && entry.domains.includes('colorFamilyPresets')), 'inventory includes nested Family palette assignments');
console.log(`PASS ownership coverage, invalid writes/entries, exception freshness, all 21 default appearances and legacy RR4 recipe/edit/Undo compatibility (${model.ownership.tokenCount} tokens, ${model.ownership.exceptionCount} retained assignments)`);
