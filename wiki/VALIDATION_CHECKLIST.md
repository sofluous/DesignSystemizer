# [TASK: DesignSystem/Validation | Create Cross-Project UI/UX Checklist | v0.1]

## Use
Run this checklist before merge/release for any UI-affecting change.

## 1) Foundation Compliance
- [ ] No avoidable hardcoded design values when tokens exist.
- [ ] Typography and spacing follow system scales.
- [ ] Elevation and borders follow component/token rules.

## 2) Pattern Compliance
- [ ] Primary action hierarchy is clear and singular per context.
- [ ] Sidebar/modal/drawer usage follows pattern rules.
- [ ] Borderless/icon actions only used for low-emphasis actions.

## 3) Component Consistency
- [ ] Variants and states match `COMPONENT_SPEC.md`.
- [ ] Focus, disabled, loading states are present where required.
- [ ] Input icons and control adornments inherit tokenized colors.

## 4) Accessibility
- [ ] Keyboard navigation works in interactive flows.
- [ ] Focus indicators are visible.
- [ ] Color contrast acceptable for text and status cues.

## 5) Theme Compatibility
- [ ] Tested against at least 3 distinct themes (light/dark/high-style).
- [ ] No unreadable surfaces in texture-heavy themes.
- [ ] No broken layout at compact and comfortable scales.

## 6) Interaction Quality
- [ ] No FOUC/flicker on first render for themed UI.
- [ ] Popovers/menus position correctly and do not force horizontal overflow.
- [ ] Modal and drawer close flows are consistent.

## 7) Cross-App Standardization
- [ ] Action groups follow right-aligned primary + left-side destructive/cancel rule.
- [ ] App alias tokens (if used) are documented and mapped one-way from DS semantics.
- [ ] Style presets do not accidentally hardcode full palette tokens unless intentionally locked.
- [ ] Reviewed against `CROSS_APP_UI_RULES.md` for container, feedback, and field-row consistency.
- [ ] Gallery cards use overlay action buttons (no card height/layout jitter on reveal).
- [ ] Gallery cards support persistent action visibility on selected state (touch-friendly).
- [ ] Section info icons are borderless, label-adjacent, and hover/focus revealed.
- [ ] Global help entry point exists at app-shell level.
- [ ] Collapsible rows/sections preserve terminal/rightmost collapse affordance with row utility actions intact.
- [ ] Show/hide row controls are hover/focus revealed and remain visible when active.
- [ ] Visibility toggles are not altered by randomization actions.
- [ ] Randomization lock icons are present for all randomizable properties.
- [ ] Locked properties are skipped by randomization and lock state persists across reload.
