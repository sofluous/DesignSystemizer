# Design System Expansion Plan

## Core Direction
The system should stay modular. Base themes are not unique hardcoded styles; each base theme is a recipe made from shared preset groups.

Preset groups:
1. `Color Family`: defines palette behavior (contrast model + tonal strategy).
2. `Hue`: defines hue anchor used by the selected family behavior.
3. `Style`: defines aesthetic language (shape, depth, texture, typography posture).
4. `Scale`: defines density and sizing.

Final output:
1. `base-theme recipe` = one selection from each group.
2. optional token-level edits.
3. export as a new theme block.

## Aesthetic Style Presets
Style presets should cover these target aesthetics:
1. `terminal`: cathode/analog glow, mono-font, scanline texture, transparent overlays.
2. `technical`: sharp, strict geometry, high readability, diagram-like.
3. `paper`: soft contrast, tactile, warm and readable.
4. `skeuo`: clean dimensional depth (Apple-like, not noisy).
5. `glassmorph`: translucent, fragile, cool blue depth.
6. `material`: rounded, friendly, balanced flat-depth hybrid.

## Color Family Behaviors
Color families are logic models, not static palettes:
1. `monochrome`: hue-tinted mono ramp, restrained contrast.
2. `bold`: high-contrast accents and stronger semantic separation.
3. `paper`: soft low-sat surfaces with readable accents.
4. `pastel`: gentle high-key tones around hue anchor.
5. `cathode`: emissive glow behavior from the primary hue.

Hue options should be reusable across families:
1. chromatic: `cyan`, `magenta`, `violet`, `red`, `green`, `blue`, `yellow`, `lime`, `amber`, `teal`.
2. neutral anchors: `gray`, `steel`, `slate`, `black`, `white`.

## Base Theme Recipes
Existing base themes should map to shared presets only:
1. `steel-night` -> `bold + steel + technical + standard`
2. `paper-mint` -> `paper + green + paper + standard`
3. `amber-terminal` -> `cathode + amber + terminal + compact`
4. `neon-grid` -> `cathode + cyan + terminal + standard`
5. `mono-slate` -> `monochrome + gray + technical + standard`
6. `tech-grid` -> `bold + blue + technical + compact`
7. `skeuo-panel` -> `paper + blue + skeuo + standard`
8. `industrial-terminal` -> `cathode + lime + technical + compact`

## Token Logic
Token resolution remains layered:
1. foundation tokens (`space`, `radius`, `font`, type, motion).
2. semantic tokens (`bg`, `text`, `border`, `accent`, intents).
3. component tokens (`btn`, `input`, `card`, etc.) mapped from semantic.
4. UI classes consume component tokens only.

## Next Expansion
1. Add color-behavior docs per family with before/after swatches.
2. Add recipe save/load JSON so users can share preset combos.
3. Add component parity checks (all components preview across each style).
4. Add automated contrast checks for each generated preset combo.
5. Add new high-contrast families: `electric`, `noir`, `frost`, `sunset`.
6. Add standout style presets: `hud-glow`, `neo-brutal`, `arcade`, `editorial`.

## Theme Distribution Plan
How produced themes should be used outside the builder:
1. `Inline export`: generated `:root[data-theme="..."]` block is pasted into `css/themes.css`.
2. `Package export`: ZIP contains:
`<theme>.css`, `theme.recipe.json`, `README.md`, `INSTALL.md`.
3. `GitHub clone workflow`:
clone repository, keep `_DesignSystem` as shared folder, consume via `<link rel="stylesheet" href="./_DesignSystem/theme.css">`.
4. `Git submodule workflow`:
add this repository as submodule and reference shared path for updates.
5. `Versioning`:
each exported theme package should include a semantic version and generation timestamp in `theme.recipe.json`.

## Implementation Backlog
1. Add one-click "append exported theme to local themes.css" in studio.
2. Add optional "export full runtime bundle" (`theme.css` + `css/` subtree + custom theme).
3. Add import flow for package ZIP to restore recipe + token values in builder.
4. Add CLI script for syncing/exporting themes to a connected GitHub repo.
