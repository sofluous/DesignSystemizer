(function (win, doc) {
  const fontAssetUrl = doc.currentScript && new URL('./theme-font-assets.js', doc.currentScript.src).href;
  let fontLoad;
  function ensureFontAssets() {
    if (win.DesignSystemThemeFontAssets || win.DesignSystemThemePackageAssets?.fontFiles) return Promise.resolve();
    if (fontLoad) return fontLoad;
    fontLoad = new Promise((resolve, reject) => {
      const script = doc.createElement('script');
      let timer;
      function finish(error) {
        win.clearTimeout(timer);
        script.remove();
        if (error) reject(error); else resolve();
      }
      script.onload = () => finish(win.DesignSystemThemeFontAssets ? null : new Error('Font export assets are incomplete. Rebuild the package and retry.'));
      script.onerror = () => finish(new Error('Could not load local font export assets. Check the connection and retry.'));
      timer = win.setTimeout(() => finish(new Error('Font export loading timed out. Retry the download.')), 30000);
      script.src = fontAssetUrl || new URL('./js/theme-font-assets.js', doc.baseURI).href;
      doc.head.appendChild(script);
    }).catch((error) => { fontLoad = null; throw error; });
    return fontLoad;
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = doc.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    doc.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    win.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  // SHA-256 fallback preserves ZIP export on ordinary HTTP origins where Web
  // Crypto is unavailable. This is a content inventory, not a signature.
  function sha256(bytes) {
    const constants = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    const initial = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
    padded.set(bytes); padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor(bytes.length / 0x20000000));
    view.setUint32(padded.length - 4, (bytes.length * 8) >>> 0);
    const rotate = (value, count) => (value >>> count) | (value << (32 - count));
    const words = new Uint32Array(64);
    for (let offset = 0; offset < padded.length; offset += 64) {
      for (let i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4);
      for (let i = 16; i < 64; i++) {
        const x = words[i - 15], y = words[i - 2];
        words[i] = words[i - 16] + (rotate(x, 7) ^ rotate(x, 18) ^ (x >>> 3)) + words[i - 7] + (rotate(y, 17) ^ rotate(y, 19) ^ (y >>> 10));
      }
      let [a, b, c, d, e, f, g, h] = initial;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25)) + ((e & f) ^ (~e & g)) + constants[i] + words[i]) >>> 0;
        const t2 = ((rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, h].forEach((value, i) => { initial[i] = (initial[i] + value) >>> 0; });
    }
    return initial.map(value => value.toString(16).padStart(8, '0')).join('');
  }

  async function withManifest(files, folder = 'design-system') {
    const encoder = new TextEncoder();
    const digest = async (bytes) => win.crypto?.subtle
      ? Array.from(new Uint8Array(await win.crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('')
      : sha256(bytes);
    const entries = [];
    for (const file of files.filter(file => file.name.startsWith(folder + '/')).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const bytes = file.encoding === 'base64' ? Uint8Array.from(win.atob(file.content), c => c.charCodeAt(0)) : encoder.encode(file.content);
      entries.push({ path: file.name.slice(folder.length + 1), bytes: bytes.length, sha256: await digest(bytes) });
    }
    const manifest = { schemaVersion: 1, presetRevision: win.DesignSystemThemePackageAssets.presetRevision,
      sourceRevision: await digest(encoder.encode(JSON.stringify(entries))), files: entries };
    return [...files, { name: folder + '/package.manifest.json', content: JSON.stringify(manifest, null, 2) + '\n' }];
  }

  function crc32(bytes) {
    let crc = 0 ^ -1;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 255];
    }
    return (crc ^ -1) >>> 0;
  }

  const crcTable = (function () {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let crc = index;
      for (let step = 0; step < 8; step += 1) {
        crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
      }
      table[index] = crc >>> 0;
    }
    return table;
  })();

  function makeZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const now = new Date();
    const dosTime =
      ((now.getHours() & 31) << 11) |
      ((now.getMinutes() & 63) << 5) |
      (Math.floor(now.getSeconds() / 2) & 31);
    const dosDate =
      (((now.getFullYear() - 1980) & 127) << 9) |
      (((now.getMonth() + 1) & 15) << 5) |
      (now.getDate() & 31);

    files.forEach(function (file) {
      const nameBytes = encoder.encode(file.name);
      const dataBytes = file.encoding === "base64"
        ? Uint8Array.from(win.atob(file.content), (value) => value.charCodeAt(0))
        : encoder.encode(file.content);
      const crc = crc32(dataBytes);
      const localHeader = new Uint8Array(30);
      const localView = new DataView(localHeader.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, dosTime, true);
      localView.setUint16(12, dosDate, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, dataBytes.length, true);
      localView.setUint32(22, dataBytes.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      localParts.push(localHeader, nameBytes, dataBytes);

      const centralHeader = new Uint8Array(46);
      const centralView = new DataView(centralHeader.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, dosTime, true);
      centralView.setUint16(14, dosDate, true);
      centralView.setUint32(16, crc, true);
      centralView.setUint32(20, dataBytes.length, true);
      centralView.setUint32(24, dataBytes.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      centralParts.push(centralHeader, nameBytes);

      offset += localHeader.length + nameBytes.length + dataBytes.length;
    });

    let centralSize = 0;
    centralParts.forEach(function (part) {
      centralSize += part.length;
    });

    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    endView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, end], {
      type: "application/zip",
    });
  }

  function buildThemePackageFiles(options) {
    const assets = win.DesignSystemThemePackageAssets;
    if (!assets) throw new Error("Package assets are unavailable. Rebuild the Design System package.");
    const fontFiles = win.DesignSystemThemeFontAssets || assets.fontFiles;
    if (!fontFiles) throw new Error('Load font export assets before building a complete package.');
    const name = options.themeName;
    if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error("Invalid theme name");
    const folder = options.packageFolder || "design-system";
    if (!/^[a-z0-9_-]+$/i.test(folder)) throw new Error("Invalid package folder");
    const registry = { ...assets.registry, defaultTheme: name,
      themes: assets.registry.themes.filter((theme) => theme.id !== name).concat({ id: name, label: name, group: "Custom" }) };
    const install = [
      "# Theme package", "",
      "Copy the complete design-system folder into your app. Load fonts.css before theme.css, then js/theme-registry.js and js/theme-selector.js in that order.",
      "Use DS component classes or map your app properties to the --ds-* tokens. The distribution's example.html is beside the design-system folder; it is not inside the runtime folder.",
      "Set data-ds-theme-storage on html to an app-specific key. Serve over HTTP(S); file URL persistence is browser-dependent. Storage denial does not prevent theme switching.",
      "theme.css styles global html/body, links, headings, box sizing and focus as well as DS classes. Review host styles and load app overrides afterward. It is a full-app stylesheet, not an isolated widget skin.",
      "Replace the entire app-owned runtime folder on upgrade instead of merging files. package.manifest.json identifies the exact file hashes and source revision; VERSION.txt records the preset revision for CLI builds.",
      "The package includes all default themes and the exported custom theme. It does not need the Studio or its composer at runtime.",
      "Theme tokens and CSS are snapshots; theme.recipe.json records the applied seven layers and exact manual overrides.",
      "Load fonts.css before theme.css. Bundled local families: " + [...new Set(assets.fontManifest.faces.map((face) => face.family))].join(", ") + ". No font network service is required.",
      "Other font families depend on the target device and use their declared fallback stacks. Keep the fonts directory, manifest and OFL notices when redistributing. Custom font overrides need their own licensed assets.",
      "Regenerate the package after changing source presets or components. Keep app styles token-based for theme switching.",
      "Approved icons: load design-system/js/icon-approved.js then design-system/js/icon-runtime.js. Use <span data-ds-icon=\"action.search\"></span> inside a labeled control. Call DesignSystemIcons.render(container) after adding content.",
      "Icon SVGs, semantic manifest, usage guidance and per-asset license notices live in design-system/icons. Only project-approved icons are included; browser candidate choices do not change the shared collection. Keep license notices when redistributing assets.",
    ].join("\n");
    const example = `<!doctype html>
<html lang="en" data-theme="${name}" data-ds-theme-default="${name}" data-ds-theme-storage="example-theme">
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Theme package example</title>
<link rel="stylesheet" href="./${folder}/fonts.css">
<link rel="stylesheet" href="./${folder}/theme.css">
<body class="ds-stack" style="padding:var(--ds-space-4)">
<label>Theme <select class="ds-select" data-ds-theme-select></select></label>
<main class="ds-card ds-stack"><h1>Portable theme preview</h1><p>Components follow the selected theme.</p>
<button class="ds-btn ds-btn-primary">Primary action</button>
<button class="ds-btn"><span data-ds-icon="action.search"></span> Search</button>
<button class="ds-btn" aria-pressed="true">Selected action</button>
<div role="tablist" aria-label="Example"><button class="ds-tab" role="tab" aria-selected="true" id="sample-tab" aria-controls="sample-panel">Selected tab</button></div>
<div role="tabpanel" id="sample-panel" aria-labelledby="sample-tab">Theme content</div>
<label>Text <input class="ds-input" placeholder="Example field"></label></main>
<script src="./${folder}/js/theme-registry.js"></script>
<script src="./${folder}/js/theme-selector.js"></script>
<script src="./${folder}/js/icon-approved.js"></script>
<script src="./${folder}/js/icon-runtime.js"></script></body></html>`;
    return [
      { name: "INSTALL.md", content: install },
      { name: "example.html", content: example },
      { name: name + ".css", content: options.themeBlock + "\n" },
      { name: "theme.recipe.json", content: JSON.stringify(options.recipe, null, 2) },
      { name: folder + "/theme.css", content: assets.css + "\n" + options.themeBlock + "\n" },
      { name: folder + "/fonts.css", content: assets.fonts },
      { name: folder + "/js/theme-registry.js", content: "window.DesignSystemThemeRegistry = " + JSON.stringify(registry, null, 2) + ";\n" },
      { name: folder + "/js/theme-selector.js", content: assets.selector },
      ...fontFiles.map((file) => ({ ...file, name: folder + "/" + file.name })),
      ...(win.DesignSystemIconPackageAssets?.files || []).map((file) => ({ name: folder + "/" + file.name, content: file.content })),
    ];
  }

  win.DesignSystemStudioPackaging = {
    buildThemePackageFiles,
    ensureFontAssets,
    withManifest,
    downloadBlob,
    makeZip,
  };
})(window, document);
