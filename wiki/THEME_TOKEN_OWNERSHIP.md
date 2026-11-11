# Theme token ownership

Generated from `scripts/theme-token-ownership.json`; edit that contract, not this page. Every build validates ownership before emitting themes.

295 tokens have explicit owners. 120 existing off-owner assignments are retained as named compatibility exceptions. These are migration debt, not permission for new overlaps. New, duplicate, unowned, or stale entries fail the build.

Foundations seed every property. Family + Hue generate the semantic palette and seed component color defaults; later modules specialize their owned properties. Hue owns generator parameters rather than a separate set of CSS tokens. Generated aliases are read-only. Explicit user overrides remain outside preset ownership enforcement.

Family may declare a `palette` object containing only Family-owned semantic tokens. Fixed Family surfaces are explicit palette intent; Scheme must not select the page palette. Type Four Sprint now obtains its page background from `race-ui.palette`, while `rr4-sprint` owns component color treatment.

Ownership does not yet certify CSS value types, arbitrary mixed-layer readability, font availability, or freedom from literal component paints. These require separate validation.

## family

Semantic palette, state roles, native light/dark intent; Hue parameterizes generation.

| Token |
|---|
| `--ds-accent` |
| `--ds-accent-alt` |
| `--ds-accent-alt-strong` |
| `--ds-accent-strong` |
| `--ds-bg` |
| `--ds-bg-elevated` |
| `--ds-bg-overlay` |
| `--ds-bg-raised` |
| `--ds-bg-soft` |
| `--ds-border` |
| `--ds-border-strong` |
| `--ds-danger` |
| `--ds-focus` |
| `--ds-info` |
| `--ds-native-color-scheme` |
| `--ds-native-icon-filter` |
| `--ds-native-icon-opacity` |
| `--ds-success` |
| `--ds-text` |
| `--ds-text-inverse` |
| `--ds-text-muted` |
| `--ds-warning` |

## scheme

Component color mappings, foreground/background pairs and color state treatments.

| Token |
|---|
| `--ds-btn-bg` |
| `--ds-btn-bg-hover` |
| `--ds-btn-border` |
| `--ds-btn-danger-bg` |
| `--ds-btn-danger-bg-hover` |
| `--ds-btn-danger-border` |
| `--ds-btn-danger-text` |
| `--ds-btn-disabled-bg` |
| `--ds-btn-disabled-border` |
| `--ds-btn-disabled-text` |
| `--ds-btn-primary-bg` |
| `--ds-btn-primary-bg-hover` |
| `--ds-btn-primary-border` |
| `--ds-btn-primary-disabled-bg` |
| `--ds-btn-primary-disabled-border` |
| `--ds-btn-primary-disabled-text` |
| `--ds-btn-primary-text` |
| `--ds-btn-primary-text-hover` |
| `--ds-btn-primary-text-selected` |
| `--ds-btn-selected-bg` |
| `--ds-btn-selected-border` |
| `--ds-btn-selected-text` |
| `--ds-btn-tertiary-bg` |
| `--ds-btn-tertiary-bg-hover` |
| `--ds-btn-tertiary-border` |
| `--ds-btn-tertiary-text` |
| `--ds-btn-text` |
| `--ds-btn-text-hover` |
| `--ds-btn-text-quiet` |
| `--ds-btn-text-quiet-active` |
| `--ds-btn-text-quiet-hover` |
| `--ds-card-bg` |
| `--ds-card-border` |
| `--ds-card-secondary-bg` |
| `--ds-card-secondary-border` |
| `--ds-card-secondary-text` |
| `--ds-card-secondary-text-muted` |
| `--ds-card-structural-bg` |
| `--ds-card-structural-border` |
| `--ds-card-subtitle-color` |
| `--ds-card-text` |
| `--ds-card-text-muted` |
| `--ds-card-title-color` |
| `--ds-card-top-rule-color` |
| `--ds-check-bg` |
| `--ds-check-border` |
| `--ds-check-checked-bg` |
| `--ds-check-mark` |
| `--ds-chip-accent-bg` |
| `--ds-chip-accent-border` |
| `--ds-chip-accent-text` |
| `--ds-chip-alt-bg` |
| `--ds-chip-alt-border` |
| `--ds-chip-alt-text` |
| `--ds-chip-bg` |
| `--ds-chip-border` |
| `--ds-chip-text` |
| `--ds-color-input-bg` |
| `--ds-icon-action-active-bg` |
| `--ds-icon-action-border` |
| `--ds-icon-action-border-hover` |
| `--ds-icon-action-fg` |
| `--ds-icon-action-fg-active` |
| `--ds-icon-action-fg-hover` |
| `--ds-icon-action-hover-bg` |
| `--ds-input-bg` |
| `--ds-input-border` |
| `--ds-input-icon-color` |
| `--ds-input-icon-color-focus` |
| `--ds-input-placeholder` |
| `--ds-input-readonly-bg` |
| `--ds-input-readonly-border` |
| `--ds-input-readonly-placeholder` |
| `--ds-input-readonly-text` |
| `--ds-input-text` |
| `--ds-range-thumb-bg` |
| `--ds-range-thumb-border` |
| `--ds-range-track-bg` |
| `--ds-range-track-border` |
| `--ds-scrollbar-thumb` |
| `--ds-scrollbar-track` |
| `--ds-shell-border` |
| `--ds-skeleton-base` |
| `--ds-skeleton-shimmer` |
| `--ds-spin-bg` |
| `--ds-spin-border` |
| `--ds-spin-glyph` |
| `--ds-tab-active-bg` |
| `--ds-tab-active-border` |
| `--ds-tab-active-fg` |
| `--ds-tab-active-icon` |
| `--ds-tab-bg` |
| `--ds-tab-border` |
| `--ds-tab-fg` |
| `--ds-validation-danger-bg` |
| `--ds-validation-danger-border` |
| `--ds-validation-danger-text` |
| `--ds-validation-success-bg` |
| `--ds-validation-success-border` |
| `--ds-validation-success-text` |

