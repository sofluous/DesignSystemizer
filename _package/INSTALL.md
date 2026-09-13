# Theme package

Copy the design-system folder into your app. Load theme.css, then theme-registry.js and theme-selector.js.
Use DS component classes or map your app properties to the --ds-* tokens. See example.html for a working theme switcher.
The package includes all default themes and the exported custom theme. It does not need the Studio or its composer at runtime.
Theme tokens and CSS are snapshots; theme.recipe.json records the applied seven layers and exact manual overrides.
fonts.css optionally loads Inter and Space Mono from Google Fonts. Without network access, the declared system font fallbacks apply.
Other locally installed font families still depend on the target device. No font binaries are bundled.
Regenerate the package after changing source presets or components. Keep app styles token-based for theme switching.