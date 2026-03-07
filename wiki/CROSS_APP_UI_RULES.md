# [TASK: DesignSystem/Cross-App Standards | Consolidate Common UX/UI Rules | v0.1]

## Scope
This document consolidates recurring patterns observed in:
- `/_bonsai`
- `/_TREKULATE`
- `/_Raden`
- `/_KataCart`

Use this as source-of-truth guidance when implementation choices differ between apps.

## Key Findings
1. Action hierarchy and button placement are mostly consistent, but ad-hoc exceptions still appear in panel footers and compact tool rows.
2. App-level alias tokens (`--surface-*`, `--accent-*`, custom shell aliases) are useful but can drift from DS semantics over time.
3. Modal/drawer/popover behavior is mostly aligned, but close/escape behavior and layering can diverge between apps.
4. Dense control rows are repeated with custom layout math rather than shared field-row semantics.
5. Preset composition can break when style presets hardcode full palette tokens.

## Source-of-Truth Rules

### 1) Action Hierarchy
- One primary action per action region (toolbar, panel footer, modal footer).
- Primary actions align right.
- Destructive actions sit immediately left of primary.
- Neutral cancel/back actions stay left.
- Icon-only actions must have tooltip/title and clear affordance.

### 2) Surface and Token Layering
- Apps should consume DS semantic tokens directly where possible.
- If aliases are required, maintain a documented alias contract and keep it one-way (alias from DS, never redefine DS semantics).
- Avoid hardcoding core palette tokens in style presets unless intentionally palette-locked.

### 3) Preset Composition
- Family/Hue define color intent.
- Style defines geometry, typography, and material behavior.
- Scale defines spacing/sizing.
- Texture defines surface dynamics.
- If a base theme needs a fixed branded look, apply base-theme visual overrides only when preset selections match its default combo.

### 4) Interaction Containers
- Sidebar: persistent cross-view navigation or always-available controls.
- Drawer: contextual controls/inspector, non-blocking.
- Modal: blocking confirmations or required decisions.
- Popover: contextual guidance that must anchor near trigger and avoid viewport overflow.

### 5) Form and Control Rows
- Use consistent row semantics: `label + control + optional readout`.
- Keep compact numeric fields bounded and avoid full-width numeric inputs where values are short.
- Input adornment icons must inherit contextual token colors, not hardcoded black/white.

### 6) Section Header Interaction Contract
- Every collapsible section header uses a right-aligned chevron icon button.
- Chevron orientation communicates state: expanded points down, collapsed points right.
- Secondary help/info action is a borderless icon button anchored adjacent to the section label text, and should be hover/focus revealed (not persistent in dense control panels).
- Header action order: `info` before `collapse` to keep collapse affordance as the terminal action.
- Global/app help entry point is required in each app shell (for overview + searchable guidance). Section-level and label-level help are optional and should scale with complexity.

### 7) Collapsible Row/Section Recommendation (Adopted)
- Support collapse at both levels when needed:
- Section-level collapse for major groups.
- Row-level collapse/disclosure for advanced controls within a section.
- Row interaction contract must preserve utility actions in the same row:
- Layout order: `label cluster` -> `row utility actions` -> `collapse/disclosure`.
- Collapse trigger must remain the terminal/rightmost control for predictable scanning.
- If a row has show/hide toggles or icon actions, they remain available while collapsed unless explicitly hidden by product intent.
- Both section and row collapse states should be keyboard accessible and persist when practical.

### 8) Show/Hide Property Controls (Adopted)
- Show/hide controls in dense rows should be low-intrusion icon actions with hover/focus reveal.
- Active state must persist visibility of the control (`is-on` stays visible even when not hovered).
- Hidden/inactive state should reduce emphasis and pointer noise (lower opacity + no busy borders).
- Show/hide state is independent from randomization and must not be changed by randomize actions.
- Row scanning order remains: `label cluster` -> `utility actions (show/hide, info)` -> `collapse`.

### 9) Randomization Lock Controls (Adopted)
- Lock control excludes a property from randomization only; it does not disable manual edits.
- Lock controls should be icon-first, borderless/low-emphasis, and hover/focus revealed.
- Locked controls remain visibly active (`is-locked`) even outside hover.
- Lock state should persist per app/session via local storage unless project has server persistence.
- Randomization engine must check lock state before mutating each eligible property.

