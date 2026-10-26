# Semantic icon approval and delivery

The shared standard is `icons/approved.json` plus its immutable SVG files under `icons/approved/`. Browser selections are automatically retained drafts only. Legacy browser preferences are migrated into these drafts. They never change the shared collection or exported icon assets.

## Selection states and actions

- **Recommended:** a registry suggestion, not yet saved to the shared sheet.
- **Draft:** a user selection differing from the saved standard (or recommendation when unsaved).
- **Saved:** the current source is the project-approved local asset.
- **Missing:** no source is assigned. Use Save to sheet to supply custom artwork.

Browse icons previews alternatives; **Use icon** adopts one as a draft. For custom replacements, open **Custom SVG ? Use SVG file** in Browse; this works even when the current icon is already Saved. Save to sheet opens approval preparation. **More** contains Download SVG and Revert changes; reverting restores the saved standard or original recommendation. Browser draft changes are automatically persisted. Source URLs, revisions, license notices, requesting apps and saved-source references are under Source and license. Preview unavailable is an image load error, not a different selection state.

## Review and approve

1. Find the semantic situation in Studio's Icons tab. Search aliases, app usage, categories or tags. Filter State to find Recommended, Draft, Saved or Missing entries. The card and inspector show the same current selection, source and state.
2. Choose a candidate. Lucide is the primary outline family. Other sources remain useful when semantic coverage requires them; explain exceptions. Compare stroke treatment, optical weight, corner style, metaphor and compact-size legibility. Do not mechanically overwrite stroke widths across unrelated art.
3. Select **Save to sheet**. Enter the exact source release/full commit, full license and copyright notice, modifications, and exception reason where relevant. Library URLs are pinned to the entered revision before fetching. No entire external library is downloaded.
4. For original artwork, upload an SVG in the approval form. For uploaded third-party artwork, edit its source library/name/URL and retain its real license. SVGs are sanitized; unsupported constructs may be removed. Supply a meaningful custom revision. Review the resulting preview, including at your target interface sizes, and confirm the review checkbox.
5. Select **Load preview** to see the exact pinned SVG. Confirm the review checkbox, then select **Export approval**. Uploaded custom artwork is already loaded for this review. Export does not change the record to Saved; the project import must succeed first. Download the approval JSON. This is a proposal, not a completed project write. From `_DesignSystem`, run:

```powershell
node scripts/import-icon.cjs "path/to/action.search.icon-approval.json"
node scripts/build-package.cjs
```

6. Reload Studio to see the approved standard and updated collection version. Review/commit the manifest, intended SVGs, generated assets and package with normal project changes. Nothing is published automatically.

The import command requires Node.js and no npm dependencies. It rejects unknown aliases, missing provenance/licenses, moving source references, unsupported SVG elements/attributes, unsafe markup and invalid existing checksums. The browser sanitizes and the importer independently validates a small inert SVG subset. Complex filters, embedded images, styles and use references are unsupported; simplify those assets first. The importer does not certify licensing or artistic suitability: those remain reviewer responsibilities.

## Add a missing situation

Before introducing an app-specific icon, search for an existing meaning. If none fits, add one entry to `js/icon-registry.js`: unique stable id/alias, clear name/category, usage notes, tags, requesting apps, and candidate references (or an empty candidate list for custom artwork). Rebuild with `node scripts/build-package.cjs`. The situation appears as **Recommended** if a candidate exists, otherwise **Missing** and is recorded in the distributable manifest. The importer requires a registered alias. Repeated requests belong on that situation's apps/notes, not new near-duplicate aliases.

## Use in apps

Copy the generated `_package/design-system` folder, including notices. Load:

```html
<script src="./design-system/js/icon-approved.js"></script>
<script src="./design-system/js/icon-runtime.js"></script>
<button aria-label="Search"><span data-ds-icon="action.search"></span></button>
```

The helper embeds approved SVGs without network requests. SVG strokes/fills authored as `currentColor` inherit the control color. Icons are decorative and hidden from assistive technology; name the enclosing control. Use noninteractive span containers for `data-ds-icon`. For dynamic content, call `DesignSystemIcons.render(container)`. Missing aliases render empty with `data-ds-icon-state="missing"`; they never receive a different semantic glyph. Frameworks can read `icons/manifest.json` and use its individual SVG paths instead.

Browser theme ZIP exports include the same approved icon snapshot. Browser candidate selections do not alter these exports. The manifest lists all registered situations with approved/needs-icon status, usage guidance and apps, and stores source provenance, modifications, checksums and license notices for approved assets. Only approved SVGs are in the runtime collection.

## Updates and recovery

Approve replacements under the same alias; successful changed imports increment the collection patch version. Identical imports are no-ops. Apps adopt updated artwork by taking a new package version; deployed apps are not silently modified. This first implementation supports approved/needs-icon states; deprecated aliases and automatic upstream-update detection are future work.

An immutable asset is written before one atomic manifest replacement. Failed validation leaves the collection untouched. A failed commit can leave an unreferenced SVG; it is excluded from generated packages. `icons/approved.lock` prevents overlapping imports. After an interrupted import, verify no importer is running, inspect the manifest, and remove only the stale lock/temp file before retrying. Do not delete approved artwork as a recovery shortcut. Old source revisions are retained for review/history. Generated package reconciliation removes obsolete generated approved SVG files, not source assets.

Initial collection 0.1.0 adopts the four existing project-owned DS assets with their existing ownership declaration; it does not grant a new open-source license. The other 60 situations require deliberate visual/source/license review. External candidate previews still require network access; approved app runtime assets do not. Approval metadata is supplied by the reviewer; no legal verification or automatic vendor-update audit is claimed.

## Validation

```powershell
node scripts/test-icon-library.cjs
node scripts/build-icons.cjs --check
node scripts/test-browser.cjs --icons
node scripts/test-browser.cjs
powershell -ExecutionPolicy Bypass -File scripts/qa-smoke.ps1
```

Tests use intercepted vendor fixtures, not live artwork. Inspect real licensed assets visually before approving them. This is project build/runtime tooling and stays with the Design System; no external workspace utility is required.
