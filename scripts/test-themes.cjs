const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadModel, build } = require('./build-themes.cjs');
const { context, data, composer, defaults } = loadModel();
context.window.DesignSystemThemeFoundations = defaults;
const api = context.window.DesignSystemThemeComposer;
const contrast = context.window.DesignSystemThemeContrast;
const plain = (value) => JSON.parse(JSON.stringify(value));
// Type must declare its font identity independently of every other recipe module.
const typeOptions = [];
context.document.createElement = () => ({});
context.window.DesignSystemStudioBuilderPresets.initBuilderPresets({
  ...data, typographyPresetSelect: { appendChild: (option) => typeOptions.push(option) }
});
for (const [id, preset] of Object.entries(data.typographyPresets)) {
  for (const key of ['--ds-font-sans', '--ds-font-mono']) assert.ok(preset[key], id + ' declares ' + key);
  const option = typeOptions.find((entry) => entry.value === id);
  const preferred = preset['--ds-font-sans'].split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  assert.equal(option.textContent, preferred, id + ' has a concise font label');
  assert.ok(option.title.includes(preset['--ds-font-mono']), id + ' exposes code stack');
}
assert.equal(typeOptions.length, 12, 'catalog retains twelve distinct font choices');
assert.equal(new Set(typeOptions.map((option) => option.textContent)).size, typeOptions.length, 'no repeated primary font choices');
const typeKeys = ['--ds-font-sans', '--ds-font-mono', '--ds-fs-1', '--ds-fs-2', '--ds-fs-3', '--ds-fs-4', '--ds-fs-5', '--ds-lh-base'];
for (const [id, preset] of Object.entries(data.typographyPresets)) {
  for (const key of typeKeys) assert.ok(preset[key], id + ' owns complete Type property ' + key);
}
for (const [oldId, target] of Object.entries(data.typographyAliases)) {
  assert.ok(Object.hasOwn(data.typographyPresets, target), oldId + ' resolves directly to a current option');
  assert.ok(!typeOptions.some((option) => option.value === oldId), oldId + ' is not selectable');
}
for (const domain of ['schemePresets', 'stylePresets', 'scalePresets', 'texturePresets']) {
  for (const [id, preset] of Object.entries(data[domain])) {
    assert.ok(!Object.keys(preset).some((key) => key.startsWith('--ds-font-')), domain + '/' + id + ' does not override Type fonts');
  }
}
// Both Signal schemes use accent primaries and ink secondaries in every state.
const signalPoster = composer.compose(data.baseThemePresetMap['signal-poster']).tokens;
const signalDiagram = composer.compose(data.baseThemePresetMap['signal-diagram']).tokens;
for (const token of Object.keys(signalPoster).filter((key) => /^--ds-btn(?:-primary)?-(?:bg(?:-hover)?|text(?:-hover|-selected)?|border)$/.test(key))) {
  assert.equal(signalDiagram[token], signalPoster[token], 'Signal button hierarchy: ' + token);
}
assert.ok(signalDiagram['--ds-btn-primary-bg'].includes('var(--ds-accent)'), 'Signal Diagram primary uses accent');
assert.equal(signalDiagram['--ds-btn-bg'], 'var(--ds-text)', 'Signal Diagram secondary uses ink');
assert.ok(!contrast.audit(composer.compose(data.baseThemePresetMap['steel-night']).tokens).some((pair) => pair.fg === '--ds-tab-border'), 'decorative inactive tab border is not a text contrast pair');
let combinations = 0;
for (const [id, recipe] of Object.entries(data.baseThemePresetMap)) {
  assert.ok(Object.hasOwn(data.typographyPresets, recipe.typography), id + " uses a current Type option");
  const original = composer.compose(recipe).tokens;
  assert.deepEqual(plain(original), plain(composer.compose(recipe).tokens), id + ' deterministic');
  for (const [key, value] of Object.entries(original)) contrast.resolve(value, original, [key]);
  assert.ok(contrast.audit(original).every((p) => p.ratio >= 4.5), id + ' contrast');
  const success = contrast.color(contrast.resolve(original['--ds-success'], original));
  const danger = contrast.color(contrast.resolve(original['--ds-danger'], original));
  assert.ok(success[1] > success[0] && success[1] > success[2], id + ' success stays green');
  assert.ok(danger[0] > danger[1] && danger[0] > danger[2], id + ' danger stays red');
  if (['holo-nocturne', 'oilslick-nacre'].includes(id)) {
    assert.ok(original['--ds-card-bg-image'].includes('conic-gradient'), id + ' spectral material survives composition');
    assert.ok(original['--ds-btn-bg'].includes('linear-gradient'), id + ' controls retain material');
  }
  if (id === 'type-four-sprint') {
    assert.equal(original['--ds-control-paint-blend'], 'overlay, overlay, normal');
    assert.equal(original['--ds-tab-active-fg'], '#191712');
    assert.equal(original['--ds-tab-active-border'], '#242018');
  }
  const css = api.serialize(id, original);
  const roundTrip = Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
  assert.deepEqual(roundTrip, plain(original), id + ' raw CSS round trip');
  const domains = { family: data.colorFamilyPresets, hue: data.huePresets, scheme: data.schemePresets,
    style: data.stylePresets, typography: data.typographyPresets, scale: data.scalePresets, texture: data.texturePresets };
  for (const [layer, presets] of Object.entries(domains)) for (const value of Object.keys(presets)) {
    const composed = composer.compose({ ...recipe, [layer]: value }).tokens;
    const bad = contrast.audit(composed).filter((p) => p.ratio === null || p.ratio < 4.5);
    assert.deepEqual(plain(bad), [], `${id}: ${layer}=${value}`);
    combinations++;
  }
}
const recipe = data.baseThemePresetMap['steel-night'];
for (const [oldId, target] of Object.entries(data.typographyAliases)) {
  const legacyRecipe = { ...recipe, typography: oldId };
  const normalized = composer.normalizeRecipe(legacyRecipe);
  assert.equal(legacyRecipe.typography, oldId, 'normalizing does not mutate the caller');
  assert.equal(normalized.typography, target);
  assert.deepEqual(plain(composer.normalizeRecipe(normalized)), plain(normalized), 'normalization is idempotent');
  assert.deepEqual(plain(composer.compose(legacyRecipe).tokens), plain(composer.compose(normalized).tokens), oldId + ' composes current values');
  const mappedSession = api.createSession(composer);
  mappedSession.load({ recipe: legacyRecipe, overrides: {} });
  assert.equal(mappedSession.recipe.typography, target, 'session exposes canonical IDs');
}

