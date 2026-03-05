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
