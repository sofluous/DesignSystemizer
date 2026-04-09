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
      const tokenList = [];
      tokenGroups.forEach(function (group) {
        group.controls.forEach(function (control) {
          tokenList.push(control.token);
        });
      });

      doc.querySelectorAll("#builderGroups .builder-field").forEach(function (
        field,
        index
      ) {
        if (field.dataset.enhanced === "1") return;
        const token = tokenList[index] || "";
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

    function renderBuilderGroupTabs() {
      if (!builderGroupTabs) return;
      builderGroupTabs.innerHTML = "";

      const allBtn = doc.createElement("button");
      allBtn.type = "button";
      allBtn.className = "ds-btn ds-btn-sm";
      allBtn.textContent = "All";
      allBtn.setAttribute(
        "aria-pressed",
        String(builderState.activeGroup === "__all__"),
      );
      allBtn.setAttribute("data-group-key", "__all__");
      allBtn.addEventListener("click", function () {
        builderState.activeGroup = "__all__";
        applyBuilderPresentation();
      });
      builderGroupTabs.appendChild(allBtn);

      const divider = doc.createElement("span");
      divider.className = "builder-tabs-divider";
      divider.setAttribute("aria-hidden", "true");
      builderGroupTabs.appendChild(divider);

      tokenGroups.forEach(function (group) {
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "ds-btn ds-btn-sm";
        btn.textContent = group.name;
        btn.setAttribute("data-group-key", group.name);
        btn.setAttribute(
          "data-owner-key",
          builderGroupOwnerMap[group.name] || "__all__",
        );
        btn.setAttribute(
          "aria-pressed",
          String(group.name === builderState.activeGroup),
        );
        btn.addEventListener("click", function () {
          builderState.activeGroup = group.name;
          applyBuilderPresentation();
        });
        builderGroupTabs.appendChild(btn);
      });
    }

    function renderBuilderPresetTabs() {
      if (!builderPresetTabs) return;
      builderPresetTabs.innerHTML = "";

      builderPresetOwners.forEach(function (owner, index) {
        if (index === 1) {
          const divider = doc.createElement("span");
          divider.className = "builder-tabs-divider";
          divider.setAttribute("aria-hidden", "true");
          builderPresetTabs.appendChild(divider);
        }

        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "ds-btn ds-btn-sm";
        btn.textContent = owner.label;
        btn.setAttribute("data-owner-key", owner.key);
        btn.setAttribute(
          "aria-pressed",
          String(owner.key === builderState.activeOwner),
        );
        btn.addEventListener("click", function () {
          builderState.activeOwner = owner.key;
          if (
            owner.key !== "__all__" &&
            builderState.activeGroup !== "__all__" &&
            (builderGroupOwnerMap[builderState.activeGroup] || "__all__") !==
              owner.key
          ) {
            builderState.activeGroup = "__all__";
          }
          applyBuilderPresentation();
        });
        builderPresetTabs.appendChild(btn);
      });
    }

    function applyBuilderPresentation() {
      const grouped = builderState.activeGroup !== "__all__";
      const ownerFiltered = builderState.activeOwner !== "__all__";
      const searching = builderState.searchQuery.trim().length > 0;

      doc.querySelectorAll("#builderGroups .builder-group").forEach(function (
        card
      ) {
        const groupName = card.getAttribute("data-group-name");
        const ownerKey = card.getAttribute("data-group-owner") || "__all__";
        const groupFiltered =
          grouped && groupName !== builderState.activeGroup;
        const ownerMismatch =
          ownerFiltered && ownerKey !== builderState.activeOwner;

        if (groupFiltered || ownerMismatch) {
          card.hidden = true;
          return;
        }

        let cardHasVisibleField = false;
        card.querySelectorAll(".builder-section").forEach(function (
          section,
          index
        ) {
          let sectionHasVisibleField = false;
          section.querySelectorAll(".builder-field").forEach(function (field) {
            const haystack = (field.dataset.searchText || "").toLowerCase();
            const match =
              !searching || haystack.indexOf(builderState.searchQuery) > -1;
            field.hidden = !match;
            if (match) {
              sectionHasVisibleField = true;
              cardHasVisibleField = true;
            }
          });

          section.hidden = !sectionHasVisibleField;
          if (searching) {
            section.open = sectionHasVisibleField;
          } else if (sectionHasVisibleField && index === 0) {
            section.open = true;
          }
        });

        card.hidden = !cardHasVisibleField;
      });

      const sections = doc.querySelectorAll(".preview-section");
      let anyVisible = false;
      sections.forEach(function (section) {
        if (!grouped && !searching) {
          section.hidden = false;
          anyVisible = true;
          return;
        }
        const groups = (section.getAttribute("data-preview-groups") || "")
          .split(",")
          .map(function (value) {
            return value.trim();
          });
        const match = searching
          ? true
          : groups.indexOf(builderState.activeGroup) > -1;
        section.hidden = !match;
        if (match) {
          anyVisible = true;
          if ("open" in section) section.open = true;
        }
      });

      if (!anyVisible && sections.length > 0) {
        sections[0].hidden = false;
      }

      if (builderGroupTabs) {
        builderGroupTabs
          .querySelectorAll("button[data-group-key]")
          .forEach(function (btn) {
            btn.setAttribute(
              "aria-pressed",
              String(
                btn.getAttribute("data-group-key") ===
                  builderState.activeGroup,
              ),
            );
          });
        builderGroupTabs
          .querySelectorAll("button[data-owner-key]")
          .forEach(function (btn) {
            const ownerKey = btn.getAttribute("data-owner-key") || "__all__";
            btn.hidden =
              ownerFiltered &&
              ownerKey !== "__all__" &&
              ownerKey !== builderState.activeOwner;
          });
      }

      if (builderPresetTabs) {
        builderPresetTabs
          .querySelectorAll("button[data-owner-key]")
          .forEach(function (btn) {
            btn.setAttribute(
              "aria-pressed",
              String(
                btn.getAttribute("data-owner-key") ===
                  builderState.activeOwner,
              ),
            );
          });
      }

      if (builderPreviewHint) {
        builderPreviewHint.textContent = searching
          ? 'Showing token matches for "' + builderState.searchQuery + '".'
          : grouped
            ? "Editing " + builderState.activeGroup + " tokens."
            : builderState.activeOwner !== "__all__"
              ? "Showing groups owned by " +
                (builderPresetOwners.find(function (owner) {
                  return owner.key === builderState.activeOwner;
                })?.label || "Selected preset owner") +
                "."
              : "Edit tokens by preset owner, then fine-tune the matching groups.";
      }
    }

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
