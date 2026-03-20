# [TASK: DesignSystem/Icon Library | Define Semantic Selection Workflow | v0.1]

## Goal
Build a semantic icon library that can start from open-source sources today and gradually be replaced with in-house icons over time.

## Core Model
Each icon requirement is tracked as a semantic alias, not as a raw vendor icon.

Example:

- `action.search`
- `action.close`
- `feedback.warning`
- `map.location-pin`

The semantic alias is the stable DS contract. The selected source icon is replaceable.

## Source Layers
The system is intentionally layered:

1. `Semantic alias`
   - The DS meaning and intended usage.
2. `Candidate list`
   - First-pass suitable options from approved open-source libraries.
3. `Default guess`
   - The current best recommended choice.
4. `Override selection`
   - A manually chosen alternative when the default guess is not good enough.
5. `Local DS icon`
   - The final in-house or exported SVG stored in `icons/`.

## Studio Workflow
Use the Studio `Icons` tab as the working board.

For each icon situation:

1. Confirm the semantic alias and usage intent.
2. Review the first-pass candidate list.
3. Keep the default guess if it is good enough.
4. Override it if a better source icon is found.
5. Export the alias manifest so apps can consume a stable mapping.
6. Replace the chosen source with a local DS SVG later when the icon is redrawn in-house.

## Approved Source Catalog
The source catalog lives in `js/icon-registry.js`.

Current starter sources:

- `local`
- `lucide`
- `iconoir`
- `tabler`
- `phosphor`

This list is not permanent. It should only contain libraries acceptable for interim DS use.

## Selection Rules
1. Choose icons by semantic fit first, visual polish second.
2. Prefer outline-first icons unless a filled state is semantically necessary.
3. Do not mix unrelated visual grammars on the same app surface if avoidable.
4. Default guesses should be conservative and broadly reusable.
5. Manual overrides should be used when the semantic fit is clearly better than the current guess.

## Registry Shape
Each icon entry should track:

- `id`
- `alias`
- `name`
- `category`
- `status`
- `apps`
- `tags`
- `notes`
- `defaultCandidateId`
- `candidates[]`

Each candidate should track:

- `id`
- `sourceId`
- `iconName`
- `label`
- `localFile` when applicable
- `glyph` when a local preview is available
- `notes`

## Export
Use `Export Alias Manifest` from the Studio `Icons` tab.

The exported manifest is the handoff artifact for apps and future automation. It answers:

- Which semantic aliases exist
- Which candidate is currently selected
- Which source library it came from
- Which aliases still need local DS SVG replacements

## Long-Term Direction
The end state is:

1. Semantic alias remains stable
2. Default selection becomes a local DS SVG
3. Open-source candidate history remains in the registry for auditing/reference
4. Apps consume only the DS semantic alias contract, not vendor icon names directly
