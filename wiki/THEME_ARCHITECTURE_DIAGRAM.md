# Theme Architecture Diagram

This page shows how a base theme resolves into presets, properties, and final component behavior.

## Layer Model

```mermaid
flowchart TD
  A[Base Theme\nex: saturn-alloy] --> B[Preset Recipe]
  B --> B1[Color Family]
  B --> B2[Hue]
  B --> B3[Style]
  B --> B4[Scale]
  B --> B5[Texture]

  B1 --> C[Generated Color Bundle\n--ds-bg, --ds-text, --ds-accent ...]
  B2 --> C
  B3 --> D[Style Bundle\nshape, shadows, type, component paints]
  B4 --> E[Scale Bundle\nspacing, control heights, layout density]
  B5 --> F[Texture Bundle\nimage overlays, blend, blur strength]

  C --> G[Final Token Map\nroot style variables]
  D --> G
  E --> G
  F --> G

  G --> H[Semantic Layer\ncolor/typography/layout tokens]
  G --> I[Component Alias Layer\nbtn/input/card/native control tokens]

  H --> J[Rendered Components]
  I --> J
  J --> K[App UI Behavior + Appearance]
```

## Property Group Breakdown

```mermaid
flowchart LR
  P0[Theme Builder Group Tabs] --> P1[Semantic Colors]
  P0 --> P2[Typography]
  P0 --> P3[Density and Layout]
  P0 --> P4[App Layout and Utility]
  P0 --> P5[Geometry and Borders]
  P0 --> P6[Surface and Depth]
  P0 --> P7[Buttons and Inputs]
  P0 --> P8[Native Controls]
  P0 --> P9[Chips and Scrollbars]
  P0 --> P10[Motion and Layers]
  P0 --> P11[Z-Index and Stacking]

  P1 --> T1[Semantic tokens]
  P2 --> T2[Font + text scale tokens]
  P3 --> T3[Spacing + size rhythm]
  P4 --> T4[App shell dimensions]
  P5 --> T5[Radii + border system]
  P6 --> T6[Shadows + background surfaces]
  P7 --> T7[Button/input aliases]
  P8 --> T8[Checkbox/range/spinner/select aliases]
  P9 --> T9[Chip + scrollbar aliases]
  P10 --> T10[Durations/easing/press effects]
  P11 --> T11[Layer order tokens]
```

## Resolution Order Used by Studio

1. Clear any prior inline overrides.
2. Build color bundle from `Color Family + Hue`.
3. Apply `Style` bundle.
4. Apply `Scale` bundle.
5. Apply `Texture` bundle.
6. Sync builder controls from computed final values.

That order means later preset groups can intentionally override earlier values.