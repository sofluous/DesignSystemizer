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
    const themeName = options.themeName;
    const themeBlock = options.themeBlock;
    const recipe = options.recipe;
    const packageFolder = options.packageFolder || "design-system";

    return [
      {
        name: "README.md",
        content:
          "# " +
          themeName +
          " theme package\n\nThis package was exported from Design System Studio.\nUse INSTALL.md for setup steps.\n",
      },
      {
        name: "INSTALL.md",
        content:
          "1. Treat this as an exported theme artifact from Design System Studio.\n2. Copy `" +
          themeName +
          '.css` into your project styles folder.\n3. Append the block into your theme file (or import it).\n4. Add a matching entry to `' +
          packageFolder +
          '/js/theme-registry.js`.\n5. Ensure your app includes `<script src=\\"./' +
          packageFolder +
          '/js/theme-registry.js\\"><\\/script>` and `<script src=\\"./' +
          packageFolder +
          '/js/theme-selector.js\\"><\\/script>`.\n6. Set `<html data-theme=\\"' +
          themeName +
          '\\" data-ds-theme-storage=\\"app-theme\\" data-ds-theme-default=\\"' +
          themeName +
          '\\">` in your page.\n7. Add a selector where needed: `<select data-ds-theme-select></select>`.\n8. Ensure your app includes `' +
          packageFolder +
          '/theme.css` (or equivalent token+component files).\n9. For full app-wide DS updates, prefer rebuilding and copying `_DesignSystem/_package/' +
          packageFolder +
          '/` instead of manually editing the generated package.\n',
      },
      { name: themeName + ".css", content: themeBlock + "\n" },
      {
        name: "theme.recipe.json",
        content: JSON.stringify(recipe, null, 2),
      },
    ];
  }

  win.DesignSystemStudioPackaging = {
    buildThemePackageFiles,
    downloadBlob,
    makeZip,
  };
})(window, document);
