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

## Coverage Next
- Chips / Badges / Pills
- Tabs / Accordion
- Table / Data grid
- Date and time controls
