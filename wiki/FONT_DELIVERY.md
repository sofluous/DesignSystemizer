# Font delivery

Studio and exported packages load the same local font files. Load `fonts.css` before `theme.css` and retain its adjacent `fonts/` directory. No Google Fonts service request is required. Font files load on demand when a matching family and weight is used; `font-display: swap` permits fallback while loading.

| Preferred body family | Delivery |
|---|---|
| Inter, Space Mono, Baloo 2, Sora, Outfit, Archivo Black, Share Tech Mono, Chakra Petch | Bundled, SIL OFL 1.1 |
| Segoe UI, Tahoma, Helvetica Neue, Arial Narrow | Device font; not bundled |

Device font means the browser uses the first installed/loaded face in the declared stack. It does not mean that the preferred face is installed. Code stacks also use this fallback rule; Space Mono is bundled wherever referenced. Custom font overrides retain their exact stack but do not automatically supply new assets. Consumers must provide appropriately licensed custom faces or accept the declared fallbacks.

## Source and maintenance

`fonts/manifest.json` records the official Google Fonts repository revision, source URL, SHA-256, weights and license for each unmodified TrueType file. Eleven normal faces cover eight families: Space Mono has separate 400/700 files, Chakra Petch has 400/600/700, Archivo Black and Share Tech Mono each supply 400, and Inter, Baloo 2, Sora and Outfit supply variable weights. Bold may be synthesized for the single-weight faces. Italic requests may be synthesized; no separate italic artwork is supplied. Original glyph coverage is retained. The files total 2,349,384 bytes; they are intentionally unmodified and require no conversion dependency.

Each family's original `OFL.txt` accompanies the font in Studio and exported packages. Retain the manifest and notices when redistributing. See the [official OFL](https://openfontlicense.org/open-font-license-official-text/) and [Google Fonts source](https://github.com/google/fonts). Proprietary/device fonts are not copied into this project.

`node scripts/build-package.cjs` verifies all font and license hashes, emits `css/fonts.css`, embeds export assets and writes the consumer package. Builds run offline against checked-in assets. Update assets, manifest hashes and source revision deliberately together; do not replace a font file silently.

## Verification

Run `node scripts/test-fonts.cjs` for catalog delivery coverage, integrity and exact ZIP/built-package binary equality. Run `node scripts/test-browser.cjs --fonts` for actual FontFace loading in Studio, its isolated preview and a fresh exported example with external font services blocked. A CSS family string alone is not evidence of loading. Network/load failures use the unchanged fallback stack; cross-device identity is guaranteed only for supplied faces with matching glyph coverage and successful loading. System-only themes still need a future visual decision if identical appearance across platforms is required.

## Theme identity and compatibility

The default set uses all twelve Type choices. Candy selects Baloo 2, Nocturne Sora and Nacre Outfit. EVA wireframe uses Share Tech Mono, Saturn uses Chakra Petch and Type Four Sprint uses Archivo Black. These are deliberate aesthetic alternatives to OCR A Std, Eurostile and Arial Black, not metric-identical replacements. Preset IDs remain stable. Existing saved snapshots retain previous stacks and sizes as compatibility overrides; old device fonts remain device-dependent. Snapshotless recipes adopt the current preset values. Explicit font edits continue to take precedence, and Reset adopts current defaults.

## Builder rendering and diagnostics

The live preview is a separate document: its body, headings, labels and controls inherit the active body stack; the code specimen uses `--ds-font-mono`. Component gallery specimens inherit the same active stacks. Studio navigation, editor controls and the preview's outer frame/caption deliberately retain the fixed editor theme.

The preview caption lists configured preferred body/code faces, bundled versus device/custom delivery, and whether explicit font edits are applied. It describes configuration, not installed-font detection. A bundled face or font stylesheet loading error is identified as a load issue. Temporary fallback during `font-display: swap` remains expected while a face loads. Device/custom stacks use the browser's first available matching face; custom assets are not supplied automatically. Saved compatibility overrides may intentionally keep an old face even after defaults change.

Run `node scripts/test-browser.cjs --builder-fonts` to select all 21 defaults through the actual theme selector and inspect rendered glyph fonts using Edge's platform-font diagnostics. It checks seven preview specimens (including code), a gallery button, manual body/code edits, Undo, editor isolation and a blocked local font request with visible failure disclosure. Reports go to outer `_docs/data/builder-fonts-2026-11-10/` unless `DS_EVIDENCE_DIR` is set. Unlike a CSS string or a successful unused FontFace load, these diagnostics identify the fonts drawing the specimen text.

On the 2026-11-10 Windows Edge test environment, all bundled preferred faces render as custom fonts after loading settles. Signal Poster/Diagram's Helvetica Neue stack renders Arial, and EVA Unit's Arial Narrow resolves to Arial. These are device-dependent results, not portable guarantees. Outfit's internal platform family name can appear as Outfit Thin; its supplied variable face is used at the requested CSS weight. Other machines may resolve device stacks differently.
