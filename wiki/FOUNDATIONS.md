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

## Accessibility Baseline
- Focus state must be visible on keyboard navigation.
- Touch targets should remain usable at compact scale.
- Critical states must not rely on color alone.

## Primary Button Contrast Policy
- `primaryTextMode: contrast` (default): use generated contrast-safe text from color family + hue bundle.
- `primaryTextMode: text`: force `--ds-btn-primary-text: var(--ds-text)`.
- `primaryTextMode: inverse`: force `--ds-btn-primary-text: var(--ds-text-inverse)`.
- `primaryTextMode: surface`: force `--ds-btn-primary-text: var(--ds-bg-elevated)`.

### Current Theme Overrides
- `mono-slate`: `surface`
- `paper-mint`: `surface`
- `neon-grid`: `surface`
- `skeuo-panel`: `surface`
- `industrial-terminal`: `surface`
- `velvet-touch`: `surface`
- `eva-wireframe`: `surface`

## Style Composability Rule
- Style presets should primarily define shape, type, spacing, and effects.
- Style presets should avoid hardcoding core palette tokens (`--ds-bg*`, `--ds-text*`, `--ds-accent*`) unless the style is intentionally palette-locked.
- `graphic-signal` has been updated to be composable with family/hue/texture presets.
