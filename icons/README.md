# Design System Icons Repository

This folder stores SVG source icons used across apps.

## Conventions
- `24x24` viewBox
- stroke-first icons by default:
  - `fill="none"`
  - `stroke="currentColor"`
  - `stroke-width="1.8"`
  - `stroke-linecap="round"`
  - `stroke-linejoin="round"`
- File naming: kebab-case, action-oriented (`search.svg`, `location-pin.svg`)

## Workflow
1. Track needed icon situations in Studio `Icons` tab.
2. Prioritize via Hitlist score.
3. Replace placeholders with final SVGs here.
4. Re-export and consume in apps via inline SVG or symbol sprites.
