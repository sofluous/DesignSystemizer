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
