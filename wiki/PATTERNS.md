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

## Spacing Governance
### Ownership Rule
- Parent layout owns placement of children. Children should not push themselves around with ad hoc outer margins unless the pattern explicitly requires it.
- Component owns internal padding.
- Peer container owns gap between sibling items.
- Shell or page section owns gutters against viewport/panel edges.
- Stack/flow container owns vertical rhythm between mixed content blocks.

### Margin vs Gap Rule
- Prefer `gap` for spacing between peers in a shared container.
- Prefer container padding for interior breathing room.
- Reserve margin for semantic exceptions:
  - section separation when elements are not in a shared stack container
  - inline text flow inside rich content
  - deliberate overlap or offset patterns
- Do not combine child bottom margins with parent gap in the same pattern layer.

### Section Rhythm Rule
- A heading starts a section, so the space before a heading should usually be larger than the space after it.
- Heading-to-body spacing should be tighter than body-to-next-heading spacing.
- Section break rhythm should communicate hierarchy even when content blocks share the same component shell.
- Recommended pattern:
  - `heading -> intro/body`: one content gap
  - `body -> next heading`: one section gap
  - `section gap` must be visibly larger than `content gap`

### Text Flow Rule
- Body paragraphs inside one section share the content rhythm.
- A new subheading resets rhythm and must receive stronger top separation than a normal paragraph.
- Supporting meta text, captions, and helper copy stay visually attached to the item they describe, using a smaller local gap.
- Avoid giving every text block uniform spacing; that removes section cues and hurts scanability.

### Layout Layer Rule
- Shell layout owns page gutters and panel-to-panel spacing.
- Section/card owns its own padding.
- Internal section layout owns row/field/list gaps.
- Control row owns alignment between label, input, and utility actions.
- Field/control elements do not own external spacing beyond their local inline alignment needs.

### Toolbar and Cluster Rule
- Horizontal action clusters own button spacing via group gap, not per-button margins.
- Wrapping toolbars must preserve row rhythm with explicit row gap.
- Mixed emphasis actions should still align to one baseline and one padding system.

### List and Collection Rule
- Lists own spacing between items.
- Cards in a grid own no external margin; the grid owns column/row gap.
- A card’s header/body/footer spacing is internal and must not leak into surrounding layout.

### Panel Rule
- Panel shell owns edge padding and scroll gutter.
- Panel section owns spacing between its immediate child blocks.
- Nested control groups should use reduced local gap rather than full section spacing.

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
- Use square or softly rounded-square icon actions by default; circular utilities are exception-only.

## App Chrome Pattern
- App chrome should be composed from:
  - shell frame
  - persistent rail or sidebar when navigation is stable
  - top toolbar when command access must remain visible
  - inspector header utilities for context-specific actions
- A shell should not rely on ad hoc button styles; chrome actions should come from the same icon-action and toolbar rules as the rest of the system.
- Persistent navigation belongs in rails/sidebars, not mixed into commit-action toolbars.
- Toolbars carry commands; rails carry location/state.
- Inspectors carry context and low-emphasis row/header actions.

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
- Default baseline is square or softly rounded-square geometry.
- Circular icon controls should be rare and justified by a distinct interaction model, not visual variety.

## Composite Inline Field Pattern
- For paired controls that represent one property (e.g., emissive color + strength), place inputs on one row.
- Do not stack paired controls unless viewport constraints require it.
- The composite control group should occupy the input column span while keeping row label alignment intact.

## Heading + Section Pattern
- Section headings should be visually attached to the content they introduce, not spaced like another peer paragraph.
- If a heading follows content, it should use section-break spacing above and content spacing below.
- If helper actions exist for the section, they belong in the heading row, not as separate content blocks.
- Avoid orphaned headings at the bottom of cards/panels; keep heading and first content item together when wrapping.

## Empty State Pattern
- Empty states should include:
  - one clear title
  - one short explanatory sentence
  - one next-step action when appropriate
- Empty state spacing should feel more generous than dense control rows so it reads as a state change, not another data item.
- Empty-state icon and text should stay grouped tightly; the surrounding card owns the broader padding.

## Inspector Pattern
- Dense libraries, galleries, and tables should prefer a separate inspector over repeating metadata/actions on every item card.
- The browse surface should optimize for scanability.
- The inspector should own:
  - rich metadata
  - selection state
  - contextual actions
  - export/override operations

## Surface Nesting Pattern
- Each nested surface level should reduce emphasis or increase inset rather than repeating the same treatment at full strength.
- Avoid stacking multiple equally strong borders, shadows, and fills; that muddies hierarchy.
- If a nested group exists only for spacing, use layout primitives instead of another strong card shell.
- Recommended surface ladder:
  - Level 0: app/page background
  - Level 1: structural grouping surface when alignment alone should carry the layout
  - Level 2: primary card/panel surface or console window
  - Level 3: optional secondary card surface for nested/supporting groups
  - Level 4: interactive control surface (inputs, selects, toggles)
- Structural surfaces should often match the background or stay visually quiet.
- Secondary cards should feel like supporting windows or inset subpanels, not like form fields.
- Read-only fields should sit between supporting surfaces and active controls, not collapse into either.
- If supporting surfaces and controls become visually similar, interactivity cues will get lost.

## Card Header Action Pattern
- Use a shared split header when title/subtitle copy and actions must coexist.
- Left side owns the semantic reading rhythm.
- Right side owns compact utility or commit actions.
- The action area must not collapse the title block into toolbar spacing.
- If one action is primary, keep it in the action cluster but preserve the copy-first reading order.

## Footer Action Pattern
- Footer/action-bar spacing should be distinct from body content spacing.
- Content should not run directly into commit/cancel actions.
- Footer clusters own their own horizontal grouping and should not depend on content margins above them.

## Missing Rules To Continue Defining
- Responsive reflow rules for label/input/action rows at narrow widths.
- Standard spacing contract for table toolbars, filters, and result summaries.
- Standard spacing contract for chart panels and legend placement.
- Standard rhythm for mixed prose + controls inside documentation cards.
- Standard spacing/separation for timeline/history/event feed items.
- Standard pattern for sticky subheaders within long panels.
- Standard pattern for summary metrics above detailed tables or charts.

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
