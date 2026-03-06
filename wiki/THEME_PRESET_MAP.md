# Theme Preset Map

This document maps each shipped base theme to its preset recipe:
- `Color Family`
- `Hue`
- `Style`
- `Scale`
- `Texture`

It also defines what each preset category controls.

## Base Theme -> Preset Recipe

| Base theme | Color family | Hue | Style | Scale | Texture |
|---|---|---|---|---|---|
| `steel-night` | `bold` | `steel` | `technical` | `standard` | `brushed-metal` |
| `paper-mint` | `paper` | `green` | `paper` | `standard` | `paper-grain` |
| `amber-terminal` | `cathode` | `amber` | `terminal-amber` | `compact` | `noise-film` |
| `neon-grid` | `cathode` | `cyan` | `terminal` | `standard` | `wire-grid` |
| `mono-slate` | `monochrome` | `gray` | `technical` | `standard` | `clean` |
| `tech-grid` | `bold` | `blue` | `technical` | `compact` | `wire-grid` |
| `skeuo-panel` | `paper` | `blue` | `skeuo` | `standard` | `soft-gradient` |
| `industrial-terminal` | `cathode` | `lime` | `technical` | `compact` | `carbon-fiber` |
| `velvet-touch` | `neumorph` | `violet` | `neumorph` | `comfortable` | `soft-gradient` |
| `eva-wireframe` | `signal` | `signal-red` | `eva-wire` | `compact` | `noise-film` |
| `eva-unit-01` | `signal` | `violet` | `eva-unit01` | `compact` | `carbon-fiber` |
| `saturn-alloy` | `alloy` | `platinum` | `saturn-skeuo` | `standard` | `brushed-metal` |
| `old-web-portal` | `electric` | `ultraviolet` | `old-web` | `compact` | `pixel-grid` |
| `candy-spectrum` | `pastel` | `magenta` | `candy-pop` | `comfortable` | `spectrum-wash` |
| `complementary-wave` | `bold` | `cobalt` | `complimentary-gradient` | `standard` | `spectrum-wash` |
| `sunset-pop` | `sunset` | `magenta` | `vaporwave-neon` | `comfortable` | `wire-grid` |
| `holo-nocturne` | `alloy` | `ultraviolet` | `holo-nocturne` | `standard` | `clean` |
| `oilslick-nacre` | `alloy` | `teal` | `oilslick-organic` | `standard` | `nacre-flow` |
| `signal-poster` | `bold` | `orange` | `graphic-signal` | `standard` | `clean` |

## What Each Preset Category Controls

## 1) Color Family
Controls the semantic palette structure and contrast model.

Primary token targets:
- `--ds-bg`, `--ds-bg-elevated`, `--ds-bg-raised`, `--ds-bg-soft`
- `--ds-text`, `--ds-text-muted`
- `--ds-border`, `--ds-border-strong`
- `--ds-accent`, `--ds-accent-strong`
- status colors (`--ds-success`, `--ds-warning`, `--ds-danger`, `--ds-info`)

## 2) Hue
Applies hue direction (or neutral override) onto the family structure.

Primary effect:
- shifts hue angle for background/accent/status ramps
- can pin to neutral families (for example steel/platinum behavior)

## 3) Style
Controls shape, typography, and component material language.

Primary token targets:
- typography: `--ds-font-*`, `--ds-fs-*`, `--ds-lh-*`, label casing/spacing
- geometry: `--ds-radius-*`, border width/style
- component look: button/input/card backgrounds, borders, shadows
- interaction feel: hover/active depth, press transform

## 4) Scale
Controls density and sizing.

Primary token targets:
- spacing: `--ds-space-*`
- control sizing: `--ds-control-h-*`
- card and layout paddings
- typography scale adjustments where needed

## 5) Texture
Controls dynamic surface character layered over style.

Primary token targets:
- `--ds-body-texture-image`
- `--ds-card-texture-image`
- `--ds-control-texture-image`
- `--ds-texture-blend`, `--ds-texture-strength`
- `--ds-body-backdrop-blur`, `--ds-card-backdrop-blur`, `--ds-control-backdrop-blur`

## Composition Order (Runtime)

When a preset combo is applied:
1. Color Family base is applied.
2. Hue transformation is merged into that family.
3. Style preset overrides shape/type/component language.
4. Scale preset adjusts density/sizing.
5. Texture preset applies dynamic surface layers.
6. Manual Theme Builder token overrides are applied last.

This order is why a base theme can be recreated from its 5-preset recipe and then fine-tuned safely.
