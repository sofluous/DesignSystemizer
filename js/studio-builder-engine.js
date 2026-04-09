(function (win, doc) {
  function initBuilderEngine(opts) {
    const root = opts.root;
    const themeSelect = opts.themeSelect;
    const familyPresetSelect = opts.familyPresetSelect;
    const huePresetSelect = opts.huePresetSelect;
    const schemePresetSelect = opts.schemePresetSelect;
    const stylePresetSelect = opts.stylePresetSelect;
    const typographyPresetSelect = opts.typographyPresetSelect;
    const scalePresetSelect = opts.scalePresetSelect;
    const texturePresetSelect = opts.texturePresetSelect;
    const autoApplyPresetToggle = opts.autoApplyPresetToggle;
    const autoApplyPresetKey = opts.autoApplyPresetKey;
    const resetConfirmKey = opts.resetConfirmKey;
    const baseThemePresetMap = opts.baseThemePresetMap;
    const buildColorBundle = opts.buildColorBundle;
    const inferTypographyPreset = opts.inferTypographyPreset;
    const inferTexturePreset = opts.inferTexturePreset;
    const schemePresets = opts.schemePresets;
    const stylePresets = opts.stylePresets;
    const scalePresets = opts.scalePresets;
    const typographyPresets = opts.typographyPresets;
    const texturePresets = opts.texturePresets;
    const clearOverrides = opts.clearOverrides;
    const syncControlsFromComputed = opts.syncControlsFromComputed;
    const sanitizeThemeName = opts.sanitizeThemeName;
    const buildThemeBlock = opts.buildThemeBlock;
    const studioPackagingApi = opts.studioPackagingApi || null;
    const onThemeChanged = opts.onThemeChanged;

    const applyPresetBtn = doc.getElementById("applyPresetBtn");
    const presetRecipeOutput = doc.getElementById("presetRecipeOutput");
    const presetRecipeHint = doc.getElementById("presetRecipeHint");
    const presetRecipeMeta = doc.getElementById("presetRecipeMeta");
    const themeNameInput = doc.getElementById("themeNameInput");
    const themeExportOutput = doc.getElementById("themeExportOutput");
    const resetDialog = doc.getElementById("resetConfirmDialog");
    const skipResetConfirmChk = doc.getElementById("skipResetConfirmChk");
    const resetOverridesBtn = doc.getElementById("resetOverridesBtn");
    const cancelResetBtn = doc.getElementById("cancelResetBtn");
    const confirmResetBtn = doc.getElementById("confirmResetBtn");
    const exportThemeBtn = doc.getElementById("exportThemeBtn");
    const copyExportBtn = doc.getElementById("copyExportBtn");
    const downloadPackageBtn = doc.getElementById("downloadPackageBtn");

    let lastAppliedPresetSignature = "";

    function setTokenBundle(bundle) {
      Object.keys(bundle || {}).forEach(function (token) {
        root.style.setProperty(token, bundle[token]);
      });
    }

    function describePresetValue(value) {
      return String(value || "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, function (match) {
          return match.toUpperCase();
        });
    }

    function currentPresetSelection() {
      return {
        family: familyPresetSelect.value,
        hue: huePresetSelect.value,
        scheme: schemePresetSelect.value,
        style: stylePresetSelect.value,
        typography: typographyPresetSelect.value,
        scale: scalePresetSelect.value,
        texture: texturePresetSelect.value,
      };
    }

    function presetSelectionSignature(selection) {
      const current = selection || currentPresetSelection();
      return JSON.stringify([
        current.family,
        current.hue,
        current.scheme,
        current.style,
        current.typography,
        current.scale,
        current.texture,
      ]);
    }

    function applyPresetComboBundle(combo, baseThemeName) {
      const baseTheme = baseThemeName || (themeSelect ? themeSelect.value : "");
      const baseCombo = baseThemePresetMap[baseTheme];
      if (!baseCombo) {
        root.removeAttribute("data-theme");
        setTokenBundle(buildColorBundle(combo.family, combo.hue));
        setTokenBundle(schemePresets[combo.scheme || "standard"]);
        setTokenBundle(stylePresets[combo.style]);
        setTokenBundle(scalePresets[combo.scale]);
        setTokenBundle(
          typographyPresets[
            combo.typography || inferTypographyPreset(combo.style)
          ],
        );
        setTokenBundle(
          texturePresets[combo.texture || inferTexturePreset(combo.style)],
        );
        return;
      }

      root.setAttribute("data-theme", baseTheme);
      const familyChanged = combo.family !== baseCombo.family;
      const hueChanged = combo.hue !== baseCombo.hue;
      const schemeChanged =
        (combo.scheme || "standard") !== (baseCombo.scheme || "standard");
      const styleChanged = combo.style !== baseCombo.style;
      const typographyChanged =
        (combo.typography || inferTypographyPreset(combo.style)) !==
        (baseCombo.typography || inferTypographyPreset(baseCombo.style));
      const scaleChanged = combo.scale !== baseCombo.scale;
      const textureChanged =
        (combo.texture || inferTexturePreset(combo.style)) !==
        (baseCombo.texture || inferTexturePreset(baseCombo.style));

      if (familyChanged || hueChanged) {
        setTokenBundle(buildColorBundle(combo.family, combo.hue));
      }
      if (familyChanged || hueChanged || schemeChanged) {
        setTokenBundle(schemePresets[combo.scheme || "standard"]);
      }
      if (styleChanged) {
        setTokenBundle(stylePresets[combo.style]);
      }
      if (scaleChanged) {
        setTokenBundle(scalePresets[combo.scale]);
      }
      if (typographyChanged) {
        setTokenBundle(
          typographyPresets[
            combo.typography || inferTypographyPreset(combo.style)
          ],
        );
      }
      if (textureChanged) {
        setTokenBundle(
          texturePresets[combo.texture || inferTexturePreset(combo.style)],
        );
      }
    }

    function selectionMatchesBaseTheme(theme, selection) {
      const base = baseThemePresetMap[theme];
      const current = selection || currentPresetSelection();
      if (!base) return false;
      return (
        base.family === current.family &&
        base.hue === current.hue &&
        (base.scheme || "standard") === current.scheme &&
        base.style === current.style &&
        (base.typography || inferTypographyPreset(base.style)) ===
          current.typography &&
        base.scale === current.scale &&
        (base.texture || inferTexturePreset(base.style)) === current.texture
      );
    }

    function updatePresetLoaderActions() {
      if (!applyPresetBtn) return;
      const autoApplyOn = !!(
        autoApplyPresetToggle && autoApplyPresetToggle.checked
      );
      const isDirty =
        presetSelectionSignature(currentPresetSelection()) !==
        lastAppliedPresetSignature;
      applyPresetBtn.hidden = autoApplyOn;
      applyPresetBtn.disabled = autoApplyOn || !isDirty;
    }

    function updatePresetRecipeReadout() {
      if (!presetRecipeOutput || !presetRecipeHint || !presetRecipeMeta) return;
      const theme = themeSelect ? themeSelect.value : root.getAttribute("data-theme");
      const base = baseThemePresetMap[theme];
      const current = currentPresetSelection();
      const lines = [
        "Base Theme: " + describePresetValue(theme || "custom"),
        "",
        "Family     " + describePresetValue(current.family),
        "Hue        " + describePresetValue(current.hue),
        "Scheme     " + describePresetValue(current.scheme),
        "Style      " + describePresetValue(current.style),
        "Typography " + describePresetValue(current.typography),
        "Scale      " + describePresetValue(current.scale),
        "Texture    " + describePresetValue(current.texture),
      ];
      presetRecipeMeta.innerHTML = "";
      const baseChip = doc.createElement("span");
      baseChip.className = "builder-recipe-chip";
      const baseLabel = doc.createElement("span");
      baseLabel.className = "builder-recipe-chip-label";
      baseLabel.textContent = "Base";
      const baseValue = doc.createElement("strong");
      baseValue.textContent = describePresetValue(theme || "custom");
      baseChip.appendChild(baseLabel);
      baseChip.appendChild(baseValue);
      presetRecipeMeta.appendChild(baseChip);

      if (base) {
        presetRecipeHint.textContent = selectionMatchesBaseTheme(theme, current)
          ? "Base stack"
          : "Modified stack";
      } else {
        presetRecipeHint.textContent = "Custom stack";
      }

      presetRecipeOutput.textContent = lines.join("\n");
    }

    function setPresetSelectors(combo) {
      if (!combo) return;
      familyPresetSelect.value = combo.family;
      huePresetSelect.value = combo.hue;
      schemePresetSelect.value = combo.scheme || "standard";
      stylePresetSelect.value = combo.style;
      typographyPresetSelect.value =
        combo.typography || inferTypographyPreset(combo.style);
      scalePresetSelect.value = combo.scale;
      texturePresetSelect.value =
        combo.texture || inferTexturePreset(combo.style);
      lastAppliedPresetSignature = presetSelectionSignature();
      updatePresetLoaderActions();
      updatePresetRecipeReadout();
    }

    function applySelectedPresetCombo() {
      const theme = themeSelect ? themeSelect.value : "";
      if (selectionMatchesBaseTheme(theme)) {
        clearOverrides();
        root.setAttribute("data-theme", theme);
        updatePresetRecipeReadout();
        return;
      }
      applyPresetComboBundle(currentPresetSelection());
      updatePresetRecipeReadout();
    }

    function applyPresetSelectionFromLoader() {
      clearOverrides();
      applySelectedPresetCombo();
      lastAppliedPresetSignature = presetSelectionSignature();
      updatePresetLoaderActions();
      syncControlsFromComputed();
    }

    function exportThemeBlock() {
      const name = sanitizeThemeName(themeNameInput.value);
      const block = buildThemeBlock(name);
      themeExportOutput.value = block;
      return { name, block };
    }

    function performReset() {
      applyPresetSelectionFromLoader();
    }

    if (autoApplyPresetToggle) {
      autoApplyPresetToggle.checked =
        win.localStorage.getItem(autoApplyPresetKey) !== "0";
      autoApplyPresetToggle.addEventListener("change", function () {
        win.localStorage.setItem(
          autoApplyPresetKey,
          this.checked ? "1" : "0",
        );
        updatePresetLoaderActions();
      });
    }

    [
      familyPresetSelect,
      huePresetSelect,
      schemePresetSelect,
      stylePresetSelect,
      typographyPresetSelect,
      scalePresetSelect,
      texturePresetSelect,
    ].forEach(function (element) {
      if (!element) return;
      element.addEventListener("input", function () {
        updatePresetRecipeReadout();
        updatePresetLoaderActions();
      });
      element.addEventListener("change", function () {
        updatePresetRecipeReadout();
        updatePresetLoaderActions();
        if (autoApplyPresetToggle && autoApplyPresetToggle.checked) {
          applyPresetSelectionFromLoader();
        }
      });
    });

    if (applyPresetBtn) {
      applyPresetBtn.addEventListener("click", function () {
        applyPresetSelectionFromLoader();
      });
    }

    if (themeSelect) {
      themeSelect.addEventListener("ds-theme-change", function () {
        const theme = themeSelect.value;
        clearOverrides();
        const combo = baseThemePresetMap[theme];
        if (combo) {
          setPresetSelectors(combo);
        }
        syncControlsFromComputed();
        if (typeof onThemeChanged === "function") {
          onThemeChanged(theme);
        }
      });
    }

    if (resetOverridesBtn && resetDialog) {
      resetOverridesBtn.addEventListener("click", function () {
        if (win.localStorage.getItem(resetConfirmKey) === "1") {
          performReset();
          return;
        }
        skipResetConfirmChk.checked = false;
        resetDialog.showModal();
      });
    }

    if (cancelResetBtn && resetDialog) {
      cancelResetBtn.addEventListener("click", function () {
        resetDialog.close();
      });
    }

    if (confirmResetBtn && resetDialog) {
      confirmResetBtn.addEventListener("click", function () {
        if (skipResetConfirmChk.checked) {
          win.localStorage.setItem(resetConfirmKey, "1");
        }
        resetDialog.close();
        performReset();
      });
    }

    if (exportThemeBtn) {
      exportThemeBtn.addEventListener("click", function () {
        exportThemeBlock();
      });
    }

    if (copyExportBtn) {
      copyExportBtn.addEventListener("click", async function () {
        const out = themeExportOutput;
        if (!out.value.trim()) exportThemeBlock();
        if (!out.value.trim()) return;
        try {
          await navigator.clipboard.writeText(out.value);
        } catch (_) {
          out.select();
          doc.execCommand("copy");
        }
      });
    }

    if (downloadPackageBtn) {
      downloadPackageBtn.addEventListener("click", function () {
        const exp = exportThemeBlock();
        const recipe = {
          themeName: exp.name,
          baseTheme: themeSelect.value,
          colorFamily: familyPresetSelect.value,
          hue: huePresetSelect.value,
          scheme: schemePresetSelect.value,
          style: stylePresetSelect.value,
          typography: typographyPresetSelect.value,
          scale: scalePresetSelect.value,
          texture: texturePresetSelect.value,
          generatedAt: new Date().toISOString(),
        };
        const files = studioPackagingApi
          ? studioPackagingApi.buildThemePackageFiles({
              themeName: exp.name,
              themeBlock: exp.block,
              recipe: recipe,
              packageFolder: "design-system",
            })
          : [];
        const zip = studioPackagingApi
          ? studioPackagingApi.makeZip(files)
          : null;
        if (studioPackagingApi && zip) {
          studioPackagingApi.downloadBlob(exp.name + "-theme-package.zip", zip);
        }
      });
    }

    const initialTheme = themeSelect ? themeSelect.value : root.getAttribute("data-theme");
    const initialCombo = baseThemePresetMap[initialTheme];
    if (initialCombo) {
      setPresetSelectors(initialCombo);
    }
    updatePresetRecipeReadout();
    syncControlsFromComputed();
    updatePresetLoaderActions();

    return {
      applyPresetSelectionFromLoader: applyPresetSelectionFromLoader,
      clearOverrides: clearOverrides,
      exportThemeBlock: exportThemeBlock,
      setPresetSelectors: setPresetSelectors,
      updatePresetLoaderActions: updatePresetLoaderActions,
      updatePresetRecipeReadout: updatePresetRecipeReadout,
    };
  }

  win.DesignSystemStudioBuilderEngine = {
    initBuilderEngine: initBuilderEngine,
  };
})(window, document);
