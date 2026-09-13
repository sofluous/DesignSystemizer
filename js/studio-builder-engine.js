(function (win, doc) {
  function initBuilderEngine(opts) {
    const root = opts.root;
    const session = opts.themeSession;
    const drafts = new Map();
    let activeTheme = themeSelectValue();
    function themeSelectValue() { return opts.themeSelect ? opts.themeSelect.value : root.getAttribute("data-theme"); }
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
    const inferTypographyPreset = opts.inferTypographyPreset;
    const inferTexturePreset = opts.inferTexturePreset;
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
        presetSelectionSignature(current) === presetSelectionSignature(session.recipe || current) ? "Applied recipe" : "Pending selections ? preview and export use the applied recipe",
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

    function applyPresetSelectionFromLoader() {
      session.select(currentPresetSelection());
      lastAppliedPresetSignature = presetSelectionSignature();
      updatePresetLoaderActions();
      updatePresetRecipeReadout();
      syncControlsFromComputed();
    }

    function exportThemeBlock() {
      const name = sanitizeThemeName(themeNameInput.value);
      const block = buildThemeBlock(name);
      themeExportOutput.value = block;
      return { name, block };
    }

    function performReset() {
      session.reset();
      syncControlsFromComputed();
    }

    function readSetting(key) { try { return win.localStorage.getItem(key); } catch (_) { return null; } }
    function writeSetting(key, value) { try { win.localStorage.setItem(key, value); } catch (_) {} }

    if (autoApplyPresetToggle) {
      autoApplyPresetToggle.checked =
        readSetting(autoApplyPresetKey) !== "0";
      autoApplyPresetToggle.addEventListener("change", function () {
        writeSetting(
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
        drafts.set(activeTheme, session.snapshot());
        activeTheme = theme;
        const draft = drafts.get(theme) || { recipe: baseThemePresetMap[theme], overrides: {} };
        session.load(draft);
        setPresetSelectors(draft.recipe);
        syncControlsFromComputed();
        if (typeof onThemeChanged === "function") {
          onThemeChanged(theme);
        }
      });
    }

    if (resetOverridesBtn && resetDialog) {
      resetOverridesBtn.addEventListener("click", function () {
        if (readSetting(resetConfirmKey) === "1") {
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
          writeSetting(resetConfirmKey, "1");
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
        exportThemeBlock();
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
          schemaVersion: 1,
          layers: session.recipe,
          overrides: session.overrides,
          tokens: session.tokens,
          contrast: win.DesignSystemThemeContrast.audit(session.tokens),
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
      session.load({ recipe: initialCombo, overrides: {} });
      setPresetSelectors(initialCombo);
    }
    const editStatus = doc.getElementById("themeEditStatus");
    const undoButton = doc.getElementById("undoThemeEditBtn");
    function updateEditStatus() {
      const count = Object.keys(session.overrides).length;
      const issues = win.DesignSystemThemeContrast.audit(session.tokens).filter((item) => item.ratio === null || item.ratio < 4.5);
      if (editStatus) editStatus.textContent = count + " manual override(s). " +
        (issues.length ? issues.length + " contrast pair(s) need review: " + issues.map((p) => p.fg).join(", ") : "Checked control contrast pairs pass.") +
        (session.fixes.length ? " " + session.fixes.length + " preset contrast adjustment(s)." : "");
      if (undoButton) undoButton.disabled = !session.canUndo;
      if (themeExportOutput) themeExportOutput.value = "";
    }
    session.subscribe(updateEditStatus);
    if (undoButton) undoButton.addEventListener("click", function () {
      session.undo();
      setPresetSelectors(session.recipe);
      syncControlsFromComputed();
    });
    updateEditStatus();
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
