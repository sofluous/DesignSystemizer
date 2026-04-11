# [TASK: DesignSystem/Component Specs | Define Top 10 Component Standards | v0.2-draft]

## Standard Spec Template
Use this template for new components.

### Component
- Name:
- Intent:
- Use When:
- Avoid When:

### Variants
- Default:
- Primary:
- Secondary:
- Destructive:
- Borderless/Icon-only:

### Anatomy
- Required parts:
- Optional parts:

### States
- Default, hover, focus-visible, active, disabled, loading
- Error/success/warning (if applicable)

### Interaction Rules
- Keyboard:
- Pointer:
- Touch:

### Accessibility
- Required role/attributes:
- Labeling requirements:
- Focus and contrast requirements:

### Token Mapping
- Surface tokens:
- Text tokens:
- Border/elevation tokens:
- Motion tokens:

### Anti-Patterns
- Misuse cases to avoid.

### Validation Checklist
- Behavior matches pattern rules.
- Token-only styling (no unsupported hardcoded values).
- State transitions function across themes.

---

## 1) Button
- Intent: Trigger a clear action.
- Use When: User must commit, continue, or execute.
- Avoid When: Action is low emphasis utility (use borderless/icon action).
- Variants:
- Primary: single highest-priority action per section.
- Secondary: safe alternate.
- Destructive: irreversible action.
- Borderless: low-emphasis utility action.
- States: default/hover/focus/active/disabled/loading.
- Interaction:
- `Enter`/`Space` activates when focused.
- Loading disables repeat activation.
- Accessibility:
- Must have visible text label unless icon-only with `aria-label`.
- Token Mapping:
- `--ds-btn-*`, `--ds-btn-primary-*`, `--ds-btn-text-quiet*`.

## 2) Icon Button
- Intent: Compact action with icon affordance.
- Use When: Toolbar actions, map controls, close/expand utilities.
- Avoid When: Primary business action without label context.
- Variants: default, ghost, borderless icon action.
- Anatomy: button container + icon glyph.
- Interaction: minimum hit target preserved by size tokens.
- Accessibility:
- Requires `aria-label`.
- Tooltip/title recommended for ambiguous symbols.
- Token Mapping:
- `--ds-btn-icon-size*`, `--ds-btn-icon-font-size`, button base tokens.
- For square icon-action highlight behavior (lock/collapse/show-hide), use `.ds-icon-action` with:
  - `--ds-icon-action-size`
  - `--ds-icon-action-radius`
  - `--ds-icon-action-fg`
  - `--ds-icon-action-fg-hover`
  - `--ds-icon-action-fg-active`
  - `--ds-icon-action-hover-bg`
  - `--ds-icon-action-active-bg`
  - `--ds-icon-action-border*`
- Geometry Rule:
- Default icon actions should be square or softly rounded-square.
- Circular icon buttons are exception-only and should be reserved for cases with a strong platform or media-control reason.

## 2a) Utility Icon Action
- Intent: Low-emphasis, stateful utility control for shells, rows, rails, and inspector headers.
- Use When:
- Show/hide
- Lock/unlock
- Info/help
- Expand/collapse
- Settings/tune
- More/overflow
- Avoid When:
- The action is the primary commit for a region.
- The icon meaning is unclear without surrounding context.
- Anatomy:
- Compact button surface
- Single icon glyph
- Optional persistent selected/toggled state
- Accessibility:
- Requires `aria-label`.
- Use `aria-pressed` for persistent toggles.
- Add `title` for desktop discoverability when text is absent.
- Rules:
- Keep utility icon actions visually lighter than primary/secondary buttons.
- Place them terminal/right in headers and rows unless the pattern explicitly calls for another position.
- Active utility state should remain visible even when the surrounding row is not hovered.
- Token Mapping:
- Button base tokens
- icon sizing tokens
- active/selected button tokens

## 3) Text Input / Textarea / Select
- Intent: Capture user-entered or selected values.
- Use When: Form data input.
- Avoid When: Binary choices (use checkbox/switch/radio).
- Variants: default, invalid, disabled, readonly.
- Anatomy: label + control + optional help/error text + optional icon.
- Interaction:
- Preserve cursor/focus clarity.
- Validation feedback inline near field.
- Accessibility:
- Explicit label required.
- Error associations with `aria-describedby` when applicable.
- Token Mapping:
- `--ds-input-*`, `--ds-input-icon-*`, `--ds-color-input-*`.

