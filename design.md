# Design System Source Of Truth

Status: Draft
Updated: 2026-10-03

## Purpose

This document is the first-stop reference for UI and UX decisions across apps in this workspace. Use it before creating new components, changing app shell layout, choosing icons, adjusting spacing, or fixing visual inconsistencies.

Detailed rules continue to live in the Design System wiki. This file summarizes the decision layer and links to the deeper references.

## Reference Order

1. Start here for cross-app direction.
2. Use `_DesignSystem/wiki/FOUNDATIONS.md` for tokens, spacing, theme composition, contrast, and accessibility baselines.
3. Use `_DesignSystem/wiki/PATTERNS.md` for layout, shell, interaction, spacing ownership, and repeated UX patterns.
4. Use `_DesignSystem/wiki/COMPONENT_SPEC.md` for component anatomy, states, accessibility, and token mapping.
5. Use `_DesignSystem/wiki/CROSS_APP_UI_RULES.md` when apps disagree or a pattern needs cross-project alignment.
6. Use `_DesignSystem/wiki/ICONOGRAPHY.md` for icon semantics, naming, and icon-only control rules.
7. Use `_DesignSystem/wiki/VALIDATION_CHECKLIST.md` before finishing UI-affecting changes.

## Core Principles

- Prefer design-system tokens over app-local hardcoded values.
- Use semantic tokens before foundation tokens when styling app UI.
- Let parent layouts own gaps and placement; components own internal padding.
- Keep app shells, toolbars, inspectors, cards, and dense rows aligned to shared patterns.
- Make utility actions compact, accessible, and visually lower emphasis than primary actions.
- Validate UI against multiple themes, not only the theme currently being edited.
- Treat repeated app-local fixes as design-system candidates.

## Layout And Spacing

- Shells own viewport gutters and major region spacing.
- Panels and cards own edge padding.
- Stack, grid, list, and toolbar containers own gaps between children.
- Children should not add arbitrary outer margins when the parent already defines rhythm.
- Section breaks must be visibly larger than normal content spacing.
- Heading-to-body spacing should be tighter than body-to-next-heading spacing.
- Grids own card spacing; cards should not add external margins to create layout.

Primary reference: `_DesignSystem/wiki/FOUNDATIONS.md` and `_DesignSystem/wiki/PATTERNS.md`.

## Shells And App Chrome

- Use persistent sidebars or rails when navigation is stable and cross-view.
- Use top toolbars for commands that must stay visible.
- Use inspectors or drawers for contextual controls that should not replace the main workspace.
- Do not mix navigation, commit actions, and contextual utilities into one undifferentiated toolbar.
- Shell actions should use the same button and icon-action rules as the rest of the app.
- App shell framing, panel separation, toast placement, and tab selected states should use shared DS tokens when available.
- Settings belongs in the shell pattern that matches its job: rail/tab for major app mode, drawer/button for occasional global preferences, inspector section for project-specific metadata.

Primary reference: `_DesignSystem/wiki/PATTERNS.md` and `_DesignSystem/wiki/CROSS_APP_UI_RULES.md`.

## Components

- Use the component contracts in `_DesignSystem/wiki/COMPONENT_SPEC.md` before creating app-local variants.
- One primary action should exist per action region.
- Primary actions align right in footers and command clusters.
- Destructive actions sit immediately left of primary when paired.
- Neutral cancel or back actions stay left.
- Icon-only controls require an accessible label and should include a title or tooltip when the meaning is not obvious.
- Focus, disabled, loading, selected, and error states must be explicit where the component supports them.

## Dense Control Rows

- Dense property rows should follow `label + control + optional readout/action` alignment.
- Reserve action-slot width where row utilities appear so controls do not shift.
- Keep compact numeric inputs bounded when values are short.
- Row-level utility actions such as lock, visibility, info, and collapse should remain aligned and keyboard accessible.
- Randomization locks exclude properties from randomization but do not disable manual editing.

Primary reference: `_DesignSystem/wiki/PATTERNS.md` and `_DesignSystem/wiki/COMPONENT_SPEC.md`.

## Icons

- Use one icon family and one stroke logic per app surface.
- Prefer outline utility icons unless a filled symbol has explicit semantic value.
- Use square or softly rounded-square icon actions by default.
- Circular utility buttons are exception-only.
- Low-emphasis utility actions include show/hide, lock/unlock, info/help, settings/tune, more/overflow, and collapse/expand.
- Icons in inputs and controls must inherit tokenized colors.

