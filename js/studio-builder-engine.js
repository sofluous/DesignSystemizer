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

    const recipeError = doc.createElement("p");
    recipeError.id = "themeRecipeError";
    recipeError.setAttribute("role", "alert");
    if (presetRecipeHint) presetRecipeHint.after(recipeError);
    let lastAppliedPresetSignature = "";
    const draftApi = win.DesignSystemStudioThemeDrafts;
    const draftStore = draftApi.createStore(() => win.localStorage);
    const draftStatus = doc.getElementById("themeDraftStatus");
    const importStatus = doc.getElementById("themeImportStatus");
    const importInput = doc.getElementById("importRecipeInput");
    const invalidDrafts = new Set();
    let saveTimer;
    let storageWarning = "";
    function recipeDocument() {
      return {
        schemaVersion: 1, themeName: sanitizeThemeName(themeNameInput.value), baseTheme: activeTheme,
        generator: { name: "Design System Studio", contractVersion: 1,
          presetRevision: win.DesignSystemThemePackageAssets.presetRevision },
        layers: session.recipe, overrides: session.overrides, tokens: session.tokens,
      };
    }
    function persistDraft() {
      win.clearTimeout(saveTimer);
      if (!session.recipe) return;
      drafts.set(activeTheme, { state: session.snapshot(), themeName: themeNameInput.value });
      try {
        if (invalidDrafts.has(activeTheme)) throw new Error("This theme has an unreadable saved draft. Download your current recipe; the saved copy has not been overwritten.");
        draftStore.save(activeTheme, recipeDocument());
        draftStatus.textContent = storageWarning || "Applied draft saved in this browser. Pending layer selections are not saved.";
      } catch (error) {
        draftStatus.textContent = "Draft not saved: " + error.message + " Download recipe JSON to keep your current work.";
      }
    }
    function scheduleSave() {
      win.clearTimeout(saveTimer);
      draftStatus.textContent = "Saving applied draft...";
      saveTimer = win.setTimeout(persistDraft, 250);
    }
    try {
      for (const [id, value] of Object.entries(draftStore.load())) {
        if (!Object.hasOwn(baseThemePresetMap, id)) continue;
        try { drafts.set(id, draftApi.decodeRecipe(value, session)); }
        catch (_) { invalidDrafts.add(id); }
      }
      if (invalidDrafts.size) storageWarning = "Some saved drafts could not be opened and remain untouched: " + [...invalidDrafts].join(", ") + ". Download current recipes before repairing browser storage.";
      draftStatus.textContent = storageWarning || "Drafts save automatically in this browser. Download recipes for a portable backup.";
    } catch (error) {
      storageWarning = "Automatic saving unavailable: " + error.message + " Download recipes to keep your work.";
      draftStatus.textContent = storageWarning;
    }
    themeNameInput.addEventListener("input", scheduleSave);
    win.addEventListener("pagehide", persistDraft);
    doc.addEventListener("visibilitychange", () => { if (doc.visibilityState === "hidden") persistDraft(); });
    doc.getElementById("downloadRecipeBtn").addEventListener("click", () => {
      const recipe = recipeDocument();
      studioPackagingApi.downloadBlob(recipe.themeName + ".recipe.json", new Blob([JSON.stringify(recipe, null, 2)], { type: "application/json" }));
    });
    importInput.addEventListener("change", async () => {
      const file = importInput.files[0];
      if (!file) return;
      const before = JSON.stringify([activeTheme, session.snapshot(), themeNameInput.value]);
      importInput.disabled = true;
      try {
        if (file.size > draftApi.maxFileBytes) throw new Error("Recipe exceeds the 2 MB limit.");
        const imported = draftApi.decodeRecipe(draftApi.parse(await file.text()), session);
        if (before !== JSON.stringify([activeTheme, session.snapshot(), themeNameInput.value])) throw new Error("The draft changed while reading the file. Select the file again to import into the current draft.");
        session.select(imported.state.recipe, imported.state.overrides);
        themeNameInput.value = imported.themeName;
        setPresetSelectors(session.recipe);
        syncControlsFromComputed();
        recipeError.textContent = "";
        persistDraft();
        importStatus.textContent = "Recipe imported. Undo restores the previous settings." +
          (imported.compatibilityOverrides ? " Preserved the exported appearance with " + imported.compatibilityOverrides + " compatibility override(s)." : "");
      } catch (error) {
        importStatus.textContent = "Import was not applied. " + error.message;
      } finally { importInput.disabled = false; importInput.value = ""; }
    });


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
        presetSelectionSignature(current) === presetSelectionSignature(session.recipe || current) ? "Applied recipe" : "Pending selections: preview and export use the applied recipe",
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
      try {
        session.select(currentPresetSelection());
        recipeError.textContent = "";
      } catch (error) {
        setPresetSelectors(session.recipe);
        recipeError.textContent = "Layer change was not applied. " + error.message + " Your previous recipe and edits are preserved.";
        return;
      }
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
        persistDraft();
        activeTheme = theme;
        const draft = drafts.get(theme) || { state: { recipe: baseThemePresetMap[theme], overrides: {} }, themeName: "custom-theme" };
        themeNameInput.value = draft.themeName;
        session.load(draft.state);
        setPresetSelectors(draft.state.recipe);
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
        const recipe = { ...recipeDocument(),
          contrast: win.DesignSystemThemeContrast.audit(session.tokens),
          adjustments: session.fixes,
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
      const draft = drafts.get(initialTheme);
      if (draft) themeNameInput.value = draft.themeName;
      session.load(draft ? draft.state : { recipe: initialCombo, overrides: {} });
      setPresetSelectors(session.recipe);
    }
    const editStatus = doc.getElementById("themeEditStatus");
    const undoButton = doc.getElementById("undoThemeEditBtn");
    const schemeColorNotice = doc.createElement("div");
    schemeColorNotice.id = "schemeColorNotice";
    schemeColorNotice.hidden = true;
    const schemeColorMessage = doc.createElement("p");
    schemeColorMessage.className = "ds-muted";
    schemeColorMessage.textContent = "Saved button or tab colors override the current theme.";
    const restoreSchemeColors = doc.createElement("button");
    restoreSchemeColors.id = "restoreSchemeColorsBtn";
    restoreSchemeColors.type = "button";
    restoreSchemeColors.className = "ds-btn ds-btn-sm";
    restoreSchemeColors.textContent = "Use current colors";
    restoreSchemeColors.title = "Restore primary/secondary button and tab colors. Keep other edits. Undo is available.";
    schemeColorNotice.append(schemeColorMessage, restoreSchemeColors);
    if (editStatus) editStatus.before(schemeColorNotice);
    const isSchemeColor = (token) => /^--ds-(?:btn(?:-primary)?-(?:bg(?:-hover)?|border|text(?:-hover|-selected)?)|tab-(?:bg|fg|border|active-(?:bg|fg|border|icon)))$/.test(token);
    restoreSchemeColors.addEventListener("click", () => {
      const overrides = Object.fromEntries(Object.entries(session.overrides).filter(([token]) => !isSchemeColor(token)));
      session.select(session.recipe, overrides);
      syncControlsFromComputed();
      // The action disappears when applied; leave keyboard focus on its Undo action.
      if (undoButton) undoButton.focus();
    });
    function updateEditStatus() {
      const overrides = session.overrides;
      const buttonEdits = Object.keys(overrides).filter(isSchemeColor);
      if (buttonEdits.length) {
        const defaults = session.validate({ recipe: session.recipe, overrides: {} });
        schemeColorNotice.hidden = !buttonEdits.some((token) => overrides[token] !== defaults[token]);
      } else schemeColorNotice.hidden = true;
      const count = Object.keys(overrides).length;
      const issues = win.DesignSystemThemeContrast.audit(session.tokens).filter((item) => item.ratio === null || item.ratio < 4.5);
      if (editStatus) editStatus.textContent = count + " manual override(s). " +
        (issues.length ? issues.length + " contrast pair(s) need review: " + issues.map((p) => p.fg).join(", ") : "Checked control contrast pairs pass.") +
        (session.fixes.length ? " " + session.fixes.length + " preset contrast adjustment(s)." : "");
      if (undoButton) undoButton.disabled = !session.canUndo;
      if (themeExportOutput) themeExportOutput.value = "";
    }
    const adjustmentDetails = doc.createElement("details");
    const adjustmentSummary = doc.createElement("summary");
    adjustmentSummary.textContent = "Preset contrast adjustments";
    const adjustmentList = doc.createElement("ul");
    adjustmentDetails.append(adjustmentSummary, adjustmentList);
    if (editStatus) editStatus.after(adjustmentDetails);
    function updateAdjustments() {
      adjustmentList.replaceChildren();
      adjustmentDetails.hidden = !session.fixes.length;
      for (const fix of session.fixes) {
        const item = doc.createElement("li");
        item.textContent = fix.fg + ": " + fix.before.foreground + " ? " + fix.after.foreground +
          (fix.backgroundReplaced ? "; " + fix.bg + " replaced: " + fix.before.background + " ? " + fix.after.background : " (background preserved)");
        adjustmentList.appendChild(item);
      }
    }
    session.subscribe(() => { updateEditStatus(); updateAdjustments(); scheduleSave(); });
    updateAdjustments();
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
