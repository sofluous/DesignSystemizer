# [TASK: DesignSystem/Iconography | Define Icon Library Standards | v0.1]

## Goal
Create a coherent in-house icon library with consistent visual grammar and usage semantics.

## Visual Grammar
- Stroke weight: define default and size variants.
- Corner style: rounded vs sharp policy.
- Grid: optical alignment on consistent canvas.
- Fill strategy: outline-first, filled only for explicit semantic needs.

## Naming Convention
- `category-name-state` (example: `nav-chevron-down`, `status-alert-filled`).
- Keep action icons verb-oriented where possible.

## Usage Rules
1. Icon-only buttons must include accessible label (`aria-label`).
2. Borderless icons are for low-emphasis utility actions.
3. Primary actions should not rely on icon-only controls unless space constrained.
4. Icons inside inputs must inherit tokenized input/icon colors.
5. Utility action symbols should default to outline icons, not filled silhouettes.
6. Utility icon buttons should use one family per surface and one stroke logic per app region.

## Utility Symbol Source Of Truth
- Preferred utility action set:
  - show/hide
  - lock/unlock
  - info/help
  - settings/tune
  - more/overflow
  - collapse/expand
- Legibility rules:
  - outline-first
  - strong stroke contrast
  - no accidental fill on line icons
  - readable at compact button sizes
- Behavior rules:
  - active state remains visible at rest
  - inactive state may stay hidden until row/header hover to reduce clutter
  - the glyph always represents the current state, including on hover/focus; the title describes the next action
  - persistent lock/visibility states do not fill the button container; use glyph shape and visibility, stable toggle labels and aria-pressed
  - preserve keyboard focus after toggling; reveal inactive actions on row hover/focus and on non-hover devices
- Geometry rules:
  - square or softly rounded-square icon actions are the baseline
  - circular utility buttons are exception-only

## Semantic Categories
- Navigation
- Actions
- Status/Feedback
- Data/Objects
- Media/Controls

## Delivery Format
- Source: SVG
- Component wrapping strategy (future): sprite or inline helpers
- Versioning by changelog entry

## Semantic Library Workflow
1. Register semantic situations and usage in `js/icon-registry.js`.
2. Compare candidates using the primary Lucide outline family where practical; document secondary-source exceptions and custom artwork.
3. Keep browser preferences separate from the project-approved standard.
4. Prepare and import approval files with pinned provenance and license notices.
5. Package approved local SVGs, semantic mappings and the runtime helper for consuming apps.
6. Update artwork through versioned DS releases without renaming stable aliases.

See [Icon approval and delivery](ICON_LIBRARY_WORKFLOW.md) for commands, metadata, accessibility and recovery rules. Sourced icons can remain permanent approved standards; redrawing them in-house is optional.
