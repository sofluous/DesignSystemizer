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
