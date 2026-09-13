const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { build, loadModel } = require('./build-themes.cjs');
build();
const root = path.resolve(__dirname, '..');
const { context, data, composer } = loadModel();
for (const file of ['theme-package-assets', 'studio-packaging']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', file + '.js'), 'utf8'), context);
}
const name = context.window.DesignSystemThemeRegistry.defaultTheme;
const recipe = data.baseThemePresetMap[name];
const result = composer.compose(recipe);
const files = context.window.DesignSystemStudioPackaging.buildThemePackageFiles({
  themeName: name,
  themeBlock: context.window.DesignSystemThemeComposer.serialize(name, result.tokens),
  recipe: { schemaVersion: 1, baseTheme: name, layers: recipe, overrides: {}, tokens: result.tokens },
});
const destination = path.join(root, '_package');
for (const file of files) {
  const target = path.resolve(destination, file.name);
  if (!target.startsWith(destination + path.sep)) throw new Error('Invalid output path');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, file.content);
}
fs.copyFileSync(path.join(root, 'js/theme-registry.js'), path.join(destination, 'design-system/js/theme-registry.js'));
fs.cpSync(path.join(root, 'icons'), path.join(destination, 'design-system/icons'), { recursive: true });
fs.writeFileSync(path.join(destination, 'design-system/INSTALL.md'), files.find((f) => f.name === 'INSTALL.md').content);
fs.writeFileSync(path.join(destination, 'design-system/VERSION.txt'), 'Theme schema 1; seven-layer composition\n');
console.log('Built plug-and-play package at ' + destination);
