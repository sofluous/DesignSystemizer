# [TASK: DesignSystem/UX Patterns | Standardize Interaction Decisions | v0.1]

## Action Hierarchy
- Primary button: single main action in a region.
- Secondary button: alternate safe action.
- Destructive button: irreversible action, visually separated.
- Borderless/icon action: low-emphasis utility action (collapse, info, quick tools).

## Navigation Containers
### Sidebar Use
Use sidebar when:
- Information architecture is persistent across many views.
- Users need fast section switching while retaining context.

Avoid sidebar when:
- Task is short-lived and modal flow is clearer.
- Screen space is constrained and hierarchy is shallow.

### Modal Use
Use modal when:
- Immediate confirmation is required.
- User must complete/acknowledge before returning.

Avoid modal when:
- User needs cross-page comparison or long editing sessions.

### Drawer Use
Use drawer for contextual settings/inspectors that should not replace core content.

## Forms
- Label every control.
- Use inline validation for correctable errors.
- Keep dense numeric controls compact where values are short.

## Feedback
- Toast: transient result.
- Inline alert: persistent contextual issue.
- Dialog: high-risk decision confirmation.

## Component Emphasis Rules
1. One primary action per toolbar/dialog footer.
2. Primary actions align to the right; destructive/escape actions on the left when paired.
3. Icon-only buttons require tooltip/title and clear affordance.

## Cross-App Alignment
- For consolidated standards derived from Bonsai/Trekulate/Raden/KataCart, see `CROSS_APP_UI_RULES.md`.

## Gallery Card Pattern (Adopted Baseline)
- Card should read as a distinct object (Bonsai-style separation/polaroid feel).
- Utility actions are overlaid inside card bounds and must not change card height on reveal.
- Reveal triggers: `hover`, `focus-within`, and `is-selected`.
- Selected state persists action visibility for touch and pen workflows.
- Hidden actions must disable pointer interaction.

## Disclosure Pattern (Section + Row)
- Section headers: label cluster on left, collapse chevron terminal/right.
- Optional section info icon: label-adjacent, borderless, hover/focus reveal.
- Row-level disclosure uses same terminal/right collapse affordance.
- Inline row actions (icon buttons, show/hide toggles) remain operable independent of disclosure state unless intentionally disabled.

## Show/Hide Utility Pattern
- Use compact icon actions for row-level visibility controls.
- Reveal on row hover/focus to reduce baseline clutter.
- Keep control visible when active (`is-on`) so current state is legible at a glance.
- Visibility controls are not mutated by randomization actions.

## Randomization Lock Pattern
- Use per-property lock icon to exclude fields from randomization.
- Lock icon is hover/focus revealed by default and persists when locked.
- Lock does not disable manual input editing.
- Lock state should persist locally and be restored on app load.
- Lock icon pair standard: `iconoir-lock` (locked) and `iconoir-lock-slash` (unlocked).

## Panel Header Action Pattern
- Section header actions (collapse, show/hide) are icon controls, not full button treatments.
- Header order: title on the left, optional visibility toggle, collapse chevron on the right.
- Action icons must keep compact hit areas and low visual weight to avoid competing with section labels.
- Header actions should not introduce extra container borders/radius that read like primary controls.
- The non-icon header area should toggle collapse (large hit-target). Icon actions keep independent behavior.

## Field Row Action-Slot Pattern
- Reserve a fixed right-side action slot width on all property rows, including rows without visible actions.
- Use that slot for contextual row utilities (lock, visibility, quick reset) without shifting control alignment.
- Field alignment rule: label column and input column remain stable across rows regardless of action presence.
- Contextual row actions may reveal on `hover`/`focus-within`, but reserved space is always present.
- Row container height must honor the tallest control in the row; avoid icon rows collapsing below control height.

## Icon-Only Button Alignment Pattern
- Icon-only controls use the same box-model discipline as standard buttons (explicit width/height + min-width/min-height).
- Icon-only controls should use `margin: 0` and `box-sizing: border-box` to prevent offset drift in dense rows/toolbars.
- Header-level icon controls (collapse, visibility, rail/tool icons) should share a common size token for visual rhythm.

## Composite Inline Field Pattern
- For paired controls that represent one property (e.g., emissive color + strength), place inputs on one row.
- Do not stack paired controls unless viewport constraints require it.
- The composite control group should occupy the input column span while keeping row label alignment intact.

## Lock Affordance Pattern
- Lock controls should remain discoverable on desktop and mobile (always-present low-emphasis icon preferred).
- Recommended state model:
  - Unlocked idle: faint lock icon.
  - Unlocked hover/focus: accented lock icon.
  - Locked idle: solid lock icon.
  - Locked hover/focus: accented lock-slash icon (next-state preview for unlock).
- Single tap/click should toggle state immediately; avoid double-interaction requirements caused by row focus selection.
- Hover/focus highlight container should be a square icon-action surface (not circular/pill), driven by DS tokens rather than app-specific overrides.
- Apps should implement lock affordance via shared icon-action semantics (`ds-icon-action`) once tokenized, not custom per-app highlight geometry.