## 4) Choice Controls (Checkbox / Radio / Switch)
- Intent: Boolean and single/multi-option selection.
- Use When:
- Checkbox: independent toggles.
- Radio: mutually exclusive choice.
- Switch: immediate on/off system behavior.
- Avoid When: Unknown consequence delayed actions.
- Interaction:
- Keyboard toggles with `Space`.
- State visible without color-only cues.
- Accessibility:
- Group radios with shared name and logical labeling.
- Token Mapping:
- `--ds-check-*`, switch and input tokens.

## 5) Range Slider
- Intent: Continuous or stepped numeric adjustment.
- Use When: Relative tuning (volume, opacity, threshold).
- Avoid When: Exact value entry is primary (use numeric input).
- Interaction:
- Keyboard arrow support expected.
- Always show current value nearby.
- Accessibility:
- Label and value output present.
- Token Mapping:
- `--ds-range-track-*`, `--ds-range-thumb-*`.

## 6) Dropdown Menu
- Intent: Show list of contextual actions.
- Use When: Secondary action menus and overflow controls.
- Avoid When: Fewer than 2 visible actions or primary actions.
- Interaction:
- Opens anchored to trigger.
- Closes on outside click and Escape.
- Accessibility:
- Trigger `aria-expanded` and menu semantics.
- Token Mapping:
- menu container uses card/surface/border/shadow tokens.

## 7) Popover / Context Help
- Intent: Inline contextual information anchored to a trigger.
- Use When: Lightweight guidance, hints, or metadata.
- Avoid When: Multi-step workflows (use modal/drawer).
- Interaction:
- Position above/below trigger to avoid occluding target.
- Close on outside click and Escape.
- Accessibility:
- Trigger label must indicate contextual help intent.
- Token Mapping:
- surface, border, text, shadow, z-layer tokens.

## 8) Modal Dialog
- Intent: Interrupt flow for confirmation or focused tasks.
- Use When: High-risk or high-focus decisions.
- Avoid When: Persistent settings that can remain contextual.
- Interaction:
- Focus trap while open.
- Escape closes unless blocked by critical flow.
- Primary action right-aligned, destructive/escape left.
- Accessibility:
- Title and description announced.
- Background inert/blocked.
- Token Mapping:
- overlay, panel surface, border, elevation, z-layer tokens.

## 9) Drawer / Side Panel
- Intent: Contextual settings/inspector while keeping base view.
- Use When: Supplemental controls or details.
- Avoid When: User must complete a hard confirmation flow.
- Interaction:
- Slide in from edge; close explicit and outside interaction as appropriate.
- Accessibility:
- Labeled region/dialog semantics.
- Token Mapping:
- panel width/layout tokens, surface/elevation/border tokens.

## 10) Toast Notification
- Intent: Transient non-blocking feedback.
- Use When: Confirm save, background completion, lightweight errors.
- Avoid When: User must decide or resolve immediately.
- Interaction:
- Auto-dismiss with sufficient readability time.
- Optional manual dismiss for critical messages.
- Accessibility:
- Appropriate live region politeness per severity.
- Token Mapping:
- toast surface, border, elevation, status tokens.

---

## Coverage Status (Studio Implementation)
- Base controls: buttons, icon buttons, inputs, textarea, select, checkbox/radio/switch, range.
- Feedback/status: badges, chips, status text, meter, progress, toast stack, skeleton states.
- Navigation/structure: tabs/subtabs, rail nav, segmented controls, dropdown menu, popover.
- Surfaces/layout: cards (`default`, `secondary`, `structural`), drawers, modals, empty states.
- Dense utilities: toolbar, toolbar-compact, field-row, panel-scroll, dense-table, section headers, utility icon actions.
- Studio-specific templates: camera pad, production toolbar, master control panel, gizmo widget, snapshot card.

## Remaining Coverage Work
- Accordion contract normalization.
- Date/time picker contract and native/themed behavior notes.
- Expand command palette keyboard-state guidance from demo baseline to full command UX parity.

---

## 11) Custom App Components (Cross-App Canonical)

### Field Row (`.ds-field-row`)
- Intent: Stable dense property control layout for generator panels.
- Use When: `label + control + optional action` rows in inspector/panel UIs.
- Anatomy:
- Label column (`.ds-label` or `.control-label`).
- Control column (`.control-input` or `.ds-field-control`).
- Action slot (`.control-icons` or `.ds-field-actions`), always reserved.
- Token Mapping:
- `--ds-field-label-w`
- `--ds-field-action-w`
- `--ds-field-row-gap`
- `--ds-control-h-sm`

### Compact Toolbar (`.ds-toolbar-compact`)
- Intent: Dense action row for editors, inspectors, and utility shells.
- Use When: A tool surface needs several secondary actions in one horizontal row.
- Avoid When: Primary page-level CTAs need more visual breathing room.
- Behavior:
- Desktop: keeps controls on a single horizontal row with inline scrolling.
- Mobile: allows wrapping fallback for narrower layouts.
- Works with `.ds-btn`, `.ds-select`, and `.ds-input`.
- Token Mapping:
- `--ds-toolbar-compact-gap`
- `--ds-toolbar-compact-pad-x`
- `--ds-toolbar-compact-pad-y`