### 10) Gallery Card Utility Actions
- Action buttons must overlay the card content (no layout reflow) to prevent jitter.
- Use Bonsai-style visual treatment as baseline for gallery cards (stronger separation, photo/polaroid feel).
- Gallery/snapshot tile actions are hidden by default and revealed on tile `hover` and `focus-within`.
- Touch/selection model is required: selected tile keeps actions visible/persistent.
- Hidden state must also disable pointer interaction.
- Revealed state should animate with quick opacity/translate transitions for continuity.
- Keyboard users must get the same reveal behavior via focus and selection.

### 11) Feedback Semantics
- Toast = transient completion/status.
- Inline alert = persistent contextual issue.
- Dialog = high-risk or irreversible confirmation.

### 12) Theme Reliability
- Validate at least one light, one dark, and one high-style theme for every major UI path.
- Confirm primary/secondary text contrast for button states in each validated theme.
- Ensure native date/time/select indicators remain readable after theming.

## Decision Matrix (Quick Use)
- Need persistent navigation? Use sidebar.
- Need temporary contextual controls? Use drawer.
- Need blocking confirmation? Use modal.
- Need subtle contextual explanation? Use popover/tooltip.
- Need low-emphasis utility action? Use borderless/icon button.

## Implementation Backlog Candidates
1. `ds-field-row` component for label/control/readout alignment.
2. `ds-action-bar` component for fixed/sticky panel actions.
3. Alias-token contract guidance (`ds-app-shell`) with approved naming.
4. Preset lock metadata (`palette-locked`, `surface-locked`, `composable`) surfaced in Theme Builder UI.
5. `ds-gallery-card` contract with overlay actions + selected persistence behavior.
6. `ds-disclosure-row` contract supporting inline row actions + terminal collapse affordance.
7. `ds-visibility-toggle` contract (hover-reveal + active persistence).
8. `ds-random-lock` contract (exclude-from-randomization state + persistence).

## Rollout Prep (App Batches)
1. `Raden`
- Align gallery cards to Bonsai baseline: overlay actions, selected persistence state, stronger card separation.
- Keep current section card shell style.
- Keep section info hover-reveal label-adjacent and ensure global help entry remains available.
2. `Trekulate`
- Add hover/focus reveal behavior for label-adjacent section info icons.
- Implement section and row disclosure alignment where needed, preserving row utility actions.
3. `KataCart`
- Verify gallery overlay + selected persistence already match contract; adjust only token/styling drift.
- Add app-shell global help entry if missing.
4. `Bonsai`
- Treat current gallery behavior as canonical baseline for `ds-gallery-card`.
- Defer per-section info icons unless complexity requires them.

## Cohesive Inspection (2026-03-07)

### Scope
- `_bonsai/index.html`
- `_Raden/index.html`
- `_KataCart/index.html`
- `_TREKULATE/index.html`

### Universal Issues Found
1. Control-row alignment contracts are reimplemented per app with different local tokens and spacing math.
2. Section header interaction patterns are still split between app-specific hit-target and icon behavior.
3. Tab/selected-state contrast can fail on some themes because active fg/bg/icon semantics are not fully standardized.
4. App-shell framing (panel/canvas separation, shell spacing, shadow/border treatment) is still mostly app-local.
5. Toast placement/stacking rules vary across apps and break consistency on mobile.

### Design System-Level Resolution
1. Standardize dense property rows via a single `ds-field-row` contract.
2. Standardize collapsible section affordances with a shared `ds-section-header` contract.
3. Add explicit tab active contrast tokens and migrate tab implementations to them.
4. Add shared shell-frame tokens so app shell geometry is theme-driven, not app-driven.
5. Add toast placement tokens and a single mobile/desktop positioning rule.

### Immediate Hygiene Applied
- Bonsai removed legacy token references and now uses canonical tokens:
  - `--ds-btn-text` instead of `--ds-btn-fg`
  - `--ds-btn-primary-text` instead of `--ds-btn-primary-fg`
  - `--ds-radius-2` instead of `--ds-radius-sm`

### Phased Rollout Proposal
1. Foundation phase
- Ship DS tokens/contracts for `ds-field-row`, `ds-section-header`, tab-active contrast, shell-frame, toast placement.
2. App migration phase
- Migrate Bonsai + Raden first (highest panel/control density), then KataCart + Trekulate.
3. Validation phase
- Validate all major themes on each app with focus on: control-row alignment, active tab readability, icon-action contrast, and mobile toast placement.
