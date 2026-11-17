# [TASK: DesignSystem/Theme Package | Document Auto Theme Selector | v0.2]

## Purpose
Use the Design System package as a drop-in theme layer for other apps without maintaining manual theme selector entries.

## Recommended Workflow
Use the generated package bundle instead of manually copying scattered DS source files.

From `DESIGN SYSTEM/DesignSystem-dev`, build with Node.js:

```powershell
node scripts/build-package.cjs
```

That creates:

```text
_package/design-system/
```

Copy that generated `design-system` folder into the target app root.

## Generated Package Files
- `theme.css`
- `fonts.css` and `fonts/` (including licenses and manifest)
- `package.manifest.json` and `VERSION.txt` (CLI builds)
- `js/theme-registry.js`
- `js/theme-selector.js`
- `icons/*`
- `INSTALL.md`

## Source Vs Package CSS
- `theme.css`
  - source entrypoint for Studio and local authoring
  - loads split files from:
    - `css/tokens.css`
    - `css/themes.css`
    - `css/components.css`
- `_package/design-system/theme.css`
  - generated bundled CSS for app consumption
  - this is the file apps should link

## What Each File Does
- `theme.css`: bundled tokens, themes, and components in one file.
- `js/theme-registry.js`: stores the list of available themes and labels.
- `js/theme-selector.js`: builds selectors from the registry, applies the selected theme, and persists it in `localStorage`.

## Minimal App Setup
```html
<!DOCTYPE html>
<html
  lang="en"
  data-theme="steel-night"
  data-ds-theme-storage="my-app-theme"
  data-ds-theme-default="steel-night"
>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="./design-system/fonts.css" />
  <link rel="stylesheet" href="./design-system/theme.css" />
  <script src="./design-system/js/theme-registry.js"></script>
  <script src="./design-system/js/theme-selector.js"></script>
</head>
<body>
  <label for="themeSelectApp">Theme</label>
  <select id="themeSelectApp" data-ds-theme-select></select>
</body>
</html>
```

## Behavior
- `theme-selector.js` now auto-applies the root theme from:
  - saved `localStorage` theme, then
  - `<html data-theme="...">`, then
  - `<html data-ds-theme-default="...">`
- The selector options are built automatically from `js/theme-registry.js`.
- The selected theme is applied to `<html data-theme="...">`.
- The selected theme is persisted using `data-ds-theme-storage`.
- Selectors inherit `data-ds-theme-storage` and `data-ds-theme-default` from `<html>` unless they override them locally.
- No page-specific theme bootstrapping is required for standard installs.

## Why This Is Better Than Manual Copying
- one folder replaces the app-local DS package
- one CSS file reduces copy mistakes and stylesheet import indirection
- easier diffing when upgrading apps
- lower chance of partial updates where CSS and JS versions drift apart

## When Adding A New Theme
1. Author its seven-layer recipe/presets in `js/studio-builder-theme-data.js`; add theme metadata to `js/theme-registry.js`.
2. Edit shared foundations in `css/tokens.css` and shared component rules in `css/components.css` when needed.
3. Run `node scripts/build-package.cjs`. Do not hand-edit generated `css/themes.css`, foundation/export snapshots or wiki preset tables.
4. Run `node scripts/test-themes.cjs` and the package/browser checks below before replacing a consumer bundle.

## Optional Manual Initialization
Use this only if you need to override the standard root-driven behavior:

```html
<script>
  window.DesignSystemThemeSelector.initThemeSelector(
    document.getElementById("themeSelectApp"),
    {
      root: document.documentElement,
      storageKey: "my-app-theme",
      defaultTheme: "steel-night",
    }
  );
</script>
```

## Notes
- This avoids parsing CSS to discover themes at runtime.
- Keep theme values in CSS and theme metadata in the registry.
- If an app needs a filtered selector, derive it from `window.DesignSystemThemeRegistry.themes`.
- For your current static/local app setup, this generated single-folder package is the most practical “drag and drop” approach without introducing a full package manager or build pipeline.

## Studio ZIP exports (schema 1)
The Studio download includes a complete `design-system/` runtime folder, `example.html`, `INSTALL.md`, standalone custom CSS, and `theme.recipe.json`. The recipe contains the applied seven layers, exact manual overrides, and all final tokens. Pending unapplied selections are excluded.

Load bundled CSS and registry/selector scripts together. No Studio scripts are required by consumers. All default themes remain switchable alongside the custom theme. `fonts.css` loads the eight local families recorded in `fonts/manifest.json`. Keep its `fonts/` directory and license notices. Other faces remain device-dependent; see [Font Delivery](FONT_DELIVERY.md) and INSTALL.md.

