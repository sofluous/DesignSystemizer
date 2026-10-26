# Shared icon workspace

The shared standard lives in `icons/approved.json` and checksummed local SVGs. Browser assignments are retained drafts until explicitly saved to the project. Apps use stable semantic aliases, not vendor names.

## Open with direct project saving

From `_DesignSystem`:

```powershell
node scripts/serve-studio.cjs
```

Open `http://127.0.0.1:4177/index.html`. Properties shows **Project connected**. The server binds only 127.0.0.1 and reuses the validated importer and package builder. Node.js is the only dependency. `DS_STUDIO_PORT` changes the port; stop the server with Ctrl+C. Do not expose it as a public hosting service. Nothing is published or committed to version control automatically.

Static hosting still works. Properties shows **Export mode** and uses **Export changes**, which downloads an approval proposal for later import. It never marks an exported draft Saved.

## Workspace

- **Left / Icon library:** shared search, state/category/source filters, grouped token list. Selecting a token locates its highlighted card.
- **Center / Canvas:** filtered icon-sheet cards. Select a card to edit the same record in Properties.
- **Right / Properties:** selected token, assigned artwork/source, state, Replace icon, Save changes (or Export changes), source/license details and secondary actions.
- **Mobile:** Library, Canvas and Properties views preserve the same selection rather than squeezing three columns together.

States: **Recommended** is an unreviewed registry suggestion; **Draft** is a changed assignment; **Saved** is the current project-approved local artwork; **Missing** has no source. Preview unavailable is a loading failure, not an assignment state.

## Replace artwork

1. Select the semantic token in the library or canvas.
2. Select **Replace icon**. The center becomes **Choose artwork for [token]**, with its own source/search controls. Properties retains the target token and previews candidates.
3. Choose a candidate, then **Assign** in Properties. This changes the workspace assignment and automatically retains its draft. **Back to icon library** cancels an unassigned preview. Selecting a different token abandons only that unassigned preview, not existing assignments.
4. The candidate catalog combines the sources already registered across DS situations; it is not a download/browser of every upstream vendor icon. To try another known upstream icon, use Custom SVG's approved-library reference or SVG URL. Assignments outside the target's starter candidate list retain a validated library reference.
5. **Custom SVG / Use SVG file** enters review in Properties, including for an already Saved token. Upload original artwork or retain third-party source/name/URL/license information. Uploaded artwork is not published merely by choosing a file.

Lucide is the primary outline family. Review secondary-source exceptions, optical weight, stroke treatment, corner style, metaphor and actual-size legibility. Do not mechanically rewrite every source's stroke width.

## Review and save

1. In Properties select **Save changes** (connected mode) or **Export changes** (static mode). The inline review stage collects the exact source release/full commit, license identifier and complete copyright/license notice, modifications and secondary-source rationale.
2. **Load preview** fetches the exact revision-pinned asset. Review that artwork and confirm the review checkbox. Uploaded custom SVGs are already loaded for review. Complex styles, filters, images and use references are unsupported by the safe SVG subset; simplify those assets first.
3. **Save changes** commits a validated local SVG and mapping, increments the collection version for changed imports, rebuilds packages and refreshes the browser's saved artwork and export assets. Only the successfully saved token draft is cleared. An identical retry does not bump the version.
4. In static mode **Export changes** downloads a proposal. Complete the write from the project directory:

```powershell
node scripts/import-icon.cjs "path/to/action.search.icon-approval.json"
node scripts/build-package.cjs
```

Reload static Studio after import. Inspect/commit the intended project files through normal version control.

Browser assignments survive reloads on the same origin/port. Review fields and custom SVGs survive switching tokens within the current session, but are not persisted across reloads; export their proposal first to preserve that work. If saving is in progress, token changes are blocked. The project server rejects a stale conflicting collection version; reload after preserving needed review work. Source-revision metadata and licenses remain reviewer declarations, not legal certification.

## Recovery

Validation failures leave the approved collection unchanged. If a package rebuild fails after source commit, Studio reports **Source saved; package rebuild failed**; rerun `node scripts/build-package.cjs`. The saved source remains authoritative. The importer writes an immutable asset before an atomic manifest replacement; a failed commit can leave an unreferenced file, which is excluded from generated packages. After an interrupted import, verify no importer is active before removing a stale `icons/approved.lock` or `.tmp` file. Never delete source artwork as a recovery shortcut.

More / Revert changes clears the current assignment draft and restores the saved standard or original recommendation. It does not undo a successful project save; approve a replacement or use project version history for that.

## Add a missing situation

Search for an existing meaning before adding an app-specific alias. Add a unique id/alias, name/category, usage notes, tags, requesting apps and candidates to `js/icon-registry.js`; candidates may be empty for custom artwork. Rebuild the package. A candidate makes the new situation Recommended; otherwise it is Missing. Repeated requests belong in that record's apps/notes rather than near-duplicate aliases.

## Use approved icons in apps

Copy `_package/design-system`, including license notices:

```html
<script src="./design-system/js/icon-approved.js"></script>
<script src="./design-system/js/icon-runtime.js"></script>
<button aria-label="Search"><span data-ds-icon="action.search"></span></button>
```

The helper embeds approved SVGs without vendor requests. CurrentColor artwork inherits the control color. Icons are decorative; name the enclosing control. Use noninteractive containers and call `DesignSystemIcons.render(container)` after dynamic additions. Missing aliases render empty with `data-ds-icon-state="missing"`. Frameworks may use `icons/manifest.json` and its individual SVG paths. Browser theme exports contain the same approved snapshot, refreshed after a connected save. Drafts do not ship.

Initial collection coverage remains four adopted project-owned icons; remaining situations need deliberate source/visual/license curation. Deprecated aliases and automatic upstream-update detection are not implemented. No new public license is granted to the initial project-owned artwork.

## Validation

```powershell
node scripts/test-icon-library.cjs
node scripts/test-studio-server.cjs
node scripts/build-icons.cjs --check
node scripts/test-browser.cjs --icons
node scripts/test-browser.cjs --icons-connected
node scripts/test-browser.cjs
powershell -ExecutionPolicy Bypass -File scripts/qa-smoke.ps1
```

Connected-save tests use a temporary project copy; vendor SVGs and license text are fixtures. They do not approve test artwork in the working project. These are project-essential build/runtime tools, with no external workspace utility dependency.