## style

Geometry, border construction, shadows, motion and interaction effects.

| Token |
|---|
| `--ds-arrow-btn-radius` |
| `--ds-border-style` |
| `--ds-border-w` |
| `--ds-btn-press-transform` |
| `--ds-btn-primary-shadow` |
| `--ds-btn-primary-shadow-active` |
| `--ds-btn-primary-shadow-compact` |
| `--ds-btn-primary-shadow-compact-hover` |
| `--ds-btn-primary-shadow-hover` |
| `--ds-btn-radius` |
| `--ds-btn-selected-shadow` |
| `--ds-btn-shadow` |
| `--ds-btn-shadow-active` |
| `--ds-btn-shadow-compact` |
| `--ds-btn-shadow-compact-active` |
| `--ds-btn-shadow-compact-hover` |
| `--ds-btn-shadow-hover` |
| `--ds-btn-tertiary-shadow` |
| `--ds-btn-tertiary-shadow-compact` |
| `--ds-btn-tertiary-shadow-compact-hover` |
| `--ds-btn-tertiary-shadow-hover` |
| `--ds-card-radius` |
| `--ds-card-secondary-shadow` |
| `--ds-card-secondary-shadow-compact` |
| `--ds-card-shadow` |
| `--ds-card-shadow-compact` |
| `--ds-card-structural-shadow` |
| `--ds-card-top-rule-size` |
| `--ds-color-input-radius` |
| `--ds-color-input-shadow` |
| `--ds-dur-fast` |
| `--ds-dur-med` |
| `--ds-ease-emphasis` |
| `--ds-ease-standard` |
| `--ds-field-row-radius` |
| `--ds-icon-action-radius` |
| `--ds-input-readonly-shadow` |
| `--ds-input-shadow` |
| `--ds-motion-slow` |
| `--ds-radius-1` |
| `--ds-radius-2` |
| `--ds-radius-3` |
| `--ds-radius-4` |
| `--ds-radius-pill` |
| `--ds-range-thumb-shadow` |
| `--ds-scrollbar-radius` |
| `--ds-shadow-md` |
| `--ds-shadow-sm` |
| `--ds-shell-shadow` |
| `--ds-spin-opacity` |
| `--ds-spin-opacity-active` |

