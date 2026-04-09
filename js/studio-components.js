(function (win, doc) {
  let initializedComponentsApi = null;

  function initStudioComponents(opts) {
    if (initializedComponentsApi) return initializedComponentsApi;

    const componentFilterTabs = doc.getElementById("componentFilterTabs");
    const componentFilterHint = doc.getElementById("componentFilterHint");
    const componentStageNav = doc.getElementById("componentStageNav");
    const componentWorkspaceMain = doc.querySelector(
      "#panel-components .studio-workspace-main",
    );

    if (!componentFilterTabs || !componentStageNav) {
      initializedComponentsApi = {};
      return initializedComponentsApi;
    }

    const componentCategories =
      (opts && opts.componentCategories) ||
      [
        { key: "__all__", label: "All" },
        { key: "Actions", label: "Actions" },
        { key: "Inputs", label: "Inputs" },
        { key: "Navigation", label: "Navigation" },
        { key: "Data", label: "Data" },
        { key: "Feedback", label: "Feedback" },
        { key: "Layout", label: "Layout" },
        { key: "Custom", label: "Custom" },
        { key: "Overlays", label: "Overlays" },
      ];
    const componentStageDefinitions =
      (opts && opts.componentStageDefinitions) ||
      [
        { key: "atoms", label: "Atoms", id: "componentStageAtoms" },
        { key: "chrome", label: "Chrome", id: "componentStageChrome" },
        { key: "flows", label: "Flows", id: "componentStageFlows" },
        {
          key: "specialized",
          label: "Specialized",
          id: "componentStageSpecialized",
        },
        { key: "data", label: "Data Views", id: "componentStageData" },
      ];
    const componentFilterState = {
      activeGroup: "__all__",
      activeStage: null,
    };

    function renderComponentFilterTabs() {
      componentFilterTabs.innerHTML = "";
      componentCategories.forEach(function (category, index) {
        if (index === 1) {
          const divider = doc.createElement("span");
          divider.className = "builder-tabs-divider";
          divider.setAttribute("aria-hidden", "true");
          componentFilterTabs.appendChild(divider);
        }
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "ds-btn ds-btn-sm";
        btn.textContent = category.label;
        btn.setAttribute("data-component-group", category.key);
        btn.setAttribute(
          "aria-pressed",
          String(category.key === componentFilterState.activeGroup),
        );
        btn.addEventListener("click", function () {
          componentFilterState.activeGroup = category.key;
          applyComponentFilter();
        });
        componentFilterTabs.appendChild(btn);
      });
    }

    function renderComponentStageNav() {
      componentStageNav.innerHTML = "";
      componentStageDefinitions.forEach(function (stage, index) {
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "ds-btn ds-btn-sm component-stage-link";
        btn.setAttribute("data-component-stage-link", stage.key);
        btn.setAttribute("aria-current", "false");

        const label = doc.createElement("span");
        label.textContent = String(index + 1) + ". " + stage.label;
        const count = doc.createElement("span");
        count.className = "component-stage-count";
        count.textContent = "0";

        btn.appendChild(label);
        btn.appendChild(count);
        btn.addEventListener("click", function () {
          const target = doc.getElementById(stage.id);
          if (!target || target.hidden) return;
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        componentStageNav.appendChild(btn);
      });
    }

    function getCurrentComponentStageKey() {
      if (!componentWorkspaceMain) return null;
      const containerRect = componentWorkspaceMain.getBoundingClientRect();
      let bestMatch = null;

      componentStageDefinitions.forEach(function (stage) {
        const section = doc.getElementById(stage.id);
        if (!section || section.hidden) return;
        const visibleCount = section.querySelectorAll(
          ".component-block:not([hidden])",
        ).length;
        if (visibleCount === 0) return;
        const rect = section.getBoundingClientRect();
        const intersects =
          rect.bottom > containerRect.top + 24 &&
          rect.top < containerRect.bottom - 24;
        if (!intersects) return;
        const distance = Math.abs(rect.top - containerRect.top - 12);
        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = { key: stage.key, distance: distance };
        }
      });

      return bestMatch ? bestMatch.key : null;
    }

    function syncComponentStageNavCurrent() {
      const activeStageKey = getCurrentComponentStageKey();
      componentFilterState.activeStage = activeStageKey;
      componentStageNav
        .querySelectorAll("[data-component-stage-link]")
        .forEach(function (btn) {
          btn.setAttribute(
            "aria-current",
            String(
              btn.getAttribute("data-component-stage-link") === activeStageKey,
            ),
          );
        });
    }

    function updateComponentStageNav() {
      componentStageDefinitions.forEach(function (stage) {
        const section = doc.getElementById(stage.id);
        const btn = componentStageNav.querySelector(
          '[data-component-stage-link="' + stage.key + '"]',
        );
        if (!section || !btn) return;
        const count = section.querySelectorAll(
          ".component-block:not([hidden])",
        ).length;
        const countNode = btn.querySelector(".component-stage-count");
        if (countNode) countNode.textContent = String(count);
        btn.disabled = count === 0;
        if (count === 0 || section.hidden) {
          btn.setAttribute("aria-current", "false");
        }
      });
      syncComponentStageNavCurrent();
    }

    function applyComponentFilter() {
      const grouped = componentFilterState.activeGroup !== "__all__";

      doc.querySelectorAll(".component-block").forEach(function (block) {
        if (!grouped) {
          block.hidden = false;
          return;
        }
        const groups = (block.getAttribute("data-component-groups") || "")
          .split(",")
          .map(function (value) {
            return value.trim();
          })
          .filter(Boolean);
        block.hidden =
          groups.indexOf(componentFilterState.activeGroup) === -1;
      });

      doc.querySelectorAll(".component-collection").forEach(function (
        collection,
      ) {
        collection.hidden = !collection.querySelector(
          ".component-block:not([hidden])",
        );
      });

      updateComponentStageNav();

      componentFilterTabs
        .querySelectorAll("button[data-component-group]")
        .forEach(function (btn) {
          btn.setAttribute(
            "aria-pressed",
            String(
              btn.getAttribute("data-component-group") ===
                componentFilterState.activeGroup,
            ),
          );
        });

      if (componentFilterHint) {
        const visibleStageCount = doc.querySelectorAll(
          ".component-stage.component-collection:not([hidden])",
        ).length;
        componentFilterHint.textContent = grouped
          ? componentFilterState.activeGroup +
            " | " +
            visibleStageCount +
            " stage" +
            (visibleStageCount === 1 ? "" : "s")
          : "All | " +
            visibleStageCount +
            " stage" +
            (visibleStageCount === 1 ? "" : "s");
      }

      win.requestAnimationFrame(syncComponentStageNavCurrent);
    }

    renderComponentFilterTabs();
    renderComponentStageNav();
    applyComponentFilter();

    if (componentWorkspaceMain) {
      componentWorkspaceMain.addEventListener(
        "scroll",
        function () {
          syncComponentStageNavCurrent();
        },
        { passive: true },
      );
    }

    win.addEventListener(
      "resize",
      function () {
        syncComponentStageNavCurrent();
      },
      { passive: true },
    );

    doc.addEventListener("studio:panelchange", function (event) {
      if (!event.detail || event.detail.panelKey !== "components") return;
      win.requestAnimationFrame(syncComponentStageNavCurrent);
    });

    initializedComponentsApi = {
      applyComponentFilter: applyComponentFilter,
      syncStageNavCurrent: syncComponentStageNavCurrent,
    };
    return initializedComponentsApi;
  }

  win.DesignSystemStudioComponents = {
    initStudioComponents: initStudioComponents,
  };
})(window, document);