### Panel Scroll Shell (`.ds-panel-scroll`)
- Intent: Standardized inner scroll region for side panels and inspector bodies.
- Use When: A panel body needs stable padding and scrollbar behavior.
- Avoid When: The host surface already owns spacing and overflow.
- Behavior:
- Applies stable scroll gutter, panel-friendly padding, and min-height safety.
- Combine with `.ds-stack` when the panel body contains stacked sections.
- Token Mapping:
- `--ds-panel-scroll-pad-x`
- `--ds-panel-scroll-pad-y`
- `--ds-panel-scroll-gap`

### Dense Table (`.ds-table-dense`)
- Intent: Compact data/control table for editors and inspector-like UIs.
- Use When: Rows contain toggles, icon actions, or short mappings.
- Avoid When: Readability for large data tables matters more than density.
- Behavior:
- Smaller cell padding and header text.
- Supports utility columns via `.ds-table-utility-col` / `.ds-table-utility-cell`.
- Supports selected-state rows via `.ds-table-row-selected`.
- Token Mapping:
- `--ds-table-dense-cell-pad-y`
- `--ds-table-dense-cell-pad-x`
- `--ds-table-dense-font-size`
- `--ds-table-dense-header-font-size`
- `--ds-table-utility-col-w`

### Command Palette (`.ds-command-palette`)
- Intent: Fast command execution surface with searchable actions and keyboard hints.
- Use When: Productivity workflows where users trigger frequent actions without navigating full panels.
- Anatomy:
- Header row (`.ds-command-palette-head`) with context/count metadata.
- Search input.
- Scrollable result list (`.ds-command-palette-list`).
- Result rows (`.ds-command-item`) with action copy + shortcut hint.
- Rules:
- First/high-confidence result may render as active (`.is-active`) by default.
- Result rows must keep command title and helper copy readable at compact density.
- Result list should scroll independently when results exceed available height.

### Section Header (`.ds-section-header`)
- Intent: Standardized section title/action row with predictable collapse affordance.
- Use When: Collapsible control sections with terminal icon actions.
- Token Mapping:
- `--ds-section-head-h`
- `--ds-space-2`
- icon action tokens (`--ds-icon-action-*`)

### Card Head With Actions (`.ds-card-head-actions`)
- Intent: Keep card titles/subtitles and utility actions aligned without collapsing the reading rhythm.
- Use When: A card needs title/subtitle copy on the left and utility/commit actions on the right.
- Avoid When: The card only needs copy; use `.ds-card-head` instead.
- Anatomy:
- `.ds-card-head-actions`
- `.ds-card-head-copy`
- `.ds-card-head-tools`
- Rules:
- Copy block owns title/subtitle rhythm.
- Tool cluster should stay visually secondary unless it contains the one primary action for that region.
- Action cluster should wrap safely without changing the copy rhythm.

### Secondary Card Surface (`.ds-card-secondary`)
- Intent: Differentiate nested/supporting cards from primary panel cards without making them read like inputs.
- Use When: A card contains another card-like region and border-only separation is too weak.
- Avoid When: Nesting exists only for spacing; use layout primitives instead.
- Token Mapping:
- `--ds-card-secondary-bg`
- `--ds-card-secondary-border`
- `--ds-card-secondary-shadow`
- Rules:
- Secondary level is optional, not mandatory.
- Do not create more than one additional card emphasis level unless the workflow truly requires it.
- Secondary surfaces must remain clearly different from interactive field surfaces.

### Structural Card Surface (`.ds-card-structural`)
- Intent: Allow a card container to behave as a layout/scaffolding region without adding another visible surface layer.
- Use When: Alignment, rhythm, and grouping should provide the structure more than chrome.
- Avoid When: Users need a clear supporting window or console panel; use `.ds-card-secondary` instead.
- Token Mapping:
- `--ds-card-structural-bg`
- `--ds-card-structural-border`
- `--ds-card-structural-shadow`
- Rules:
- Structural cards should stay visually quiet.
- Use them to prevent unnecessary card stacking.
- They should not compete with either primary cards or interactive control surfaces.

### Read-Only Field Surface (`[readonly]`)
- Intent: Separate non-editable values from interactive inputs without pushing them into the background.
- Use When: Showing generated IDs, computed outputs, or locked metadata.
- Token Mapping:
- `--ds-input-readonly-bg`
- `--ds-input-readonly-border`
- `--ds-input-readonly-text`
- `--ds-input-readonly-placeholder`
- `--ds-input-readonly-shadow`
- Rules:
- Read-only fields should sit between nested support surfaces and active controls in the depth ladder.
- They must not look identical to editable inputs.
- They must remain more legible and foregrounded than background/structural surfaces.

