const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadModel, build } = require('./build-themes.cjs');
const { context, data, composer } = loadModel();
const api = context.window.DesignSystemThemeComposer;
const contrast = context.window.DesignSystemThemeContrast;
const plain = (value) => JSON.parse(JSON.stringify(value));
let combinations = 0;
for (const [id, recipe] of Object.entries(data.baseThemePresetMap)) {
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
build(true);
console.log(`Passed: 21 default round trips, ${combinations} single-layer substitutions, 250 seeded mixed recipes, edit/reset/undo and parser regressions.`);
