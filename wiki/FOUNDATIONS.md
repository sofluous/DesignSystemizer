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

## Style Composability Rule
- Style presets should primarily define shape, type, spacing, and effects.
- Style presets should avoid hardcoding core palette tokens (`--ds-bg*`, `--ds-text*`, `--ds-accent*`) unless the style is intentionally palette-locked.
- `graphic-signal` has been updated to be composable with family/hue/texture presets.
