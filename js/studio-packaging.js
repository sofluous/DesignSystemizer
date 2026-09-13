(function (win, doc) {
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
      const dataBytes = encoder.encode(file.content);
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
    const name = options.themeName;
    if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error("Invalid theme name");
    const folder = options.packageFolder || "design-system";
    if (!/^[a-z0-9_-]+$/i.test(folder)) throw new Error("Invalid package folder");
    const registry = { ...assets.registry, defaultTheme: name,
      themes: assets.registry.themes.filter((theme) => theme.id !== name).concat({ id: name, label: name, group: "Custom" }) };
    const install = [
      "# Theme package", "",
      "Copy the design-system folder into your app. Load theme.css, then theme-registry.js and theme-selector.js.",
      "Use DS component classes or map your app properties to the --ds-* tokens. See example.html for a working theme switcher.",
      "The package includes all default themes and the exported custom theme. It does not need the Studio or its composer at runtime.",
      "Theme tokens and CSS are snapshots; theme.recipe.json records the applied seven layers and exact manual overrides.",
      "fonts.css optionally loads Inter and Space Mono from Google Fonts. Without network access, the declared system font fallbacks apply.",
      "Other locally installed font families still depend on the target device. No font binaries are bundled.",
      "Regenerate the package after changing source presets or components. Keep app styles token-based for theme switching.",
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
<button class="ds-btn" aria-pressed="true">Selected action</button>
<div role="tablist" aria-label="Example"><button class="ds-tab" role="tab" aria-selected="true" id="sample-tab" aria-controls="sample-panel">Selected tab</button></div>
<div role="tabpanel" id="sample-panel" aria-labelledby="sample-tab">Theme content</div>
<label>Text <input class="ds-input" placeholder="Example field"></label></main>
<script src="./${folder}/js/theme-registry.js"></script>
<script src="./${folder}/js/theme-selector.js"></script></body></html>`;
    return [
      { name: "INSTALL.md", content: install },
      { name: "example.html", content: example },
      { name: name + ".css", content: options.themeBlock + "\n" },
      { name: "theme.recipe.json", content: JSON.stringify(options.recipe, null, 2) },
      { name: folder + "/theme.css", content: assets.css + "\n" + options.themeBlock + "\n" },
      { name: folder + "/fonts.css", content: assets.fonts },
      { name: folder + "/js/theme-registry.js", content: "window.DesignSystemThemeRegistry = " + JSON.stringify(registry, null, 2) + ";\n" },
      { name: folder + "/js/theme-selector.js", content: assets.selector },
    ];
  }

  win.DesignSystemStudioPackaging = {
    buildThemePackageFiles,
    downloadBlob,
    makeZip,
  };
})(window, document);