Primary reference: `_DesignSystem/wiki/ICONOGRAPHY.md`.

## Themes And Tokens

- App UI should consume DS semantic tokens directly where practical.
- If app aliases are needed, document them and map them one way from DS semantics.
- Do not redefine DS semantic meaning inside app aliases.
- App aliases must declare whether they are DS-mapped, product identity, content/model data, or temporary migration shims.
- Style presets should own geometry, borders, shadows, and interaction language.
- Typography, density, palette, and texture belong to their own preset layers.
- Bright primary buttons must preserve text and mark contrast across checked, hover, selected, and active states.
- UI chrome, HUD overlays, and controls should use DS semantic tokens; model/material colors and generated output palettes may use product-specific values when documented.

Primary reference: `_DesignSystem/wiki/FOUNDATIONS.md`.

## App Alias Contract

Use app-local aliases only when they make the app easier to maintain or bridge older code to DS tokens. Keep the mapping one way:

- shell gap -> `--ds-shell-gap`
- panel padding -> `--ds-panel-scroll-pad-*` or `--ds-card-pad`
- field row gap -> `--ds-field-row-gap`
- compact toolbar gap -> `--ds-toolbar-compact-gap`
- icon action size -> `--ds-icon-action-size`
- app surfaces, text, borders, and accents -> DS semantic tokens

Each app alias should be classified as:

- DS-mapped: allowed and preferred for app-specific naming.
- Product identity: allowed when it expresses the app's domain.
- Content/model data: allowed for generated output, materials, palettes, or simulation defaults.
- Migration shim: temporary; should be removed or mapped during polish work.

Avoid alias chains that redefine DS meaning, such as mapping a local accent to a hardcoded color when `--ds-accent` is available.

## Canvas And Stage Colors

Canvas, stage, viewport, and generated-output apps should separate color ownership:

- UI chrome: panels, buttons, labels, borders, HUD cards, menus, drawers, and overlays use DS semantic tokens.
- HUD overlays: use DS tokens by default; app-specific overlays should map through documented aliases.
- Render-content palettes: may be app-specific when they represent output, preview data, simulation state, map layers, or material defaults.
- Model/material defaults: may be hardcoded or data-driven, but should not leak into generic UI chrome.
- Fallbacks: prefer DS semantic fallbacks before raw hex/RGBA values for UI-adjacent code.

If a hardcoded value is kept, document whether it is content/model data or product identity.

## Feedback And Overlays

- Toasts are transient completion or status feedback.
- Inline alerts are persistent contextual issues.
- Dialogs are for blocking, high-risk, or required decisions.
- Drawers are for contextual inspectors or settings.
- Popovers are for lightweight anchored guidance.
- Menus, popovers, modals, and drawers must have consistent close behavior and keyboard support.

Primary reference: `_DesignSystem/wiki/PATTERNS.md`.

## Audit Rules

When an app differs from this design system, classify the finding as one of:

- App deviation: the app should be updated to match the design system.
- Design-system gap: the design system lacks a rule or component that the app reasonably needs.
- Ambiguous decision: the intent is unclear and needs a decision before implementation.
- Intentional exception: the difference is justified by the app's domain, audience, or workflow.

Repeated deviations across apps are usually design-system problems, not one-off app problems.

## Validation Checklist

Before finishing UI-affecting work:

- Confirm no avoidable hardcoded colors, spacing, borders, or shadows exist where DS tokens cover the need.
- Confirm action hierarchy is clear and there is only one primary action per region.
- Confirm icon-only controls have accessible labels.
- Confirm keyboard navigation and focus indicators work.
- Confirm readable contrast across at least one light, one dark, and one high-style theme when practical.
- Confirm compact and comfortable scale do not break layout.
- Confirm app changes are checked against `_DesignSystem/wiki/VALIDATION_CHECKLIST.md`.

## Open Design-System Work

- Normalize accordion and disclosure contracts.
- Expand responsive rules for dense label/input/action rows.
- Standardize table toolbar, filter, and result-summary spacing.
- Standardize chart panel and legend spacing.
- Standardize timeline/history/event-feed spacing.
- Continue migrating repeated app-local patterns into DS contracts.
