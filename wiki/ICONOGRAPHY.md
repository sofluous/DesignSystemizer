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

## Semantic Library Workflow
1. Track icon situations by DS semantic alias first, not vendor icon name.
2. Maintain candidate options in `js/icon-registry.js`.
3. Assign a `defaultCandidateId` as the first-pass best guess.
4. Override the choice when a better semantic fit is found.
5. Export the alias manifest from Studio so apps can consume stable DS mappings.
6. Replace vendor selections with local DS SVGs over time without changing the alias contract.
