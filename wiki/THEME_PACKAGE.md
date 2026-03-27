# [TASK: DesignSystem/Theme Package | Document Auto Theme Selector | v0.2]

## Purpose
Use the Design System package as a drop-in theme layer for other apps without maintaining manual theme selector entries.

## Recommended Workflow
Use the generated package bundle instead of manually copying scattered DS source files.

Build it with:

```powershell
powershell -ExecutionPolicy Bypass -File .\_DesignSystem\scripts\build-package.ps1
```

That creates:

```text
_DesignSystem/_package/_DesignSystem/
```

Copy that generated `_DesignSystem` folder into the target app root.

## Generated Package Files
- `theme.css`
- `js/theme-registry.js`
- `js/theme-selector.js`
- `icons/*`
- `INSTALL.md`

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
  <link rel="stylesheet" href="./_DesignSystem/theme.css" />
  <script src="./_DesignSystem/js/theme-registry.js"></script>
  <script src="./_DesignSystem/js/theme-selector.js"></script>
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
1. Add the theme block to `css/themes.css`.
2. Add its metadata entry to `js/theme-registry.js`.
3. If Studio preset mapping is needed, add/update the matching entry in `index.html`.
4. Rebuild the package bundle.

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