## typography

Font stacks, text sizes, line height, label casing and tracking.

| Token |
|---|
| `--ds-arrow-btn-font-size` |
| `--ds-btn-icon-font-size` |
| `--ds-font-mono` |
| `--ds-font-sans` |
| `--ds-fs-1` |
| `--ds-fs-2` |
| `--ds-fs-3` |
| `--ds-fs-4` |
| `--ds-fs-5` |
| `--ds-fs-micro` |
| `--ds-label-spacing` |
| `--ds-label-transform` |
| `--ds-lh-base` |
| `--ds-table-dense-font-size` |
| `--ds-table-dense-header-font-size` |
| `--ds-tracking-ui-sm` |

## scale

Spacing, dimensions, layout density, control sizes and shell measurements.

| Token |
|---|
| `--ds-arrow-btn-size` |
| `--ds-btn-h` |
| `--ds-btn-h-sm` |
| `--ds-btn-icon-size` |
| `--ds-btn-icon-size-sm` |
| `--ds-btn-pad-x` |
| `--ds-card-pad` |
| `--ds-check-size` |
| `--ds-color-input-pad` |
| `--ds-control-h` |
| `--ds-control-h-sm` |
| `--ds-control-hit-min` |
| `--ds-field-action-w` |
| `--ds-field-label-w` |
| `--ds-field-row-gap` |
| `--ds-field-row-pad-x` |
| `--ds-field-row-pad-y` |
| `--ds-hud-card-max-w` |
| `--ds-hud-card-min-w` |
| `--ds-hud-marker-size` |
| `--ds-icon-action-size` |
| `--ds-layout-breakpoint-md` |
| `--ds-layout-col-left` |
| `--ds-layout-col-right` |
| `--ds-layout-gap` |
| `--ds-layout-mobile-rail-h` |
| `--ds-layout-overlay-inset` |
| `--ds-layout-panel-w` |
| `--ds-layout-rail-w` |
| `--ds-number-pad-end` |
| `--ds-pane-stack-gap-compact` |
| `--ds-panel-scroll-gap` |
| `--ds-panel-scroll-pad-x` |
| `--ds-panel-scroll-pad-y` |
| `--ds-range-thumb-size` |
| `--ds-range-track-h` |
| `--ds-rhythm-content` |
| `--ds-rhythm-content-tight` |
| `--ds-rhythm-section` |
| `--ds-rhythm-shell` |
| `--ds-rhythm-title-body` |
| `--ds-scrollbar-size` |
| `--ds-scrollbar-size-x` |
| `--ds-scrollbar-size-y` |
| `--ds-section-head-h` |
| `--ds-shell-gap` |
| `--ds-shell-pad` |
| `--ds-size-cam-cell-h` |
| `--ds-size-cam-cell-w` |
| `--ds-size-control-hud` |
| `--ds-size-control-icon` |
| `--ds-size-header-control` |
| `--ds-size-rail-btn-h` |
| `--ds-size-tab-h` |
| `--ds-space-1` |
| `--ds-space-2` |
| `--ds-space-3` |
| `--ds-space-4` |
| `--ds-space-5` |
| `--ds-space-6` |
| `--ds-space-8` |
| `--ds-table-dense-cell-pad-x` |
| `--ds-table-dense-cell-pad-y` |
| `--ds-table-utility-col-w` |
| `--ds-toast-gap` |
| `--ds-toast-inset-x` |
| `--ds-toast-inset-y` |
| `--ds-toolbar-compact-gap` |
| `--ds-toolbar-compact-pad-x` |
| `--ds-toolbar-compact-pad-y` |

## texture

Material images, overlays, blend modes and backdrop effects.

