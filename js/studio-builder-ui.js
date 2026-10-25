(function (win, doc) {
  function initBuilderUi(opts) {
    const tokenGroups = opts.tokenGroups || [];
    const renderBuilder = opts.renderBuilder;
    const builderPresetOwners = opts.builderPresetOwners || [];
    const builderGroupOwnerMap = opts.builderGroupOwnerMap || {};
    const builderState = opts.builderState;
    const humanLabel = opts.humanLabel;
    const tokenUsageHint = opts.tokenUsageHint;
    const studioIconMarkup = opts.studioIconMarkup;
    const controlMap = opts.controlMap;
    const getRawTokenValue = opts.getRawTokenValue;
    const copyTextValue = opts.copyTextValue;
    const addToast = opts.addToast;

    const builderGroupTabs = doc.getElementById("builderGroupTabs");
    const builderPresetTabs = doc.getElementById("builderPresetTabs");
    const builderPreviewHint = doc.getElementById("builderPreviewHint");
    const builderTokenSearch = doc.getElementById("builderTokenSearch");

    if (
      !renderBuilder ||
      !builderState ||
      !humanLabel ||
      !tokenUsageHint ||
      !studioIconMarkup ||
      !controlMap ||
      !getRawTokenValue ||
      !copyTextValue ||
      !addToast
    ) {
      return null;
    }

    function openTokenInfo(token) {
      const dialog = doc.getElementById("tokenInfoDialog");
      const meta = controlMap.get(token);
      if (!dialog || !meta) return;
      const assignment = token + ": " + getRawTokenValue(meta) + ";";
      doc.getElementById("tokenInfoTitle").textContent = humanLabel(token);
      doc.getElementById("tokenInfoHint").textContent =
        "This setting writes a design token variable used across components.";
      doc.getElementById("tokenInfoToken").textContent = token;
      doc.getElementById("tokenInfoAssignment").textContent = assignment;
      doc.getElementById("tokenInfoUsage").textContent = tokenUsageHint(token);
      doc.getElementById("copyTokenInfoBtn").onclick = function () {
        copyTextValue(assignment).then(function (ok) {
          if (ok) addToast("success", "Copied token assignment.");
          else addToast("danger", "Copy failed.");
        });
      };
      dialog.showModal();
    }

    function attachBuilderLearningTools() {
      doc.querySelectorAll("#builderGroups .builder-field").forEach(function (
        field,
        index
      ) {
        if (field.dataset.enhanced === "1") return;
        const token = field.dataset.token || "";
        const label = field.querySelector("label");
        if (!token || !label) return;

        const labelText = (label.textContent || "").trim() || humanLabel(token);
        field.dataset.token = token;

        const head = doc.createElement("div");
        head.className = "builder-field-head";
        label.parentNode.insertBefore(head, label);
        head.appendChild(label);

        const actions = doc.createElement("div");
        actions.className = "builder-field-actions";

        const infoBtn = doc.createElement("button");
        infoBtn.type = "button";
        infoBtn.className = "ds-btn builder-help-btn is-icon";
        infoBtn.innerHTML = studioIconMarkup("info");
        infoBtn.title = tokenUsageHint(token) + " [" + token + "]";
        infoBtn.setAttribute(
          "aria-label",
          "Show details for " + labelText + " (" + token + ")",
        );
        infoBtn.addEventListener("click", function () {
          openTokenInfo(token);
        });

        const copyBtn = doc.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "ds-btn builder-help-btn is-icon";
        copyBtn.innerHTML = studioIconMarkup("copy");
        copyBtn.title = "Copy " + token + " assignment";
        copyBtn.setAttribute(
          "aria-label",
          "Copy assignment for " + labelText + " (" + token + ")",
        );
        copyBtn.addEventListener("click", function () {
          const meta = controlMap.get(token);
          if (!meta) return;
          const text = token + ": " + getRawTokenValue(meta) + ";";
          copyTextValue(text).then(function (ok) {
            if (ok) addToast("success", "Copied " + token);
            else addToast("danger", "Copy failed.");
          });
        });

        actions.appendChild(infoBtn);
        actions.appendChild(copyBtn);
        head.appendChild(actions);
        field.dataset.enhanced = "1";
      });
    }

    const quickTokens = new Set([
      "--ds-bg", "--ds-bg-elevated", "--ds-text", "--ds-text-muted", "--ds-accent", "--ds-accent-alt",
      "--ds-font-sans", "--ds-font-mono", "--ds-fs-3", "--ds-lh-base", "--ds-layout-gap",
      "--ds-card-pad", "--ds-control-h", "--ds-btn-radius", "--ds-card-radius", "--ds-card-shadow",
    ]);
    let advanced = false;
    const changedOnly = doc.getElementById("builderChangedOnly");
    const quickButton = doc.getElementById("builderQuickBtn");
    const advancedButton = doc.getElementById("builderAdvancedBtn");
    const clearSearch = doc.getElementById("builderClearSearch");
    const filtersToggle = doc.getElementById("builderFiltersToggle");
    const filters = doc.getElementById("builderFilters");
    let filtersOpen = false;
    let narrowToolbar = false;
    let categorySelect;
    function syncFilterDisclosure() {
      if (narrowToolbar && !filtersOpen && filters.contains(doc.activeElement)) filtersOpen = true;
      if (!narrowToolbar && doc.activeElement === filtersToggle) categorySelect.focus();
      filtersToggle.hidden = !narrowToolbar;
      filters.hidden = narrowToolbar && !filtersOpen;
      filters.closest(".builder-mode-bar").classList.toggle("filters-collapsed", filters.hidden);
      filtersToggle.setAttribute("aria-expanded", String(!filters.hidden));
    }
    filtersToggle.addEventListener("click", () => { filtersOpen = !filtersOpen; syncFilterDisclosure(); });
    const toolbarObserver = new win.ResizeObserver(([entry]) => {
      if (entry.contentRect.width <= 0) return;
      narrowToolbar = entry.contentRect.width <= 600;
      syncFilterDisclosure();
    });
    toolbarObserver.observe(doc.querySelector(".builder-toolbar-container"));
    clearSearch.addEventListener("click", () => {
      builderTokenSearch.value = "";
      builderState.searchQuery = "";
      builderTokenSearch.focus();
      applyBuilderPresentation();
    });
    const expansionBeforeSearch = new Map();
    function renderBuilderGroupTabs() {
      if (!builderGroupTabs) return;
      builderGroupTabs.replaceChildren();
      const label = doc.createElement("label");
      label.className = "studio-sr-only";
      label.textContent = "Category";
      label.htmlFor = "builderCategorySelect";
      categorySelect = doc.createElement("select");
      categorySelect.className = "ds-select";
      categorySelect.id = "builderCategorySelect";
      for (const name of ["All categories", ...tokenGroups.map((group) => group.name)]) {
        const option = doc.createElement("option");
        option.textContent = name;
        option.value = name === "All categories" ? "__all__" : name;
        categorySelect.appendChild(option);
      }
      categorySelect.addEventListener("change", () => {
        builderState.activeGroup = categorySelect.value;
        advanced = true;
        applyBuilderPresentation();
      });
      builderGroupTabs.append(label, categorySelect);
    }
    function renderBuilderPresetTabs() {} // Categories replace the ambiguous group-owner filter.

    function applyBuilderPresentation() {
      const query = builderState.searchQuery.trim().toLowerCase();
      const searching = !!query;
      const overrides = opts.themeSession ? opts.themeSession.overrides : {};
      let visible = 0;
      quickButton.setAttribute("aria-pressed", String(!advanced));
      advancedButton.setAttribute("aria-pressed", String(advanced));
      if (categorySelect) {
        categorySelect.disabled = searching;
        categorySelect.title = searching ? "Category is paused while searching all tokens" : "Filter by category";
      }
      clearSearch.hidden = !builderTokenSearch.value.length;
      const filterCount = Number(!searching && builderState.activeGroup !== "__all__") + Number(changedOnly.checked);
      filtersToggle.textContent = "Filters" + (filterCount ? " (" + filterCount + ")" : "");
      doc.querySelectorAll("#builderGroups .builder-group").forEach((card) => {
        let cardVisible = false;
        const categoryMatches = searching || builderState.activeGroup === "__all__" || card.dataset.groupName === builderState.activeGroup;
        card.querySelectorAll(".builder-section").forEach((section) => {
          let sectionVisible = false;
          section.querySelectorAll(".builder-field").forEach((field) => {
            const token = field.dataset.token;
            const match = categoryMatches && (!changedOnly.checked || Object.hasOwn(overrides, token)) &&
              (searching ? field.dataset.searchText.toLowerCase().includes(query) : advanced || changedOnly.checked || quickTokens.has(token));
            field.hidden = !match;
            if (match) { visible++; sectionVisible = true; cardVisible = true; }
          });
          section.hidden = !sectionVisible;
          if (searching) {
            if (!expansionBeforeSearch.has(section)) expansionBeforeSearch.set(section, section.open);
            section.open = sectionVisible;
          } else if (expansionBeforeSearch.has(section)) {
            section.open = expansionBeforeSearch.get(section);
            expansionBeforeSearch.delete(section);
          } else if (!advanced || changedOnly.checked) section.open = sectionVisible;
        });
        card.hidden = !cardVisible;
      });
      doc.getElementById("builderResultCount").textContent = visible + " shown";
      doc.getElementById("builderResultCount").setAttribute("aria-label", visible + " tokens shown");
      doc.getElementById("builderEmptyState").hidden = visible > 0;
      if (builderPreviewHint) builderPreviewHint.textContent = searching ? "Search covers every category and all tokens." : "Preview shows the applied recipe and your manual edits.";
    }
    quickButton.addEventListener("click", () => { advanced = false; builderState.activeGroup = "__all__"; categorySelect.value = "__all__"; applyBuilderPresentation(); });
    advancedButton.addEventListener("click", () => { advanced = true; applyBuilderPresentation(); });
    changedOnly.addEventListener("change", applyBuilderPresentation);
    if (opts.themeSession) opts.themeSession.subscribe(applyBuilderPresentation);

    if (builderTokenSearch) {
      builderTokenSearch.addEventListener("input", function () {
        builderState.searchQuery = (builderTokenSearch.value || "")
          .trim()
          .toLowerCase();
        applyBuilderPresentation();
      });
    }

    renderBuilder();
    attachBuilderLearningTools();
    renderBuilderPresetTabs();
    renderBuilderGroupTabs();
    applyBuilderPresentation();

    return {
      applyBuilderPresentation,
      renderBuilderGroupTabs,
      renderBuilderPresetTabs,
    };
  }

  win.DesignSystemStudioBuilderUi = {
    initBuilderUi,
  };
})(window, document);
