# [TASK: DesignSystem/Foundations | Define Base Standards | v0.1]

## Token Philosophy
1. Foundation tokens define scales and primitives.
2. Semantic tokens define intent and hierarchy.
3. Component tokens map semantics to UI parts.

## Foundation Domains
- Spacing: `--ds-space-*`
- Radius: `--ds-radius-*`
- Typography: `--ds-font-*`, `--ds-fs-*`, `--ds-lh-*`, label spacing/transform
- Motion: `--ds-dur-*`, `--ds-ease-*`
- Elevation: `--ds-shadow-*`
- Layers: `--ds-z-*`

## Semantic Domains
- Surfaces: `--ds-bg*`
- Text: `--ds-text*`
- Borders: `--ds-border*`
- States: `--ds-success|warning|danger|info`
- Focus and accent: `--ds-focus`, `--ds-accent*`

## Core Rules
1. No hardcoded colors in app components when equivalent token exists.
2. Use semantic tokens first; avoid direct foundation token usage in app UI where component tokens exist.
3. Preserve contrast in all themes (text/background/state).
4. Keep interaction motion subtle and deterministic.

## Theme Dynamics
- Texture tokens (`--ds-*-texture-*`, blend, blur) are optional identity layers.
- Dynamics should never reduce readability or interaction clarity.

## Preset Stack
The current modular builder stack is:

1. `Color Family`
2. `Hue`
3. `Scheme`
4. `Style`
5. `Typography`
6. `Scale`
7. `Texture`

### Responsibility Split
- `Color Family`: semantic palette math, contrast model, and light/dark behavior.
- `Hue`: base hue anchor for generated semantic tokens.
- `Scheme`: component-color behavior and expressive emphasis logic.
- `Style`: geometry, borders, shadows, and interaction language.
- `Typography`: font voice, type scale, and reading rhythm.
- `Scale`: spacing density and control heights only.
- `Texture`: optional material/dynamic overlay such as grain, wire, metal, or nacre.

### Composition Rule
- Strong named themes should be reconstructible from these preset layers.
- If a preset hardcodes both palette and geometry, it is too broad and should be split.
- Typography should not be hidden inside style presets when it can be reused independently.

### Example Recipes
- `paper-mint` = `paper` + `green` + `mint-ink` + `paper` + `mint-humanist` + `standard` + `paper-grain`
- `amber-terminal` = `cathode` + `amber` + `amber-glow` + `terminal-amber` + `terminal-glow` + `compact` + `noise-film`
- `signal-poster` = `signal-paper` + `orange` + `signal-poster` + `graphic-signal` + `poster-grotesk` + `standard` + `clean`
- `signal-diagram` = `signal-paper` + `orange` + `signal-diagram` + `graphic-diagram` + `poster-grotesk` + `standard` + `clean`
- `eva-unit-01` = `signal` + `violet` + `eva-unit01` + `eva-unit01` + `eva-digital` + `compact` + `carbon-fiber`

### Modularity Notes
- `amber-terminal` is no longer intended to be palette-locked. Its CRT identity should come from `amber-glow` + `terminal-amber` + `terminal-glow` + `noise-film`, while component alias tokens continue to derive from semantic tokens.
- If a hue swap leaves old accent remnants behind, the problem is usually a theme-level alias token that still hardcodes a color instead of referencing semantic tokens such as `--ds-text`, `--ds-accent`, `--ds-border`, or `--ds-bg-*`.
- If changing one preset category alters unrelated properties, the fix belongs in the preset layer that owns the drifting token. Example: `scale` should adjust spacing/control density, not palette or typography values.

## Accessibility Baseline
- Focus state must be visible on keyboard navigation.
- Touch targets should remain usable at compact scale.
- Critical states must not rely on color alone.

## Button Contrast Logic Matrix
- Primary default:
  `--ds-btn-primary-text` must be readable on `--ds-btn-primary-bg`.
- Primary hover:
  `--ds-btn-primary-text` must remain readable on `--ds-btn-primary-bg-hover`.
- Primary selected:
  Uses `.ds-btn-primary[aria-pressed="true"]` token stack (not generic secondary selected rule).
- Secondary selected:
  Uses generic selected state treatment for non-primary variants.
- Checkbox/radio checked:
  `--ds-check-mark` must contrast against `--ds-check-checked-bg`.
- Tab selected:
  `--ds-tab-active-fg` must contrast against `--ds-tab-active-bg`, independent from primary button text logic.

### Contrast Remediation Order
1. Fix with theme tokens first (`--ds-btn-primary-*`, `--ds-check-*`, `--ds-tab-active-*`).
2. If needed, add a scoped theme-specific component override.
3. Avoid global component hacks for single-theme contrast issues.

### Bright Primary Rule
- If a theme uses a bright accent-filled primary button, prefer a negative-space label strategy.
- In that case, map `--ds-btn-primary-text` and `--ds-check-mark` to a dark surface token such as `--ds-bg-elevated`.
- This keeps primary buttons, checkboxes, and radios aligned under the same contrast rule instead of fixing each component separately.

## Style Composability Rule
- Style presets should primarily define shape, type, spacing, and effects.
- Style presets should avoid hardcoding core palette tokens (`--ds-bg*`, `--ds-text*`, `--ds-accent*`) unless the style is intentionally palette-locked.
- `graphic-signal` has been updated to be composable with family/hue/texture presets.