| Token |
|---|
| `--ds-body-backdrop-blur` |
| `--ds-body-bg-image` |
| `--ds-body-texture-image` |
| `--ds-card-backdrop-blur` |
| `--ds-card-bg-image` |
| `--ds-card-texture-image` |
| `--ds-control-backdrop-blur` |
| `--ds-control-texture-image` |
| `--ds-texture-blend` |
| `--ds-texture-strength` |

## foundation

Stable compatibility aliases and stacking infrastructure; all module-owned tokens also have foundation defaults.

| Token |
|---|
| `--color-bg` |
| `--color-border` |
| `--color-card` |
| `--color-primary` |
| `--color-secondary` |
| `--color-surface` |
| `--color-text-primary` |
| `--color-text-secondary` |
| `--ds-z-drawer` |
| `--ds-z-dropdown` |
| `--ds-z-modal` |
| `--ds-z-sticky` |
| `--ds-z-toast` |

## generated

Read-only aliases recomputed by the composer; edit their source paint/texture tokens.

| Token |
|---|
| `--ds-body-paint-blend` |
| `--ds-btn-paint-color` |
| `--ds-btn-paint-image` |
| `--ds-btn-primary-paint-color` |
| `--ds-btn-primary-paint-image` |
| `--ds-btn-tertiary-paint-color` |
| `--ds-btn-tertiary-paint-image` |
| `--ds-card-paint-blend` |
| `--ds-card-paint-color` |
| `--ds-card-paint-image` |
| `--ds-control-paint-blend` |
| `--ds-input-paint-color` |
| `--ds-input-paint-image` |

## Existing compatibility exceptions

| Module | Preset | Tokens owned elsewhere | Reason |
|---|---|---|---|
| scheme | `mint-ink` | `--ds-focus` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `amber-glow` | `--ds-text`, `--ds-text-muted` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `industrial-lime` | `--ds-accent`, `--ds-accent-strong`, `--ds-focus`, `--ds-text`, `--ds-text-muted` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `skeuo-sky` | `--ds-focus` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `eva-wire-alert` | `--ds-text`, `--ds-text-muted` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `eva-unit01` | `--ds-accent`, `--ds-accent-strong`, `--ds-bg`, `--ds-bg-elevated`, `--ds-bg-raised`, `--ds-bg-soft`, `--ds-focus`, `--ds-text`, `--ds-text-muted` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `saturn-alloy` | `--ds-accent`, `--ds-accent-strong`, `--ds-bg`, `--ds-bg-elevated`, `--ds-bg-overlay`, `--ds-bg-raised`, `--ds-bg-soft`, `--ds-focus`, `--ds-text`, `--ds-text-muted` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `holo-nocturne` | `--ds-bg`, `--ds-bg-elevated`, `--ds-bg-raised`, `--ds-bg-soft` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `oilslick-organic` | `--ds-bg`, `--ds-bg-elevated`, `--ds-bg-raised`, `--ds-bg-soft` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| scheme | `neon-grid-signal` | `--ds-text`, `--ds-text-muted` | Legacy palette/shadow overlap retained pending appearance-preserving migration. |
| style | `terminal` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `technical` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `paper` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-chip-bg`, `--ds-chip-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `skeuo` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-chip-bg`, `--ds-chip-border` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `hud-glow` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `editorial` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `steel-refined` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `neon-signal` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `mono-editorial-style` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `terminal-amber` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `neumorph` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `eva-wire` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `industrial-frame` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `eva-unit01` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `saturn-skeuo` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `graphic-signal` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `graphic-diagram` | `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `rr4-racing` | `--ds-card-bg`, `--ds-card-bg-image`, `--ds-card-border`, `--ds-card-secondary-bg`, `--ds-card-secondary-border`, `--ds-card-structural-bg`, `--ds-card-structural-border`, `--ds-card-top-rule-color`, `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `old-web` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `candy-pop` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `complimentary-gradient` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `vaporwave-neon` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `holo-nocturne` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
| style | `oilslick-organic` | `--ds-label-spacing`, `--ds-label-transform` | Legacy component paints or label typography retained pending a separate ownership migration. |