`css/themes.css`, `js/theme-foundations.js`, `js/theme-package-assets.js`, `js/theme-font-assets.js`, and the preset map are generated. Run the package builder after editing foundations, presets, or shared components.

## Reopen an exported theme in Studio
Expand **Save and reopen** in the Builder settings and select the package's extracted `theme.recipe.json` (or a standalone recipe download). Import updates the current theme slot and is undoable for recipe/token settings. The theme name comes from the file. CSS and ZIP files are runtime artifacts, not recipe import inputs.

Applied drafts save automatically in this browser and origin. Download recipe JSON for a portable backup. Pending layer selections and Undo history do not survive reload. Imports retain older token snapshots as explicit compatibility overrides. Invalid/future recipes are rejected without replacing the current draft; use recipe JSON for portable backups.

## Saved button colors versus updated Schemes
Studio preserves saved snapshot differences as overrides, so a corrected Scheme can remain hidden by an older draft. Theme settings shows a contextual **Use current colors** action when primary/secondary button or tab color overrides differ from the applied recipe. It restores those button and tab backgrounds, foregrounds, hover/selected text, and borders while retaining other edits, including shadows and geometry. Undo restores the previous colors. Pending selector changes are not applied. No saved browser data is silently cleared.

## Existing apps and runtime boundaries

`theme.css` styles global box sizing, html/body, links, headings and focus indicators as well as DS component classes. Review its effect on host styles, load intentional app overrides after it, and map app styling to semantic `--ds-*` tokens. This bundle does not scope itself to a widget subtree. Keep application interaction logic (dialogs, tabs, utility toggle state) in the host app.

Use an app-specific `data-ds-theme-storage` key. Runtime switching survives denied storage; persistence on `file:` URLs is browser-dependent. HTTP(S) serving is recommended. The selector and approved-icon helper construct DOM nodes without HTML parsing sinks and are tested under `require-trusted-types-for 'script'; trusted-types 'none'`. This applies to the consumer runtime, not the Studio authoring UI. Dynamic host additions require explicit selector initialization or `DesignSystemIcons.render(container)`; keep scripts ordered and do not mount the same selector repeatedly with different configurations. Do not place icon markers directly on interactive controls: icons are decorative.

## Upgrade verification and recovery

Replace the complete app-owned `design-system` folder rather than merging new files into it. Preserve local app overrides outside that folder. `package.manifest.json` lists every other runtime file's SHA-256 and byte count; its `sourceRevision` hashes the ordered inventory and its `presetRevision` identifies the composer inputs. It intentionally excludes itself. These are content identifiers, not signatures or third-party authenticity guarantees. Browser exports also include this manifest; CLI builds additionally retain VERSION.txt and legacy icon entry points.

The CLI builds in a sibling staging directory before swapping `_package`. Validation/write failure keeps the old output; a replacement failure attempts rollback. A lock prevents overlapping output publication. The two renames are not a continuously available filesystem transaction: stop a server serving `_package` during regeneration. Do not put handwritten files inside generated `_package`; replacement removes obsolete output.

After process interruption, first verify no build is active. Inspect `_package.lock` and `_package.stage-*/previous`; preserve the backup if `_package` is absent. Restore the verified previous folder before removing an abandoned lock/staging directory. Do not remove the last good package. A rollback failure reports its retained staging path.

## Studio export payload

Studio loads preview CSS/metadata immediately but loads `js/theme-font-assets.js` only when a ZIP is requested. Keep that local generated file with Studio when copying/offline hosting it. A first ZIP request needs the file available locally or cached; this is not a service-worker offline guarantee. Failed loads show a retryable status; concurrent requests share one load and completed loads are reused. The download snapshots applied edits before loading. Consumer apps never need either export-assets script. ZIP generation retains the complete font binaries/notices; font requests for rendering remain on demand.

## Checks

Run from `DesignSystem-dev`:

```powershell
node scripts/build-package.cjs
node scripts/test-package-output.cjs
node scripts/test-package-loading.cjs
node scripts/test-themes.cjs
node scripts/test-fonts.cjs
node scripts/test-browser.cjs
node scripts/test-browser.cjs --portable
node scripts/test-browser.cjs --export-loading
```

`--portable` serves a fresh nested consumer copy with enforced Trusted Types, denied storage and no Studio source. It checks theme switching, approved SVGs and every supplied font. Browser gates use Edge by default; set `DS_BROWSER` for a compatible Chromium executable. Firefox/Safari and framework lifecycle integration require separate validation.
