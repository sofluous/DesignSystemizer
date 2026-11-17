const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
async function main() {
  const { build, loadModel } = require('./build-themes.cjs');
  require('./build-icons.cjs').build();
  build();
  const root = path.resolve(__dirname, '..');
  const { context, data, composer } = loadModel();
  context.TextEncoder = TextEncoder;
  context.window.crypto = require('node:crypto').webcrypto;
  context.window.atob = atob;
  for (const file of ['theme-package-assets', 'theme-font-assets', 'icon-package-assets', 'studio-packaging']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', file + '.js'), 'utf8'), context);
  }
  const name = context.window.DesignSystemThemeRegistry.defaultTheme;
  const recipe = data.baseThemePresetMap[name];
  const result = composer.compose(recipe);
  let files = context.window.DesignSystemStudioPackaging.buildThemePackageFiles({
    themeName: name,
    themeBlock: context.window.DesignSystemThemeComposer.serialize(name, result.tokens),
    recipe: { schemaVersion: 1, themeName: name, generator: { name: "Design System Studio", contractVersion: 1, presetRevision: context.window.DesignSystemThemePackageAssets.presetRevision }, baseTheme: name, layers: recipe, overrides: {}, tokens: result.tokens },
  });
  const destination = path.join(root, '_package');
  files.find(file => file.name === 'design-system/js/theme-registry.js').content = fs.readFileSync(path.join(root, 'js/theme-registry.js'), 'utf8');
  // Preserve the four legacy entry points without copying drafts or unapproved artwork.
  for (const file of ['search.svg', 'close.svg', 'menu.svg', 'chevron-down.svg']) {
    files.push({ name: 'design-system/icons/' + file, content: fs.readFileSync(path.join(root, 'icons', file), 'utf8') });
  }
  files.push({ name: 'design-system/INSTALL.md', content: files.find(f => f.name === 'INSTALL.md').content });
  files.push({ name: 'design-system/VERSION.txt', content: 'Theme schema 1; preset ' + context.window.DesignSystemThemePackageAssets.presetRevision + '; icons ' + context.window.DesignSystemIconPackageAssets.version + '\n' });
  files = await context.window.DesignSystemStudioPackaging.withManifest(files);
  require('./package-output.cjs').publishPackage(destination, files);
  console.log('Built plug-and-play package at ' + destination);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
