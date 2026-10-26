// Project-specific contract audit. Run from any directory; output is generated documentation.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadModel } = require('./build-themes.cjs');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const canonical = (value) => value.replace(/["']/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

function audit() {
  const { context, defaults, data, composer } = loadModel();
  context.window.DesignSystemThemeFoundations = defaults;
  vm.runInContext(read('js/studio-builder-config.js'), context);
  const config = context.window.DesignSystemStudioBuilderConfig.initBuilderConfig();
  const controls = config.tokenGroups.flatMap((group) => group.controls.map((control) => ({ ...control, group: group.name })));
  const sources = Object.entries(data).filter(([name]) => name.endsWith('Presets')).flatMap(([domain, presets]) =>
    Object.entries(presets).flatMap(([preset, tokens]) => Object.entries(tokens).filter(([token]) => token.startsWith('--')).map(([token, value]) => ({ domain, preset, token, value }))));
  const authored = new Set([...Object.keys(defaults), ...sources.map((entry) => entry.token)]);
  const componentRefs = new Set([...read('css/components.css').matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]));
  const fontGroups = new Map();
  const themes = Object.entries(data.baseThemePresetMap).map(([id, recipe]) => {
    const { tokens, fixes, provenance } = composer.compose(recipe, { trace: true });
    const unrepresented = controls.filter((control) => control.type === 'select').filter((control) =>
      !control.options.some((option) => canonical(option) === canonical(context.window.DesignSystemThemeContrast.resolve(tokens[control.token], tokens))))
      .map((control) => ({ token: control.token, value: tokens[control.token] }));
    const fontSignature = ['--ds-font-sans', '--ds-font-mono'].map((token) => canonical(tokens[token])).join('|');
    if (!fontGroups.has(fontSignature)) fontGroups.set(fontSignature, []);
    fontGroups.get(fontSignature).push(id);
    const assignments = Object.fromEntries(Object.keys(tokens).map((token) => {
      const contributors = provenance[token] || [];
      return [token, { group: controls.find((control) => control.token === token)?.group || 'generated', contributors }];
    }));
    return { id, recipe, tokenCount: Object.keys(tokens).length, unrepresented, missingComponentRefs: [...componentRefs].filter((token) => !(token in tokens)),
      fonts: { sans: tokens['--ds-font-sans'], mono: tokens['--ds-font-mono'] },
      typographyInherited: Object.keys(defaults).filter((token) => /^--ds-(font-|fs-|lh-|label-)/.test(token) && !Object.hasOwn(data.typographyPresets[recipe.typography], token)),
      materialFallbacks: fixes.filter((fix) => fix.backgroundReplaced),
      authoredConflicts: Object.entries(provenance).filter(([, entries]) => entries.filter((entry) => ['scheme', 'style', 'texture'].includes(entry.layer)).length > 1)
        .map(([token, contributors]) => ({ token, contributors: contributors.filter((entry) => ['scheme', 'style', 'texture'].includes(entry.layer)) })), assignments };
  });
  const collisions = [...authored].map((token) => ({ token, domains: [...new Set(sources.filter((entry) => entry.token === token).map((entry) => entry.domain))] })).filter((entry) => entry.domains.length > 1);
  const unusedTypography = Object.keys(data.typographyPresets).filter((name) => !themes.some((theme) => theme.recipe.typography === name));
  const missingEditors = [...authored].filter((token) => !context.window.DesignSystemThemeComposer.isDerived(token) && !controls.some((control) => control.token === token));
  const tokenControlTypes = Object.fromEntries([...new Set(controls.map((control) => control.type))].map((type) => [type, controls.filter((control) => control.type === type).length]));
  const styleTypographyOwnership = sources.filter((entry) => entry.domain === 'stylePresets' && /^--ds-(label-|tracking-|font-|fs-|lh-)/.test(entry.token));
  const paletteOverridingSchemes = Object.entries(data.schemePresets).filter(([, values]) => ['--ds-bg', '--ds-text', '--ds-accent'].some((token) => Object.hasOwn(values, token))).map(([id, values]) => ({ id, tokens: Object.keys(values).filter((token) => /^--ds-(bg|text|accent|focus)/.test(token)), fixedTokens: Object.keys(values).filter((token) => /^--ds-(bg|text|accent|focus)/.test(token) && !values[token].includes('var(')) }));
  return { summary: { themes: themes.length, foundations: Object.keys(defaults).length, authored: authored.size, editors: controls.length,
    missingEditors, unrepresentedThemes: themes.filter((theme) => theme.unrepresented.length).length, missingComponentRefs: [...new Set(themes.flatMap((theme) => theme.missingComponentRefs))] },
    tokenControlTypes, styleTypographyOwnership, paletteOverridingSchemes, collisions, identicalFontStacks: [...fontGroups.values()].filter((ids) => ids.length > 1), unusedTypography,
    fontDelivery: { optionalWebFonts: ['Inter', 'Space Mono'], bundledFontBinaries: false, systemFaceAvailability: 'Device dependent; a declared font stack is not proof that its first face is installed.' }, themes };
}
if (require.main === module) {
  const report = audit();
  fs.writeFileSync(path.join(root, '_docs/data/theme-package-audit.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report.summary, collisions: report.collisions, identicalFontStacks: report.identicalFontStacks, unusedTypography: report.unusedTypography }, null, 2));
}
module.exports = { audit };