const session = api.createSession(composer);
session.load({ recipe, overrides: {} });
const exact = '0 2px 4px rgba(0,0,0,0.25), inset 0 0 0 1px #ffffff80';
session.edit('--ds-card-shadow', exact);
session.edit('--ds-btn-bg', 'linear-gradient(0deg, #00000080 0%, #ffffff 40%, #333333 100%)');
session.select({ ...recipe, typography: 'poster-grotesk' });
assert.equal(session.tokens['--ds-card-shadow'], exact);
assert.equal(session.overrides['--ds-card-shadow'], exact);
assert.ok(api.serialize('custom', session.tokens).includes(exact));
session.reset();
assert.deepEqual(plain(session.overrides), {});
session.undo();
assert.equal(session.overrides['--ds-card-shadow'], exact);
const before = session.snapshot();
assert.throws(() => session.select({ ...recipe, style: 'missing' }), /Unknown/);
assert.deepEqual(plain(session.snapshot()), plain(before));
assert.throws(() => session.edit('--ds-text', 'red; } body { display:none'), /Invalid/);
assert.throws(() => session.edit('--ds-text', 'var(--ds-text)'), /cycle/);
assert.throws(() => session.edit('--ds-text', 'var(--ds-missing)'), /Missing/);
const texture = 'url("data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E")';
session.edit('--ds-body-texture-image', texture);
assert.ok(api.serialize('texture',session.tokens).includes(texture));
assert.throws(() => session.edit('--ds-bg', 'url("unfinished)'), /Invalid/);
// Failed transitions must not mutate recipe, overrides, rendered tokens, notifications, or history.
const rendered = new Map();
const guarded = api.createSession(composer, { style: {
  setProperty: (key, value) => rendered.set(key, value), removeProperty: (key) => rendered.delete(key),
} });
guarded.load({ recipe, overrides: {} });
guarded.edit('--ds-accent', 'var(--ds-text)');
const guardedBefore = plain(guarded.snapshot());
const paintBefore = [...rendered];
let notifications = 0;
guarded.subscribe(() => notifications++);
const invalidRecipe = { ...recipe, scheme: 'eva-wire-alert' };
assert.throws(() => guarded.select(invalidRecipe), /cycle/);
assert.throws(() => guarded.load({ recipe: invalidRecipe, overrides: guarded.overrides }), /cycle/);
assert.throws(() => guarded.edit('--ds-btn-paint-image', 'linear-gradient(red,blue)'), /read-only/);
assert.throws(() => guarded.load({ recipe, overrides: { '--ds-unknown': 'red' } }), /Unknown/);
assert.deepEqual(plain(guarded.snapshot()), guardedBefore);
assert.deepEqual([...rendered], paintBefore);
assert.equal(notifications, 0);
assert.equal(guarded.canUndo, true);
guarded.undo();
assert.deepEqual(plain(guarded.overrides), {});
assert.equal(guarded.canUndo, false, 'failed operations add no undo entries');
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/studio-builder-config.js'), 'utf8'), context);
const fields = context.window.DesignSystemStudioBuilderConfig.initBuilderConfig().tokenGroups.flatMap((group) => group.controls.map((control) => control.token));
assert.equal(new Set(fields).size, fields.length, 'editor token definitions are unique');
for (const token of Object.keys(context.window.DesignSystemThemeFoundations)) {
  if (!api.isDerived(token)) assert.ok(fields.includes(token), token + ' has an editor');
}
for (const [id, token] of [['sunset-pop', '--ds-btn-bg'], ['oilslick-nacre', '--ds-btn-primary-bg-hover']]) {
  const result = composer.compose(data.baseThemePresetMap[id]);
  assert.match(result.tokens[token], /linear-gradient/, id + ' keeps its material');
  assert.ok(!result.fixes.some((fix) => fix.bg === token && fix.backgroundReplaced));
}
for (const token of ['--ds-card-top-rule-color', '--ds-card-structural-bg', '--ds-card-secondary-bg']) {
  const control = context.window.DesignSystemStudioBuilderConfig.initBuilderConfig().tokenGroups.flatMap((group) => group.controls).find((entry) => entry.token === token);
  assert.equal(control.type, 'paint', token + ' supports its background consumer');
}
const packageAudit = require('./audit-theme-packages.cjs').audit();
assert.deepEqual(packageAudit.summary.missingEditors, []);
assert.deepEqual(packageAudit.summary.missingComponentRefs, []);
assert.equal(packageAudit.summary.unrepresentedThemes, 0, 'all default select values are represented');
assert.equal(packageAudit.summary.authored, packageAudit.summary.foundations, 'authored tokens have universal foundations');
const traced = composer.compose(recipe, { trace: true });
assert.deepEqual(plain(traced.tokens), plain(composer.compose(recipe).tokens), 'tracing does not change rendering');
assert.ok(traced.provenance['--ds-accent'].some((entry) => entry.layer === 'family+hue'));
assert.ok(traced.provenance['--ds-font-sans'].some((entry) => entry.layer === 'typography'));
assert.equal(traced.provenance['--ds-btn-paint-image'].at(-1).layer, 'generated');
let seed = 17;
const random = (values) => { seed = (Math.imul(seed,1664525) + 1013904223) >>> 0; return values[seed % values.length]; };
for (let i=0;i<250;i++) {
  const mix = {};
  for (const [key, source] of Object.entries({ family:'colorFamily', hue:'hue', scheme:'scheme', style:'style', typography:'typography', scale:'scale', texture:'texture' })) mix[key] = random(Object.keys(data[source+'Presets']));
  assert.deepEqual(plain(contrast.audit(composer.compose(mix).tokens).filter((p) => p.ratio === null || p.ratio < 4.5)), [], JSON.stringify(mix));
}
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/studio-builder-controls.js'), 'utf8'), context);
const controls = context.window.DesignSystemStudioBuilderControls.initBuilderControls({ root: {}, controlMap: new Map() });
assert.equal(controls.parseShadow('0 2px 4px #000000').x, 0);
assert.equal(controls.buildPaint({ mode: { value: 'gradient' }, angle: { value: '0' }, c1: { value: '#ffffff' }, c2: { value: '#000000' } }), 'linear-gradient(0deg, #ffffff, #000000)');
assert.ok(!Object.keys(require('./build-themes.cjs').artifacts()).some((file) => file.startsWith('_docs/')), 'runtime freshness is independent of local reports');
require('./test-theme-artifact-io.cjs');
build(true);
console.log(`Passed: 21 default round trips, ${combinations} single-layer substitutions, 250 seeded mixed recipes, edit/reset/undo and parser regressions.`);
