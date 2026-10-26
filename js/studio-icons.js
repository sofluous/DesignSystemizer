;(function (win, doc) {
  function initStudioIcons() {
    const studioPackagingApi = win.DesignSystemStudioPackaging || null;
    const iconSources = Array.isArray(win.DesignSystemIconSources)
      ? win.DesignSystemIconSources.slice()
      : [];
    const iconRegistry = Array.isArray(win.DesignSystemIconRegistry)
      ? JSON.parse(JSON.stringify(win.DesignSystemIconRegistry))
      : [];
    const assets = win.DesignSystemStudioIconAssets;
    let approvedIcons = win.DesignSystemApprovedIcons?.icons || {};
    const iconStateStorageKey = "ds-icon-state";
    let storageMessage = "";
    let storageBlocked = false;
    const iconSelectionStorageKey = "ds-icon-selection-overrides";
    const iconDefaultStorageKey = "ds-icon-default-overrides";
    const iconSearch = doc.getElementById("iconSearch");
    const iconStatusFilter = doc.getElementById("iconStatusFilter");
    const iconCategoryFilter =
      doc.getElementById("iconCategoryFilter");
    const iconSourceFilter = doc.getElementById("iconSourceFilter");
    const iconGrid = doc.getElementById("iconGrid");
    const iconMeta = doc.getElementById("iconMeta");
    const iconHitlistBody = doc.getElementById("iconHitlistBody");
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
    const iconInspectorBrowseBtn = doc.getElementById(
      "iconInspectorBrowseBtn",
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
    const iconCandidateManualInput = doc.getElementById(
      "iconCandidateManualInput",
    );
    const iconCandidateManualBtn = doc.getElementById(
      "iconCandidateManualBtn",
    );
    const closeIconCandidateBtn = doc.getElementById(
      "closeIconCandidateBtn",
    );
    const iconCandidateApplyBtn = doc.getElementById(
      "iconCandidateApplyBtn",
    );
    const storedState = loadIconState();
    let iconSelectionOverrides = storedState.selection;
    const iconActionStatus = doc.getElementById("iconActionStatus");
    const candidateState = doc.getElementById("iconCandidateSelectionState");
    const candidateCount = doc.getElementById("iconCandidateCount");
    const selectedHidden = doc.getElementById("iconSelectedHidden");
    let exporting = false;
    let stage = "inspect";
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
    function validateSavedChoices(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid saved icon choices.");
      const valid = Object.create(null);
      for (const [id, choice] of Object.entries(value)) {
        const icon = iconRegistry.find((item) => item.id === id);
        if (!icon || !choice || typeof choice !== "object") continue;
        if (choice.mode === "candidate" && icon.candidates.some((item) => item.id === choice.candidateId)) valid[id] = { mode: "candidate", candidateId: choice.candidateId };
        else if (choice.mode === "manual") {
          try { assets.parseReference(choice.manualRef); valid[id] = { mode: "manual", manualRef: choice.manualRef }; }
          catch (_) { storageMessage = "Some saved icon references are invalid and were not applied."; }
        }
      }
      return valid;
    }
    function loadIconState() {
      try {
        const raw = win.localStorage.getItem(iconStateStorageKey);
        if (raw) {
          const state = JSON.parse(raw);
          if (!state || ![1, 2].includes(state.version)) throw new Error("Unsupported saved icon state.");
          return { selection: { ...(state.version === 1 ? validateSavedChoices(state.defaults) : {}), ...validateSavedChoices(state.selection) } };
        }
        return { selection: { ...validateSavedChoices(JSON.parse(win.localStorage.getItem(iconDefaultStorageKey) || "{}")),
          ...validateSavedChoices(JSON.parse(win.localStorage.getItem(iconSelectionStorageKey) || "{}")) } };
      } catch (error) {
        storageBlocked = true;
        storageMessage = "Saved icon choices could not be read. The stored copy is untouched. Export the manifest to keep session changes.";
        return { selection: {} };
      }
    }
    function persistIconState() {
      try {
        if (storageBlocked) throw new Error("Saving is paused to preserve unreadable browser data.");
        win.localStorage.setItem(iconStateStorageKey, JSON.stringify({ version: 2, selection: iconSelectionOverrides }));
        storageMessage = "";
      } catch (error) {
        storageMessage = "Applied for this session; browser saving is unavailable. Export the manifest to keep your choices. " + error.message;
      }
      announce("Icon choices updated.");
    }
    function announce(message) {
      if (!iconActionStatus) return;
      iconActionStatus.textContent = message + (storageMessage ? " " + storageMessage : "");
      iconActionStatus.classList.toggle("studio-sr-only", !storageMessage && !/not downloaded|unavailable|could not|failed/i.test(message));
    }
    function escapeHtml(value) { const node = doc.createElement("span"); node.textContent = value; return node.innerHTML; }
    function iconPriorityScore(icon) {
      const gap = selectionState(icon) === "Saved" ? 0.6 : 2;
      return Math.round(icon.frequency * icon.utility * gap * 10) / 10;
    }
    function iconById(iconId) {
      return iconRegistry.find((icon) => icon.id === iconId) || null;
    }
    function iconSourceName(sourceId) {
      if (sourceId === "manual-url") return "Custom SVG";
      const source = iconSources.find((item) => item.id === sourceId);
      return source ? source.name : sourceId;
    }
    function approvedChoice(icon) {
      const approved = approvedIcons[icon.alias];
      if (!approved) return null;
      return { mode: "approved", sourceId: approved.source.library, iconName: approved.source.name,
        label: iconSourceName(approved.source.library) + " / " + approved.source.name,
        localFile: "./icons/" + approved.file, svg: approved.svg, source: approved.source };
    }
    function defaultCandidate(icon) {
      return approvedChoice(icon) || (icon.candidates || []).find((candidate) => candidate.id === icon.defaultCandidateId) || (icon.candidates || [])[0] || null;
    }
    function resolveIconChoice(icon) {
      const override = iconSelectionOverrides[icon.id];
      let choice;
      if (override?.mode === "manual") choice = assets.parseReference(override.manualRef);
      if (override?.mode === "candidate") choice = (icon.candidates || []).find((candidate) => candidate.id === override.candidateId);
      const approved = approvedChoice(icon);
      if (approved && (!choice || assets.same(choice, approved) || (approved.source.url && assets.urlFor(choice) === approved.source.url))) return approved;
      return choice ? { mode: "candidate", ...choice } : defaultCandidate(icon);
    }
    function selectionState(icon) {
      const choice = resolveIconChoice(icon);
      if (!choice) return "Missing";
      if (choice.mode === "approved") return "Saved";
      return Object.hasOwn(iconSelectionOverrides, icon.id) ? "Draft" : "Recommended";
    }
    function sourceLabel(choice) {
      return choice ? iconSourceName(choice.sourceId) + " / " + choice.iconName : "No source";
    }
    function cloneIconChoice(choice) {
      return choice ? JSON.parse(JSON.stringify(choice)) : null;
    }
    async function downloadIconSvg(icon) {
      const choice = cloneIconChoice(resolveIconChoice(icon));
      if (!choice) return;
      exporting = true;
      iconInspectorExportBtn.disabled = true;
      announce("Downloading " + choice.label + "...");
      try {
        const svg = await assets.svgFor(choice, icon.name);
        studioPackagingApi.downloadBlob(icon.id + ".svg", new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
        announce("Downloaded " + choice.label + ".");
      } catch (error) {
        announce("SVG was not downloaded. " + error.message + " Preview and download availability can differ when a remote source blocks requests.");
      } finally { exporting = false; renderIconInspector(filteredIcons()); }
    }
    function commitActiveIconSelection() {
      const icon = iconById(activeIconCandidateId);
      const choice = activeIconCandidateSelection;
      if (!icon || !choice) return;
      if (choice.mode === "approved") delete iconSelectionOverrides[icon.id];
      else if (choice.mode === "manual") iconSelectionOverrides[icon.id] = { mode: "manual", manualRef: choice.manualRef };
      else if (choice.id) {
        if ((icon.candidates || []).some(candidate => candidate.id === choice.id)) iconSelectionOverrides[icon.id] = { mode: "candidate", candidateId: choice.id };
        else iconSelectionOverrides[icon.id] = { mode: "manual", manualRef: choice.sourceId + ":" + choice.iconName };
      }
      persistIconState();
      renderIconGallery();
      setStage("inspect");
      announce(selectionState(icon) === "Draft" ? "Assignment changed. Unsaved changes." : "Assignment restored.");
      showView("properties");
      iconInspectorBrowseBtn.focus();
    }
    function exportIconManifest() {
      const manifest = {
        generatedAt: new Date().toISOString(),
        version: "0.3",
        purpose: "icon-workspace",
        sources: iconSources.map((source) => ({
          id: source.id,
          name: source.name,
          license: source.license,
          site: source.site,
        })),
        icons: iconRegistry.map((icon) => {
          const choice = resolveIconChoice(icon) || {};
          const defaultChoice = defaultCandidate(icon);
          return {
            id: icon.id,
            alias: icon.alias,
            name: icon.name,
            category: icon.category,
            status: selectionState(icon),
            defaultCandidateId: defaultChoice?.id || null,
            registryDefaultCandidateId: icon.defaultCandidateId || null,
            selected: {
              mode: choice.mode,
              candidateId: choice.id || null,
              previewUrl: assets.urlFor(choice) || null,
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
    function renderIconCandidatePreview(choice) {
      assets.render(iconInspectorPreview, choice);
      doc.getElementById("iconInspectorSource").textContent = sourceLabel(choice);
      const matchesApplied = assets.same(choice, resolveIconChoice(iconById(activeIconCandidateId)));
      iconCandidateApplyBtn.disabled = !choice || matchesApplied;
      candidateState.textContent = matchesApplied ? "Current assignment" : choice ? "Preview (not assigned)" : "Choose an icon";
    }
    function renderIconCandidateList() {
      const icon = iconById(activeIconCandidateId);
      if (!icon || !iconCandidateList) return;
      const query = (iconCandidateSearch?.value || "").trim().toLowerCase();
      const sourceId = iconCandidateSourceFilter?.value || "all";
      const seen = new Set();
      const candidates = [...(icon.candidates || []), ...iconRegistry.flatMap(item => item.candidates || [])].filter(candidate => {
        const key = candidate.sourceId + ":" + candidate.iconName;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
      const saved = approvedChoice(icon);
      if (saved && !candidates.some((candidate) => assets.same(candidate, saved))) candidates.unshift({ ...saved, id: "saved-" + icon.id });
      const rows = candidates.filter((candidate) => {
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
      const focusedId = doc.activeElement?.closest(".icon-candidate-item")?.dataset.candidateId;
      iconCandidateList.innerHTML = "";
      candidateCount.textContent = rows.length + " icons";
      const selectedVisible = rows.some((candidate) => assets.same(candidate, activeIconCandidateSelection));
      if (!selectedVisible && activeIconCandidateSelection) candidateCount.textContent += " (preview filtered out)";
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
          (assets.same(candidate, activeIconCandidateSelection)
            ? " is-selected"
            : "");
        item.dataset.candidateId = candidate.id;
        item.setAttribute("aria-pressed", String(assets.same(candidate, activeIconCandidateSelection)));
        const preview = doc.createElement("div");
        assets.render(preview, candidate, true);
        const meta = doc.createElement("div");
        meta.className = "icon-candidate-item-meta";
        const label = doc.createElement("strong"); label.textContent = iconSourceName(candidate.sourceId);
        const ref = doc.createElement("code"); ref.textContent = candidate.iconName;
        meta.append(label, ref);
        item.appendChild(preview);
        item.appendChild(meta);
        item.addEventListener("click", function () {
          activeIconCandidateSelection = cloneIconChoice(
            Object.assign({ mode: "candidate" }, candidate),
          );
          renderIconCandidateModal();
          showView("properties");
          if (win.matchMedia("(max-width: 980px)").matches && !iconCandidateApplyBtn.disabled) iconCandidateApplyBtn.focus();
        });
        iconCandidateList.appendChild(item);
        if (candidate.id === focusedId) item.focus();
      });
    }
    function renderIconCandidateModal() {
      const icon = iconById(activeIconCandidateId);
      if (!icon) return;
      iconCandidateTitle.textContent = "Choose artwork for " + icon.alias;
      iconCandidateHint.textContent = icon.alias;
      if (iconCandidateManualInput) {
        iconCandidateManualInput.value =
          activeIconCandidateSelection &&
          activeIconCandidateSelection.mode === "manual"
            ? activeIconCandidateSelection.manualRef || ""
            : "";
      }
      renderIconCandidatePreview(activeIconCandidateSelection);
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
      setStage("replace");
      showView("canvas");
      iconCandidateSearch?.focus();
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
      const custom = doc.createElement("option");
      custom.value = "manual-url";
      custom.textContent = "Custom SVG URL";
      iconSourceFilter.appendChild(custom);
    }
    function filteredIcons() {
      const q = (iconSearch?.value || "").trim().toLowerCase();
      const status = iconStatusFilter?.value || "all";
      const category = iconCategoryFilter?.value || "all";
      const source = iconSourceFilter?.value || "all";
      return iconRegistry.filter((icon) => {
        const choice = resolveIconChoice(icon);
        if (status !== "all" && selectionState(icon).toLowerCase() !== status) return false;
        if (category !== "all" && icon.category !== category) return false;
        if (source !== "all" && choice?.sourceId !== source) return false;
        if (!q) return true;
        const haystack = [
          icon.id,
          icon.alias,
          icon.name,
          icon.category,
          selectionState(icon),
          choice?.label || "",
          choice?.sourceId || "",
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
    function showView(view) {
      doc.getElementById("panel-icons").dataset.view = view;
      for (const button of doc.querySelectorAll("[data-icon-view]")) button.setAttribute("aria-pressed", String(button.dataset.iconView === view));
    }
    function setStage(next) {
      stage = next;
      iconCandidateDialog.hidden = next !== "replace";
      doc.getElementById("iconSheetCanvas").hidden = next === "replace";
      doc.querySelector(".icon-priority-details").hidden = next === "replace";
      doc.getElementById("iconCandidateDetails").hidden = next !== "replace";
      doc.getElementById("iconRecordActions").hidden = next !== "inspect";
      doc.getElementById("iconInspectorProvenance").hidden = next !== "inspect";
      doc.getElementById("iconMoreActions").hidden = next !== "inspect";
      doc.getElementById("iconApprovalDialog").hidden = next !== "review";
      iconInspectorBody.hidden = next === "review";
      if (next === "inspect") renderIconInspector(filteredIcons());
    }
    function renderLibrary(rows) {
      const host = doc.getElementById("iconLibraryList");
      const focusedId = doc.activeElement?.dataset.iconToken;
      const expanded = new Set([...host.querySelectorAll("details[open]")].map(group => group.dataset.category));
      const initialized = host.childElementCount > 0;
      host.replaceChildren();
      for (const category of [...new Set(rows.map(icon => icon.category))]) {
        const group = doc.createElement("details"); group.dataset.category = category;
        group.open = !initialized || expanded.has(category);
        const summary = doc.createElement("summary"); summary.textContent = categoryLabel(category);
        group.append(summary);
        for (const icon of rows.filter(item => item.category === category)) {
          const button = doc.createElement("button"); button.type = "button"; button.className = "icon-library-item";
          button.dataset.iconToken = icon.id; button.setAttribute("aria-pressed", String(selectedIconId === icon.id));
          const label = doc.createElement("span"); label.textContent = icon.name;
          const token = doc.createElement("code"); token.textContent = icon.alias;
          button.append(label, token);
          button.addEventListener("click", () => {
            if (!selectIcon(icon.id, false)) return; showView("canvas");
            iconGrid.querySelector('[data-icon-id="' + icon.id + '"]')?.scrollIntoView({ block: "nearest" });
          });
          group.append(button); if (focusedId === icon.id) button.focus();
        }
        host.append(group);
      }
    }
    function selectIcon(iconId, focus) {
      if (win.DesignSystemStudioIconApproval.isBusy()) return false;
      win.DesignSystemStudioIconApproval.remember();
      setStage("inspect");
      if (selectedIconId !== iconId) {
        doc.getElementById("iconMoreActions").open = false;
        doc.getElementById("iconInspectorProvenance").open = false;
      }
      selectedIconId = iconId;
      for (const card of iconGrid.querySelectorAll(".icon-card")) {
        const selected = card.dataset.iconId === iconId;
        card.classList.toggle("is-selected", selected);
        card.setAttribute("aria-pressed", String(selected));
        card.tabIndex = selected ? 0 : -1;
        if (selected && focus) card.focus();
      }
      for (const button of doc.querySelectorAll("[data-icon-token]")) button.setAttribute("aria-pressed", String(button.dataset.iconToken === iconId));
      const selectedItem = doc.querySelector('[data-icon-token="' + iconId + '"]');
      if (selectedItem) {
        selectedItem.closest("details").open = true;
        selectedItem.scrollIntoView({ block: "nearest" });
      }
      renderIconInspector(filteredIcons());
      return true;
    }
    function buildIconCard(icon) {
      const card = doc.createElement("article");
      card.className =
        "ds-card icon-card" +
        (icon.id === selectedIconId ? " is-selected" : "");
      card.dataset.iconId = icon.id;
      card.tabIndex = icon.id === selectedIconId ? 0 : -1;
      card.setAttribute("aria-label", icon.name + ", " + icon.alias + ", " + selectionState(icon));
      card.setAttribute("role", "button");
      card.setAttribute(
        "aria-pressed",
        icon.id === selectedIconId ? "true" : "false",
      );
      const preview = doc.createElement("div");
      assets.render(preview, resolveIconChoice(icon), true);
      const head = doc.createElement("div");
      head.className = "icon-card-head";
      head.appendChild(preview);
      const statusLine = doc.createElement("div");
      statusLine.className = "icon-card-statusline";
      const status = doc.createElement("div");
      status.className = "icon-status is-" + selectionState(icon).toLowerCase();
      status.textContent = selectionState(icon);
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
      topline.appendChild(statusLine);
      const source = doc.createElement("div");
      source.className = "icon-card-source";
      source.textContent = sourceLabel(resolveIconChoice(icon));
      head.appendChild(source);
    
      card.appendChild(head);
      const selectCard = function () {
        if (!selectIcon(icon.id, false)) return; showView("properties");
      };
      card.addEventListener("click", selectCard);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCard();
        } else {
          const cards = Array.from(iconGrid.querySelectorAll(".icon-card"));
          const index = cards.indexOf(card);
          const columns = getComputedStyle(card.parentElement).gridTemplateColumns.split(" ").length;
          const next = { ArrowRight: index + 1, ArrowLeft: index - 1, ArrowDown: index + columns, ArrowUp: index - columns, Home: 0, End: cards.length - 1 }[event.key];
          if (next !== undefined) { event.preventDefault(); selectIcon(cards[Math.max(0, Math.min(cards.length - 1, next))].dataset.iconId, true); }
        }
      });
      return card;
    }
    function renderIconInspector(rows) {
      if (!iconInspectorEmpty || !iconInspectorBody) return;
      const activeIcon = iconById(selectedIconId);
      if (!activeIcon) {
        iconInspectorEmpty.hidden = false;
        iconInspectorBody.hidden = true;
        return;
      }
      selectedIconId = activeIcon.id;
      const choice = resolveIconChoice(activeIcon);
      const state = selectionState(activeIcon);
      iconInspectorEmpty.hidden = true;
      iconInspectorBody.hidden = stage === "review";
      if (stage !== "replace") assets.render(iconInspectorPreview, choice);
      iconInspectorName.textContent = activeIcon.name;
      iconInspectorStatus.className = "icon-status is-" + state.toLowerCase();
      iconInspectorStatus.textContent = state;
      iconInspectorAlias.textContent = activeIcon.alias;
      doc.getElementById("iconInspectorSource").textContent = sourceLabel(choice);
      const approved = approvedIcons[activeIcon.alias];
      const source = choice?.source;
      doc.getElementById("iconInspectorDetails").textContent = [
        activeIcon.notes || "", "Source: " + (source?.url || (choice && assets.reference(choice)) || "None"),
        "Revision: " + (source?.revision || "Not recorded"), "License: " + (source?.license || iconSources.find((item) => item.id === choice?.sourceId)?.license || "Not recorded"),
        ...(source?.licenseText ? [source.licenseText] : []),
        ...(state === "Draft" && approved ? ["Saved source: " + approved.source.library + " / " + approved.source.name] : []),
        "Used by: " + ((activeIcon.apps || []).join(", ") || "Not recorded")
      ].join("\n\n");
      iconInspectorBrowseBtn.onclick = () => openIconCandidateDialog(activeIcon);
      const save = doc.getElementById("iconPrepareApprovalBtn");
      save.disabled = state === "Saved";
      save.textContent = win.DesignSystemStudioIconApproval.connected() ? "Save changes" : "Export changes";
      save.title = state === "Saved" ? "Already saved to the icon sheet" : "Prepare this selection for the shared icon sheet";
      save.onclick = () => win.DesignSystemStudioIconApproval.open(activeIcon, choice);
      const revert = doc.getElementById("iconRevertBtn");
      revert.hidden = state !== "Draft";
      revert.onclick = () => {
        delete iconSelectionOverrides[activeIcon.id];
        persistIconState(); renderIconGallery();
        doc.getElementById("iconMoreActions").open = false;
        iconInspectorBrowseBtn.focus();
      };
      iconInspectorExportBtn.textContent = exporting ? "Downloading..." : "Download SVG";
      iconInspectorExportBtn.disabled = exporting || !choice || (!assets.hasGlyph(choice) && !assets.urlFor(choice));
      iconInspectorExportBtn.onclick = () => downloadIconSvg(activeIcon);
      selectedHidden.hidden = rows.some((icon) => icon.id === activeIcon.id);
      if (stage === "replace") renderIconCandidatePreview(activeIconCandidateSelection);
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
      if (rows.length && !selectedIconId) {
        selectedIconId = rows[0].id;
      }

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
      const firstVisible = iconGrid.querySelector(".icon-card");
      if (firstVisible && !iconGrid.querySelector('.icon-card[tabindex="0"]')) firstVisible.tabIndex = 0;
      renderIconInspector(rows);
      renderLibrary(rows);
      iconMeta.textContent =
        rows.length +
        " icons / " +
        rows.filter((icon) => selectionState(icon) === "Saved").length +
        " saved / " +
        rows.filter((icon) => selectionState(icon) === "Draft").length +
        " drafts";
      const rankRows = iconRegistry
        .slice()
        .sort((a, b) => iconPriorityScore(b) - iconPriorityScore(a));
      iconHitlistBody.innerHTML = "";
      rankRows.forEach((icon, index) => {
        const choice = resolveIconChoice(icon) || {};
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
          selectionState(icon) +
          "</td>" +
          "<td>" +
          String(iconPriorityScore(icon)) +
          "</td>" +
          "<td>" +
          escapeHtml(choice.label || "-") +
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
          try {
            activeIconCandidateSelection = assets.parseReference(iconCandidateManualInput.value);
            iconCandidateManualInput.setCustomValidity("");
          } catch (error) {
            iconCandidateManualInput.setCustomValidity(error.message);
            iconCandidateManualInput.reportValidity();
            candidateState.textContent = error.message;
            return;
          }
          renderIconCandidateModal();
        });
      }
      if (closeIconCandidateBtn) {
        closeIconCandidateBtn.addEventListener("click", function () {
          setStage("inspect"); showView("canvas");
          iconGrid.querySelector('[data-icon-id="' + selectedIconId + '"]')?.focus();
        });
      }
      iconCandidateApplyBtn.addEventListener("click", commitActiveIconSelection);
      doc.getElementById("iconCandidateUploadBtn").addEventListener("click", () => {
        const icon = iconById(activeIconCandidateId);
        if (!icon) return;
        win.DesignSystemStudioIconApproval.open(icon, resolveIconChoice(icon));
        doc.getElementById("iconApprovalFile").focus();
      });
      doc.getElementById("iconClearFiltersBtn").addEventListener("click", () => {
        iconSearch.value = ""; iconStatusFilter.value = iconCategoryFilter.value = iconSourceFilter.value = "all";
        renderIconGallery(); iconSearch.focus();
      });
      doc.getElementById("iconShowSelectedBtn").addEventListener("click", () => {
        iconSearch.value = ""; iconStatusFilter.value = iconCategoryFilter.value = iconSourceFilter.value = "all";
        renderIconGallery(); selectIcon(selectedIconId, true);
      });
      doc.getElementById("iconCandidateClearFiltersBtn").addEventListener("click", () => {
        iconCandidateSearch.value = ""; iconCandidateSourceFilter.value = "all"; renderIconCandidateList(); iconCandidateSearch.focus();
      });
      doc.addEventListener("icon:review", () => { setStage("review"); showView("properties"); });
      doc.addEventListener("icon:reviewclose", () => { setStage("inspect"); showView("properties"); });
      doc.addEventListener("icon:busy", event => {
        doc.getElementById("iconProperties").setAttribute("aria-busy", String(event.detail.busy));
        for (const button of doc.querySelectorAll("[data-icon-token]")) button.disabled = event.detail.busy;
        for (const card of iconGrid.querySelectorAll(".icon-card")) card.setAttribute("aria-disabled", String(event.detail.busy));
      });
      doc.addEventListener("icon:project", () => renderIconInspector(filteredIcons()));
      doc.addEventListener("icon:projecterror", event => announce(event.detail.message));
      doc.addEventListener("icon:saved", event => {
        const { manifest } = event.detail;
        approvedIcons = Object.fromEntries(manifest.icons.map(entry => [entry.alias, entry]));
        win.DesignSystemApprovedIcons = { version: manifest.version, icons: approvedIcons };
        const icon = iconRegistry.find(item => item.alias === event.detail.alias);
        if (icon) delete iconSelectionOverrides[icon.id];
        persistIconState(); setStage("inspect"); renderIconGallery();
      });
      for (const button of doc.querySelectorAll("[data-icon-view]")) button.addEventListener("click", () => showView(button.dataset.iconView));
      const library = doc.querySelector('[data-context-panel="icons"]');
      const originalParent = library.parentNode; const originalNext = library.nextSibling;
      const media = win.matchMedia("(max-width: 980px)");
      const placeLibrary = () => {
        doc.getElementById("iconMobileLibrary").hidden = !media.matches;
        if (media.matches) doc.getElementById("iconMobileLibrary").append(library);
        else originalParent.insertBefore(library, originalNext);
      };
      media.addEventListener("change", placeLibrary); placeLibrary(); showView("canvas");
      renderIconGallery();
      if (storageMessage) announce(storageMessage);
    }
  }

  win.DesignSystemStudioIcons = {
    initStudioIcons,
  };
})(window, document);