### Tab Active Contrast
- Intent: Ensure active tab text/icon readability across all themes.
- Use When: Any selected tab/subtab state.
- Token Mapping:
- `--ds-tab-active-fg`
- `--ds-tab-active-bg`
- `--ds-tab-active-border`
- `--ds-tab-active-icon`

### Shell Frame + Toast Placement
- Intent: Keep app-level frame spacing and toast placement consistent across apps.
- Token Mapping:
- `--ds-shell-gap`
- `--ds-shell-pad`
- `--ds-shell-border`
- `--ds-shell-shadow`
- `--ds-toast-inset-x`
- `--ds-toast-inset-y`
- `--ds-toast-gap`

### Sidebar Shell
- Intent: Persistent navigation + contextual utility actions for tool-centric apps.
- Use When: App sections remain stable and users need constant quick switching.
- Avoid When: Workflow is linear or modal-only.
- Anatomy:
- Sidebar region (fixed width or collapsed width).
- Main content region.
- Optional right-aligned action group in main region.
- Interaction:
- Collapsible state must preserve keyboard access.
- Active nav item should remain visually distinct.
- Token Mapping:
- `--ds-layout-panel-w`, `--ds-bg-raised`, `--ds-border`, button/nav tokens.

### Inspector Header Utilities
- Intent: Keep title/subtitle copy readable while exposing low-emphasis header actions.
- Use When: Inspectors, settings groups, layer panels, and contextual subpanels.
- Anatomy:
- Left: title/subtitle copy
- Right: utility icon actions
- Common actions:
- show/hide
- lock/unlock
- info/help
- settings/tune
- collapse/expand
- Rules:
- Copy rhythm must remain primary.
- Utility actions stay compact and terminal/right.
- Do not substitute full-size buttons for header utilities unless the action is truly primary.

### Camera Controls Pad
- Intent: Compact directional + zoom control cluster for canvas/map/viewport interactions.
- Use When: Fine movement and zoom need quick repeated access.
- Avoid When: Gesture-only interaction is sufficient.
- Anatomy:
- 3x3 pad:
  - Top row view presets.
  - Middle row left/home/right navigation.
  - Bottom row alternate view/snap actions.
- Secondary action row: zoom in, zoom out, reset.
- Numeric/coordinate readout.
- Interaction:
- Buttons support keyboard activation.
- Reset always returns known baseline.
- Readout updates immediately after each action.
- Token Mapping:
- button tokens, compact size tokens, spacing tokens, muted/readout text tokens.

### Production Toolbar
- Intent: Stable top-level command strip for creation/review/publish workflows.
- Use When: Users perform repeated task switching with clear action hierarchy.
- Avoid When: Fewer than 2 actions or highly contextual controls (use popover/drawer).
- Anatomy:
- Left: low-risk utility tools.
- Center: context/status chips.
- Right: commit actions (destructive left of primary).
- Interaction:
- One primary action in the right cluster.
- Destructive action immediately left of primary.
- Token Mapping:
- `--ds-btn-*`, `--ds-chip-*`, surface/border/layout gap tokens.

### Master Control Panel Template
- Intent: Canonical compact control layout for tool-heavy apps (Trekulate/Bonsai/KataCart style).
- Anatomy:
- Left rail tabs (icon buttons).
- Group cards with `icon + label + control + readout` rows.
- Footer action bar with destructive-left / primary-right alignment.
- Icon Rules:
- Use one icon family per app surface (do not mix line styles in one panel).
- Each icon-only control must have `title` and `aria-label` when text is absent.
- Keep icon slot width fixed to avoid row jitter.
- Interaction:
- Rail tab switch updates visible pane without layout shift.
- Slider/readout pairs update in real time.

### Gizmo Widget
- Intent: Standardized directional transform controls for object/viewport manipulation.
- Anatomy:
- 3x3 directional grid:
  - XY arrows (`up/down/left/right`)
  - Z-axis controls (`z+/z-`)
  - Scale controls (`s+/s-`)
  - Center anchor button.
- Secondary action row:
  - Fine step toggle
  - Coarse step toggle
  - Reset
- Live readout (`x/y/z/scale`).
- Interaction:
- Every action updates readout immediately.
- Fine/coarse mode changes transform step size.
- Reset restores `x:0 y:0 z:0 scale:1`.
- Token Mapping:
- compact control-size tokens, button tokens, spacing tokens, mono readout text tokens.
