# Design System icon sources

`approved.json` is the versioned shared standard. Its entries reference immutable checksummed SVGs in `approved/` and retain original source/license/revision metadata. Change it through `node scripts/import-icon.cjs <approval-file>`, then rebuild with `node scripts/build-package.cjs`.

The four root SVG files are retained legacy paths and the initial project-owned assets. Browser candidate choices are not approval records. Sourced open-source artwork may remain a permanent standard; custom redraws are optional.

Prefer a 24x24 outline family and currentColor, reviewing optical weight, corner style and compact-size readability. Do not force identical stroke widths onto unrelated artwork. Record justified secondary-source exceptions and preserve their license notices.

See [the full workflow](../wiki/ICON_LIBRARY_WORKFLOW.md) for preparation, import, app integration, validation and recovery. Generated package icons and the runtime registry contain only approved artwork.
