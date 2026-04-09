;(function (win, doc) {
  function initStudioIcons() {
    const studioPackagingApi = win.DesignSystemStudioPackaging || null;
    const iconSources = Array.isArray(win.DesignSystemIconSources)
      ? win.DesignSystemIconSources.slice()
      : [];
    const iconRegistry = Array.isArray(win.DesignSystemIconRegistry)
      ? JSON.parse(JSON.stringify(win.DesignSystemIconRegistry))
      : [];
    const iconSelectionStorageKey = "ds-icon-selection-overrides";
    const iconDefaultStorageKey = "ds-icon-default-overrides";
    const iconSearch = doc.getElementById("iconSearch");
    const iconStatusFilter = doc.getElementById("iconStatusFilter");
    const iconCategoryFilter =
      doc.getElementById("iconCategoryFilter");
    const iconSourceFilter = doc.getElementById("iconSourceFilter");
    const iconGroupNav = doc.getElementById("iconGroupNav");
    const iconGrid = doc.getElementById("iconGrid");
    const iconMeta = doc.getElementById("iconMeta");
    const iconHitlistBody = doc.getElementById("iconHitlistBody");
    const iconInspector = doc.getElementById("iconInspector");
    const iconInspectorEmpty =
      doc.getElementById("iconInspectorEmpty");
    const iconInspectorBody = doc.getElementById("iconInspectorBody");
    const iconInspectorPreview = doc.getElementById(
      "iconInspectorPreview",
    );
    const iconInspectorName = doc.getElementById("iconInspectorName");
    const iconInspectorStatus = doc.getElementById(
      "iconInspectorStatus",
    );
    const iconInspectorAlias =
      doc.getElementById("iconInspectorAlias");
    const iconInspectorSelected = doc.getElementById(
      "iconInspectorSelected",
    );
    const iconInspectorSuggested = doc.getElementById(
      "iconInspectorSuggested",
    );
    const iconInspectorFixedNote = doc.getElementById(
      "iconInspectorFixedNote",
    );
    const iconInspectorChoicePreview = doc.getElementById(
      "iconInspectorChoicePreview",
    );
    const iconInspectorChoiceLabel = doc.getElementById(
      "iconInspectorChoiceLabel",
    );
    const iconInspectorChoiceRef = doc.getElementById(
      "iconInspectorChoiceRef",
    );
    const iconInspectorBrowseBtn = doc.getElementById(
      "iconInspectorBrowseBtn",
    );
    const iconInspectorUseSuggestedBtn = doc.getElementById(
      "iconInspectorUseSuggestedBtn",
    );
    const iconInspectorSetDefaultBtn = doc.getElementById(
      "iconInspectorSetDefaultBtn",
    );
    const iconInspectorResetDefaultBtn = doc.getElementById(
      "iconInspectorResetDefaultBtn",
    );
    const iconInspectorExportBtn = doc.getElementById(
      "iconInspectorExportBtn",
    );
    const exportIconManifestBtn = doc.getElementById(
      "exportIconManifestBtn",
    );
    const iconCandidateDialog = doc.getElementById(
      "iconCandidateDialog",
    );
    const iconCandidateTitle =
      doc.getElementById("iconCandidateTitle");
    const iconCandidateHint = doc.getElementById("iconCandidateHint");
    const iconCandidateSearch = doc.getElementById(
      "iconCandidateSearch",
    );
    const iconCandidateSourceFilter = doc.getElementById(
      "iconCandidateSourceFilter",
    );
    const iconCandidateList = doc.getElementById("iconCandidateList");
    const iconCandidatePreview = doc.getElementById(
      "iconCandidatePreview",
    );
    const iconCandidatePreviewLabel = doc.getElementById(
      "iconCandidatePreviewLabel",
    );
    const iconCandidatePreviewRef = doc.getElementById(
      "iconCandidatePreviewRef",
    );
    const iconCandidateDefaultLine = doc.getElementById(
      "iconCandidateDefaultLine",
    );
    const iconCandidateFixedNote = doc.getElementById(
      "iconCandidateFixedNote",
    );
    const iconCandidateManualInput = doc.getElementById(
      "iconCandidateManualInput",
    );
    const iconCandidateManualBtn = doc.getElementById(
      "iconCandidateManualBtn",
    );
    const closeIconCandidateBtn = doc.getElementById(
      "closeIconCandidateBtn",
    );
    const iconCandidateUseSuggestedBtn = doc.getElementById(
      "iconCandidateUseSuggestedBtn",
    );
    const iconCandidateApplyBtn = doc.getElementById(
      "iconCandidateApplyBtn",
    );
    const iconCandidateSetDefaultBtn = doc.getElementById(
      "iconCandidateSetDefaultBtn",
    );
    let iconSelectionOverrides = loadIconSelectionOverrides();
    let iconDefaultOverrides = loadIconDefaultOverrides();
    let activeIconCandidateId = "";
    let activeIconCandidateSelection = null;
    let selectedIconId = "";
    const iconCategoryMeta = {
      actions: {
        label: "Actions",
        description:
          "Direct commands such as create, save, edit, delete, undo, and view controls.",
        order: 10,
      },
      navigation: {
        label: "Navigation",
        description:
          "Directional movement, disclosure, menus, rails, and flow through the app.",
        order: 20,
      },
      feedback: {
        label: "Feedback",
        description:
          "Status, warnings, confirmations, and help cues that explain system state.",
        order: 30,
      },
      data: {
        label: "Data",
        description:
          "Files, folders, databases, time, layers, and other content representations.",
        order: 40,
      },
      map: {
        label: "Map and Projection",
        description:
          "Location, route, surface, and spatial controls used in map or projection workflows.",
        order: 50,
      },
      layout: {
        label: "Layout and Placement",
        description:
          "Alignment, region placement, panel positioning, and composition helpers.",
        order: 60,
      },
      typography: {
        label: "Typography",
        description:
          "Text-specific affordances that represent labels, type, or textual content modes.",
        order: 70,
      },
    };
    function loadIconSelectionOverrides() {
      try {
        return JSON.parse(
          localStorage.getItem(iconSelectionStorageKey) || "{}",
        );
      } catch (_) {
        return {};
      }
    }
    function saveIconSelectionOverrides() {
      localStorage.setItem(
        iconSelectionStorageKey,
        JSON.stringify(iconSelectionOverrides),
      );
    }
    function loadIconDefaultOverrides() {
      try {
        return JSON.parse(
          localStorage.getItem(iconDefaultStorageKey) || "{}",
        );
      } catch (_) {
        return {};
      }
    }
    function saveIconDefaultOverrides() {
      localStorage.setItem(
        iconDefaultStorageKey,
        JSON.stringify(iconDefaultOverrides),
      );
    }
    function iconPriorityScore(icon) {
      const gap = icon.status === "placeholder" ? 2 : 0.6;
      return Math.round(icon.frequency * icon.utility * gap * 10) / 10;
    }
    function iconById(iconId) {
      return iconRegistry.find((icon) => icon.id === iconId) || null;
    }
    function iconSourceName(sourceId) {
      const source = iconSources.find((item) => item.id === sourceId);
      return source ? source.name : sourceId;
    }
    function placeholderGlyph() {
      return '<rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke-dasharray="2 2"></rect><line x1="8" y1="8" x2="16" y2="16"></line><line x1="16" y1="8" x2="8" y2="16"></line>';
    }
    function defaultCandidate(icon) {
      const override = iconDefaultOverrides[icon.id];
      if (override && override.mode === "manual" && override.manualRef) {
        const parts = override.manualRef.split(":");
        const sourceId = parts[0] || "manual";
        const iconName = parts.slice(1).join(":") || "custom";
        return {
          id: "manual-default",
          mode: "manual",
          sourceId,
          iconName,
          label: iconSourceName(sourceId) + " / " + iconName,
          manualRef: override.manualRef,
        };
      }
      if (
        override &&
        override.mode === "candidate" &&
        override.candidateId
      ) {
        const matchedOverride = (icon.candidates || []).find(
          (candidate) => candidate.id === override.candidateId,
        );
        if (matchedOverride) return matchedOverride;
      }
      return (
        (icon.candidates || []).find(
          (candidate) => candidate.id === icon.defaultCandidateId,
        ) ||
        (icon.candidates || [])[0] ||
        null
      );
    }
    function resolveIconChoice(icon) {
      const override = iconSelectionOverrides[icon.id];
      if (override && override.mode === "manual" && override.manualRef) {
        const parts = override.manualRef.split(":");
        const sourceId = parts[0] || "manual";
        const iconName = parts.slice(1).join(":") || "custom";
        return {
          mode: "manual",
          sourceId,
          iconName,
          label: iconSourceName(sourceId) + " / " + iconName,
          manualRef: override.manualRef,
        };
      }
      if (
        override &&
        override.mode === "candidate" &&
        override.candidateId
      ) {
        const matched = (icon.candidates || []).find(
          (candidate) => candidate.id === override.candidateId,
        );
        if (matched) return Object.assign({ mode: "candidate" }, matched);
      }
      const fallback = defaultCandidate(icon);
      return fallback
        ? Object.assign({ mode: "candidate" }, fallback)
        : {
            mode: "placeholder",
            sourceId: "unassigned",
            iconName: icon.id,
            label: "No candidate selected",
          };
    }
    function cloneIconChoice(choice) {
      return choice ? JSON.parse(JSON.stringify(choice)) : null;
    }
    function hasChoiceGlyph(choice) {
      return !!(choice && typeof choice.glyph === "string" && choice.glyph.trim());
    }
    function iconSvgMarkup(icon) {
      const choice = resolveIconChoice(icon);
      const imageUrl = iconPreviewUrl(choice);
      return (
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        (hasChoiceGlyph(choice) ? choice.glyph : placeholderGlyph()) +
        "</svg>"
      );
    }
    function iconPreviewUrl(choice) {
      if (!choice) return "";
      if (choice.localFile) return choice.localFile;
      if (choice.previewUrl) return choice.previewUrl;
      if (
        choice.manualRef &&
        /^https?:\/\//i.test(choice.manualRef) &&
        choice.manualRef.toLowerCase().indexOf(".svg") > -1
      ) {
        return choice.manualRef;
      }
      const source = iconSources.find(
        (item) => item.id === choice.sourceId,
      );
      if (source && source.previewUrlTemplate && choice.iconName) {
        return source.previewUrlTemplate.replace(
          /\{name\}/g,
          encodeURIComponent(choice.iconName),
        );
      }
      return "";
    }
    function iconSvgFile(icon) {
      const choice = resolveIconChoice(icon);
      const body = choice.glyph || placeholderGlyph();
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        "<title>" +
        icon.name +
        "</title>" +
        body +
        "</svg>\n"
      );
    }
    function downloadIconSvg(icon) {
      const blob = new Blob([iconSvgFile(icon)], {
        type: "image/svg+xml;charset=utf-8",
      });
      if (studioPackagingApi) {
        studioPackagingApi.downloadBlob(icon.id + ".svg", blob);
      }
    }
    function setIconSelectionToSuggested(icon) {
      delete iconSelectionOverrides[icon.id];
      saveIconSelectionOverrides();
    }
    function commitActiveIconSelection(asDefault) {
      const icon = iconById(activeIconCandidateId);
      const choice = activeIconCandidateSelection;
      if (!icon || !choice) return;
      if (choice.mode === "manual" && choice.manualRef) {
        iconSelectionOverrides[icon.id] = {
          mode: "manual",
          manualRef: choice.manualRef,
        };
        if (asDefault) {
          iconDefaultOverrides[icon.id] = {
            mode: "manual",
            manualRef: choice.manualRef,
          };
        }
      } else if (choice.id) {
        iconSelectionOverrides[icon.id] = {
          mode: "candidate",
          candidateId: choice.id,
        };
        if (asDefault) {
          iconDefaultOverrides[icon.id] = {
            mode: "candidate",
            candidateId: choice.id,
          };
        }
      }
      saveIconSelectionOverrides();
      if (asDefault) saveIconDefaultOverrides();
      renderIconGallery();
      if (iconCandidateDialog) iconCandidateDialog.close();
    }
    function exportIconManifest() {
      const manifest = {
        generatedAt: new Date().toISOString(),
        version: "0.1",
        sources: iconSources.map((source) => ({
          id: source.id,
          name: source.name,
          license: source.license,
          site: source.site,
        })),
        icons: iconRegistry.map((icon) => {
          const choice = resolveIconChoice(icon);
          const defaultChoice = defaultCandidate(icon);
          return {
            id: icon.id,
            alias: icon.alias,
            name: icon.name,
            category: icon.category,
            status: icon.status,
            defaultCandidateId: icon.defaultCandidateId || null,
            selected: {
              mode: choice.mode,
              sourceId: choice.sourceId,
              iconName: choice.iconName,
              label: choice.label,
              localFile: choice.localFile || null,
              manualRef: choice.manualRef || null,
            },
            defaultGuess: defaultChoice
              ? {
                  mode: defaultChoice.mode || "candidate",
                  sourceId: defaultChoice.sourceId,
                  iconName: defaultChoice.iconName,
                  label: defaultChoice.label,
                  localFile: defaultChoice.localFile || null,
                  manualRef: defaultChoice.manualRef || null,
                }
              : null,
            apps: icon.apps || [],
            tags: icon.tags || [],
          };
        }),
      };
      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      if (studioPackagingApi) {
        studioPackagingApi.downloadBlob("ds-icon-alias-manifest.json", blob);
      }
    }
    function buildIconCandidateSourceFilter() {
      if (!iconCandidateSourceFilter) return;
      iconCandidateSourceFilter.innerHTML =
        '<option value="all">All Sources</option>';
      iconSources.forEach((source) => {
        const opt = doc.createElement("option");
        opt.value = source.id;
        opt.textContent = source.name;
        iconCandidateSourceFilter.appendChild(opt);
      });
    }
    function renderIconCandidatePreview(
      choice,
      defaultChoice,
      hasFixedDefault,
    ) {
      if (!iconCandidatePreview) return;
      const previewUrl = iconPreviewUrl(choice);
      iconCandidatePreview.className =
        "icon-preview" +
        (choice && (hasChoiceGlyph(choice) || previewUrl) ? "" : " is-placeholder");
      if (hasChoiceGlyph(choice)) {
        iconCandidatePreview.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          choice.glyph +
          "</svg>";
      } else if (previewUrl) {
        iconCandidatePreview.innerHTML =
          '<img src="' +
          previewUrl.replace(/"/g, "&quot;") +
          '" alt="" loading="lazy" referrerpolicy="no-referrer" />';
      } else {
        iconCandidatePreview.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          ((choice && choice.glyph) || placeholderGlyph()) +
          "</svg>";
      }
      iconCandidatePreviewLabel.textContent =
        (choice && choice.label) || "No candidate selected";
      iconCandidatePreviewRef.textContent =
        (choice &&
          (choice.localFile ||
            choice.manualRef ||
            choice.sourceId + ":" + choice.iconName)) ||
        "-";
      iconCandidateDefaultLine.textContent =
        "Suggested: " +
        (defaultChoice ? defaultChoice.label : "No default guess");
      iconCandidateFixedNote.hidden = !hasFixedDefault;
      const matchesDefault =
        choice &&
        defaultChoice &&
        choice.sourceId === defaultChoice.sourceId &&
        choice.iconName === defaultChoice.iconName &&
        (choice.manualRef || null) === (defaultChoice.manualRef || null);
      if (iconCandidateSetDefaultBtn)
        iconCandidateSetDefaultBtn.disabled = matchesDefault;
      if (iconCandidateApplyBtn) iconCandidateApplyBtn.disabled = !choice;
    }
    function renderIconCandidateList() {
      const icon = iconById(activeIconCandidateId);
      if (!icon || !iconCandidateList) return;
      const query = (iconCandidateSearch?.value || "").trim().toLowerCase();
      const sourceId = iconCandidateSourceFilter?.value || "all";
      const rows = (icon.candidates || []).filter((candidate) => {
        if (sourceId !== "all" && candidate.sourceId !== sourceId)
          return false;
        if (!query) return true;
        const haystack = [
          candidate.label,
          candidate.sourceId,
          candidate.iconName,
          candidate.notes || "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.indexOf(query) > -1;
      });
      iconCandidateList.innerHTML = "";
      if (!rows.length) {
        const empty = doc.createElement("div");
        empty.className = "icon-candidate-empty";
        empty.textContent = "No candidates matched this search.";
        iconCandidateList.appendChild(empty);
        return;
      }
      rows.forEach((candidate) => {
        const item = doc.createElement("button");
        item.type = "button";
        item.className =
          "icon-candidate-item" +
          (activeIconCandidateSelection &&
          activeIconCandidateSelection.sourceId === candidate.sourceId &&
          activeIconCandidateSelection.iconName === candidate.iconName
            ? " is-selected"
            : "");
        const preview = doc.createElement("div");
        const previewUrl = iconPreviewUrl(candidate);
        preview.className =
          "icon-preview" +
          (hasChoiceGlyph(candidate) || previewUrl ? "" : " is-placeholder");
        if (hasChoiceGlyph(candidate)) {
          preview.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            candidate.glyph +
            "</svg>";
        } else if (previewUrl) {
          preview.innerHTML =
            '<img src="' +
            previewUrl.replace(/"/g, "&quot;") +
            '" alt="" loading="lazy" referrerpolicy="no-referrer" />';
        } else {
          preview.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            (candidate.glyph || placeholderGlyph()) +
            "</svg>";
        }
        const meta = doc.createElement("div");
        meta.className = "icon-candidate-item-meta";
        meta.innerHTML =
          "<strong>" +
          candidate.label +
          "</strong>" +
          "<code>" +
          candidate.sourceId +
          ":" +
          candidate.iconName +
          "</code>";
        item.appendChild(preview);
        item.appendChild(meta);
        item.addEventListener("click", function () {
          activeIconCandidateSelection = cloneIconChoice(
            Object.assign({ mode: "candidate" }, candidate),
          );
          renderIconCandidateModal();
        });
        iconCandidateList.appendChild(item);
      });
    }
    function renderIconCandidateModal() {
      const icon = iconById(activeIconCandidateId);
      if (!icon) return;
      const defaultChoice = defaultCandidate(icon);
      const hasFixedDefault = Object.prototype.hasOwnProperty.call(
        iconDefaultOverrides,
        icon.id,
      );
      iconCandidateTitle.textContent = "Choose Icon Candidate";
      iconCandidateHint.textContent = icon.alias + " for " + icon.name;
      if (iconCandidateManualInput) {
        iconCandidateManualInput.value =
          activeIconCandidateSelection &&
          activeIconCandidateSelection.mode === "manual"
            ? activeIconCandidateSelection.manualRef || ""
            : "";
      }
      renderIconCandidatePreview(
        activeIconCandidateSelection,
        defaultChoice,
        hasFixedDefault,
      );
      renderIconCandidateList();
    }
    function openIconCandidateDialog(icon) {
      activeIconCandidateId = icon.id;
      activeIconCandidateSelection = cloneIconChoice(
        resolveIconChoice(icon),
      );
      if (iconCandidateSearch) iconCandidateSearch.value = "";
      if (iconCandidateSourceFilter)
        iconCandidateSourceFilter.value = "all";
      renderIconCandidateModal();
      iconCandidateDialog?.showModal();
    }
    function buildIconCategoryFilter() {
      if (!iconCategoryFilter) return;
      const categories = Array.from(
        new Set(iconRegistry.map((i) => i.category)),
      ).sort((a, b) => {
        const aOrder = iconCategoryMeta[a]?.order || 999;
        const bOrder = iconCategoryMeta[b]?.order || 999;
        return aOrder - bOrder || a.localeCompare(b);
      });
      categories.forEach((c) => {
        const opt = doc.createElement("option");
        opt.value = c;
        opt.textContent = iconCategoryMeta[c]?.label || c;
        iconCategoryFilter.appendChild(opt);
      });
    }
    function buildIconSourceFilter() {
      if (!iconSourceFilter) return;
      iconSources.forEach((source) => {
        const opt = doc.createElement("option");
        opt.value = source.id;
        opt.textContent = source.name;
        iconSourceFilter.appendChild(opt);
      });
    }
    function filteredIcons() {
      const q = (iconSearch?.value || "").trim().toLowerCase();
      const status = iconStatusFilter?.value || "all";
      const category = iconCategoryFilter?.value || "all";
      const source = iconSourceFilter?.value || "all";
      return iconRegistry.filter((icon) => {
        const choice = resolveIconChoice(icon);
        if (status !== "all" && icon.status !== status) return false;
        if (category !== "all" && icon.category !== category) return false;
        if (source !== "all" && choice.sourceId !== source) return false;
        if (!q) return true;
        const haystack = [
          icon.id,
          icon.alias,
          icon.name,
          icon.category,
          icon.status,
          choice.label || "",
          choice.sourceId || "",
          ...(icon.apps || []),
          ...(icon.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.indexOf(q) > -1;
      });
    }
    function categoryLabel(category) {
      return iconCategoryMeta[category]?.label || category;
    }
    function categoryDescription(category) {
      return iconCategoryMeta[category]?.description || "";
    }
    function categoryOrder(category) {
      return iconCategoryMeta[category]?.order || 999;
    }
    function iconChoiceReference(choice) {
      return (
        choice.localFile ||
        choice.manualRef ||
        (choice.sourceId && choice.iconName
          ? choice.sourceId + ":" + choice.iconName
          : "-")
      );
    }
    function renderIconChoicePreview(host, choice) {
      if (!host) return;
      const previewUrl = iconPreviewUrl(choice);
      host.className =
        "icon-preview" +
        (hasChoiceGlyph(choice) || previewUrl ? "" : " is-placeholder");
      if (hasChoiceGlyph(choice)) {
        host.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          choice.glyph +
          "</svg>";
      } else if (previewUrl) {
        host.innerHTML =
          '<img src="' +
          previewUrl.replace(/"/g, "&quot;") +
          '" alt="" loading="lazy" referrerpolicy="no-referrer" />';
      } else {
        host.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          ((choice && choice.glyph) || placeholderGlyph()) +
          "</svg>";
      }
    }
    function buildIconCard(icon) {
      const card = doc.createElement("article");
      card.className =
        "ds-card icon-card" +
        (icon.id === selectedIconId ? " is-selected" : "");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute(
        "aria-pressed",
        icon.id === selectedIconId ? "true" : "false",
      );
      const preview = doc.createElement("div");
      preview.className =
        "icon-preview" +
        (icon.status === "placeholder" ? " is-placeholder" : "");
      preview.innerHTML = iconSvgMarkup(icon);
      const head = doc.createElement("div");
      head.className = "icon-card-head";
      head.appendChild(preview);
      const statusLine = doc.createElement("div");
      statusLine.className = "icon-card-statusline";
      const status = doc.createElement("div");
      status.className = "icon-status " + icon.status;
      status.textContent = icon.status;
      statusLine.appendChild(status);
      const topline = doc.createElement("div");
      topline.className = "icon-card-topline";
      const title = doc.createElement("h4");
      title.className = "ds-card-title icon-card-name";
      title.textContent = icon.name;
      topline.appendChild(title);
      head.appendChild(topline);
      const token = doc.createElement("div");
      token.className = "icon-card-token mono";
      token.textContent = icon.alias;
      head.appendChild(token);
      head.appendChild(statusLine);
    
      card.appendChild(head);
      const selectCard = function () {
        selectedIconId = icon.id;
        renderIconGallery();
      };
      card.addEventListener("click", selectCard);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCard();
        }
      });
      return card;
    }
    function renderIconInspector(rows) {
      if (!iconInspectorEmpty || !iconInspectorBody) return;
      const activeIcon =
        rows.find((icon) => icon.id === selectedIconId) || rows[0] || null;
      if (!activeIcon) {
        iconInspectorEmpty.hidden = false;
        iconInspectorBody.hidden = true;
        return;
      }
      selectedIconId = activeIcon.id;
      const choice = resolveIconChoice(activeIcon);
      const defaultChoice = defaultCandidate(activeIcon);
      const hasOverride = Object.prototype.hasOwnProperty.call(
        iconSelectionOverrides,
        activeIcon.id,
      );
      const matchesDefault =
        defaultChoice &&
        choice.sourceId === defaultChoice.sourceId &&
        choice.iconName === defaultChoice.iconName &&
        (choice.manualRef || null) === (defaultChoice.manualRef || null);
      iconInspectorEmpty.hidden = true;
      iconInspectorBody.hidden = false;
      iconInspectorPreview.className =
        "icon-preview" +
        (activeIcon.status === "placeholder" ? " is-placeholder" : "");
      iconInspectorPreview.innerHTML = iconSvgMarkup(activeIcon);
      iconInspectorName.textContent = activeIcon.name;
      iconInspectorStatus.className = "icon-status " + activeIcon.status;
      iconInspectorStatus.textContent = activeIcon.status;
      iconInspectorAlias.textContent = activeIcon.alias;
      iconInspectorSelected.textContent =
        "Selected: " + (choice.label || "No source selected");
      iconInspectorSuggested.textContent =
        "Suggested: " +
        (defaultChoice ? defaultChoice.label : "No default guess");
      iconInspectorFixedNote.hidden = !Object.prototype.hasOwnProperty.call(
        iconDefaultOverrides,
        activeIcon.id,
      );
      renderIconChoicePreview(iconInspectorChoicePreview, choice);
      iconInspectorChoiceLabel.textContent =
        choice.label || "No source selected";
      iconInspectorChoiceRef.textContent = iconChoiceReference(choice);
      iconInspectorBrowseBtn.onclick = function () {
        openIconCandidateDialog(activeIcon);
      };
      iconInspectorUseSuggestedBtn.disabled = !hasOverride;
      iconInspectorUseSuggestedBtn.onclick = function () {
        setIconSelectionToSuggested(activeIcon);
        renderIconGallery();
      };
      iconInspectorSetDefaultBtn.disabled = !!matchesDefault;
      iconInspectorSetDefaultBtn.onclick = function () {
        if (choice.mode === "manual" && choice.manualRef) {
          iconDefaultOverrides[activeIcon.id] = {
            mode: "manual",
            manualRef: choice.manualRef,
          };
        } else if (choice.id) {
          iconDefaultOverrides[activeIcon.id] = {
            mode: "candidate",
            candidateId: choice.id,
          };
        }
        saveIconDefaultOverrides();
        renderIconGallery();
      };
      iconInspectorResetDefaultBtn.disabled =
        !Object.prototype.hasOwnProperty.call(
          iconDefaultOverrides,
          activeIcon.id,
        );
      iconInspectorResetDefaultBtn.onclick = function () {
        delete iconDefaultOverrides[activeIcon.id];
        saveIconDefaultOverrides();
        renderIconGallery();
      };
      iconInspectorExportBtn.textContent =
        activeIcon.status === "ready" ? "Export SVG" : "Export Placeholder";
      iconInspectorExportBtn.onclick = function () {
        downloadIconSvg(activeIcon);
      };
    }
    function renderIconGroupNav(groups) {
      if (!iconGroupNav) return;
      iconGroupNav.innerHTML = "";
      iconGroupNav.hidden = groups.length < 2;
      groups.forEach((group) => {
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "ds-btn ds-btn-sm icon-group-btn";
        btn.innerHTML =
          "<span>" +
          group.label +
          '</span><span class="icon-group-btn-count">' +
          String(group.icons.length) +
          "</span>";
        btn.addEventListener("click", function () {
          document
            .getElementById("icon-group-" + group.key)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        iconGroupNav.appendChild(btn);
      });
    }
    function renderIconGallery() {
      if (!iconGrid || !iconHitlistBody || !iconMeta) return;
      const rows = filteredIcons()
        .slice()
        .sort((a, b) => {
          return (
            categoryOrder(a.category) - categoryOrder(b.category) ||
            categoryLabel(a.category).localeCompare(
              categoryLabel(b.category),
            ) ||
            a.name.localeCompare(b.name)
          );
        });
      iconGrid.innerHTML = "";
      if (iconGroupNav) {
        iconGroupNav.innerHTML = "";
        iconGroupNav.hidden = true;
      }
      if (rows.length && !rows.some((icon) => icon.id === selectedIconId)) {
        selectedIconId = rows[0].id;
      }
      if (!rows.length) selectedIconId = "";
      if (!rows.length) {
        const empty = doc.createElement("article");
        empty.className = "ds-card ds-stack";
        empty.innerHTML =
          '<strong class="ds-card-title">No icons matched these filters</strong>' +
          '<p class="ds-card-subtitle">Try a broader search, or switch category/source filters to audit a different part of the registry.</p>';
        iconGrid.appendChild(empty);
      }
      const groupedRows = rows.reduce((acc, icon) => {
        const key = icon.category || "uncategorized";
        if (!acc[key]) acc[key] = [];
        acc[key].push(icon);
        return acc;
      }, {});
      const groups = Object.keys(groupedRows)
        .sort(
          (a, b) =>
            categoryOrder(a) - categoryOrder(b) ||
            categoryLabel(a).localeCompare(categoryLabel(b)),
        )
        .map((key) => ({
          key,
          label: categoryLabel(key),
          description: categoryDescription(key),
          icons: groupedRows[key],
        }));
      renderIconGroupNav(groups);
      groups.forEach((group) => {
        const section = doc.createElement("section");
        section.className = "icon-section";
        section.id = "icon-group-" + group.key;
        const head = doc.createElement("div");
        head.className = "icon-section-head";
        const kicker = doc.createElement("div");
        kicker.className = "icon-section-kicker";
        const title = doc.createElement("h3");
        title.className = "ds-card-title";
        title.textContent = group.label;
        const count = doc.createElement("span");
        count.className = "icon-section-count mono";
        count.textContent = String(group.icons.length) + " tracked";
        kicker.appendChild(title);
        kicker.appendChild(count);
        head.appendChild(kicker);
        if (group.description) {
          const desc = doc.createElement("p");
          desc.className = "ds-card-subtitle";
          desc.textContent = group.description;
          head.appendChild(desc);
        }
        const groupGrid = doc.createElement("div");
        groupGrid.className = "icon-grid";
        group.icons.forEach((icon) => {
          groupGrid.appendChild(buildIconCard(icon));
        });
        section.appendChild(head);
        section.appendChild(groupGrid);
        iconGrid.appendChild(section);
      });
      renderIconInspector(rows);
      const readyCount = rows.filter((i) => i.status === "ready").length;
      const missingCount = rows.length - readyCount;
      iconMeta.textContent =
        rows.length +
        " icon situations tracked (" +
        readyCount +
        " ready, " +
        missingCount +
        " placeholders, " +
        rows.filter((icon) =>
          Object.prototype.hasOwnProperty.call(
            iconSelectionOverrides,
            icon.id,
          ),
        ).length +
        " overrides).";
      const rankRows = iconRegistry
        .slice()
        .sort((a, b) => iconPriorityScore(b) - iconPriorityScore(a));
      iconHitlistBody.innerHTML = "";
      rankRows.forEach((icon, index) => {
        const choice = resolveIconChoice(icon);
        const tr = doc.createElement("tr");
        tr.innerHTML =
          "<td>" +
          String(index + 1) +
          "</td>" +
          "<td>" +
          icon.name +
          "</td>" +
          "<td>" +
          categoryLabel(icon.category) +
          "</td>" +
          "<td>" +
          icon.status +
          "</td>" +
          "<td>" +
          String(iconPriorityScore(icon)) +
          "</td>" +
          "<td>" +
          (choice.label || "-") +
          "</td>" +
          "<td>" +
          (icon.apps || []).join(", ") +
          "</td>";
        iconHitlistBody.appendChild(tr);
      });
    }
    if (
      iconSearch &&
      iconStatusFilter &&
      iconCategoryFilter &&
      iconSourceFilter
    ) {
      if (!iconRegistry.length) {
        if (iconMeta) {
          iconMeta.textContent =
            "Icon registry is unavailable. Check js/icon-registry.js loading and try reloading the page.";
        }
        return;
      }
      buildIconCategoryFilter();
      buildIconSourceFilter();
      buildIconCandidateSourceFilter();
      [
        iconSearch,
        iconStatusFilter,
        iconCategoryFilter,
        iconSourceFilter,
      ].forEach((el) => el.addEventListener("input", renderIconGallery));
      if (exportIconManifestBtn) {
        exportIconManifestBtn.addEventListener("click", exportIconManifest);
      }
      if (iconCandidateSearch) {
        iconCandidateSearch.addEventListener(
          "input",
          renderIconCandidateList,
        );
      }
      if (iconCandidateSourceFilter) {
        iconCandidateSourceFilter.addEventListener(
          "input",
          renderIconCandidateList,
        );
      }
      if (iconCandidateManualBtn) {
        iconCandidateManualBtn.addEventListener("click", function () {
          const ref = (iconCandidateManualInput?.value || "").trim();
          if (!ref) return;
          const isUrl =
            /^https?:\/\//i.test(ref) &&
            ref.toLowerCase().indexOf(".svg") > -1;
          const isRef = ref.indexOf(":") > -1;
          if (!isUrl && !isRef) return;
          let sourceId = "manual";
          let iconName = "custom";
          if (isUrl) {
            sourceId = "manual-url";
            iconName = ref.split("/").pop() || "custom";
          } else {
            const parts = ref.split(":");
            sourceId = parts[0] || "manual";
            iconName = parts.slice(1).join(":") || "custom";
          }
          activeIconCandidateSelection = {
            mode: "manual",
            sourceId,
            iconName,
            label: iconSourceName(sourceId) + " / " + iconName,
            manualRef: ref,
            previewUrl: isUrl ? ref : "",
          };
          renderIconCandidateModal();
        });
      }
      if (closeIconCandidateBtn) {
        closeIconCandidateBtn.addEventListener("click", function () {
          iconCandidateDialog?.close();
        });
      }
      if (iconCandidateUseSuggestedBtn) {
        iconCandidateUseSuggestedBtn.addEventListener("click", function () {
          const icon = iconById(activeIconCandidateId);
          if (!icon) return;
          activeIconCandidateSelection = cloneIconChoice(
            defaultCandidate(icon),
          );
          renderIconCandidateModal();
        });
      }
      if (iconCandidateApplyBtn) {
        iconCandidateApplyBtn.addEventListener("click", function () {
          commitActiveIconSelection(false);
        });
      }
      if (iconCandidateSetDefaultBtn) {
        iconCandidateSetDefaultBtn.addEventListener("click", function () {
          commitActiveIconSelection(true);
        });
      }
      renderIconGallery();
    }
  }

  win.DesignSystemStudioIcons = {
    initStudioIcons,
  };
})(window, document);

