;(function (win, doc) {
  let initializedShellApi = null;

  function activateStudioPanel(panelKey) {
    const studioRoot = doc.querySelector(".studio");
    const tabs = Array.from(doc.querySelectorAll(".studio-tab"));
    const panels = Array.from(doc.querySelectorAll(".studio-panel"));
    const contextPanels = Array.from(
      doc.querySelectorAll(".studio-context-panel[data-context-panel]"),
    );
    if (!panelKey) return;

    tabs.forEach((btn) =>
      btn.setAttribute(
        "aria-selected",
        String(btn.getAttribute("data-panel") === panelKey),
      ),
    );
    panels.forEach((panel) => {
      panel.hidden = panel.id !== "panel-" + panelKey;
    });
    contextPanels.forEach((panel) => {
      panel.hidden = panel.getAttribute("data-context-panel") !== panelKey;
    });
    if (studioRoot) studioRoot.setAttribute("data-active-panel", panelKey);
    doc.dispatchEvent(
      new CustomEvent("studio:panelchange", {
        detail: { panelKey },
      }),
    );
  }

  function initStudioShell() {
    if (initializedShellApi) return initializedShellApi;

    const tabs = Array.from(doc.querySelectorAll(".studio-tab"));

    tabs.forEach((btn) =>
      btn.addEventListener("click", function () {
        activateStudioPanel(btn.getAttribute("data-panel"));
      }),
    );

    const activeTab = tabs.find(
      (btn) => btn.getAttribute("aria-selected") === "true",
    );
    if (activeTab) activateStudioPanel(activeTab.getAttribute("data-panel"));

    const inspector = doc.getElementById("componentInspector");
    const inspectorTitle = doc.getElementById("inspectorTitle");
    const inspectorElement = doc.getElementById("inspectorElement");
    const inspectorLayer = doc.getElementById("inspectorLayer");
    const inspectorSurface = doc.getElementById("inspectorSurface");
    const inspectorText = doc.getElementById("inspectorText");
    const inspectorBorder = doc.getElementById("inspectorBorder");
    const inspectorRadius = doc.getElementById("inspectorRadius");
    const inspectorShadow = doc.getElementById("inspectorShadow");
    const inspectorToggleBtn = doc.getElementById("inspectorToggleBtn");
    const inspectorDockToggleBtn = doc.getElementById("inspectorDockToggleBtn");
    const inspectorFollowBtn = doc.getElementById("inspectorFollowBtn");
    const inspectorPinBtn = doc.getElementById("inspectorPinBtn");
    const inspectorDockPanel = doc.getElementById("inspectorDockPanel");
    const inspectorDockStatus = doc.getElementById("inspectorDockStatus");
    const inspectorDockElement = doc.getElementById("inspectorDockElement");
    const inspectorDockLayer = doc.getElementById("inspectorDockLayer");
    const inspectorDockSurface = doc.getElementById("inspectorDockSurface");
    const inspectorDockText = doc.getElementById("inspectorDockText");
    const inspectorDockBorder = doc.getElementById("inspectorDockBorder");
    const inspectorDockRadius = doc.getElementById("inspectorDockRadius");
    const inspectorDockShadow = doc.getElementById("inspectorDockShadow");
    const inspectorLayerSelect = doc.getElementById("inspectorLayerSelect");
    const inspectorLayerPrevBtn = doc.getElementById("inspectorLayerPrevBtn");
    const inspectorLayerNextBtn = doc.getElementById("inspectorLayerNextBtn");
    const inspectorTokenTrace = doc.getElementById("inspectorTokenTrace");
    const inspectorCopyTraceBtn = doc.getElementById("inspectorCopyTraceBtn");
    const inspectorContextMenu = doc.getElementById("inspectorContextMenu");
    const inspectorContextPinBtn = doc.getElementById("inspectorContextPinBtn");
    const inspectorContextFollowBtn = doc.getElementById(
      "inspectorContextFollowBtn",
    );
    const inspectorContextReleaseBtn = doc.getElementById(
      "inspectorContextReleaseBtn",
    );

    if (
      !inspector ||
      !inspectorTitle ||
      !inspectorElement ||
      !inspectorLayer ||
      !inspectorSurface ||
      !inspectorText ||
      !inspectorBorder ||
      !inspectorRadius ||
      !inspectorShadow ||
      !inspectorToggleBtn
    ) {
      initializedShellApi = {
        activatePanel: activateStudioPanel,
      };
      return initializedShellApi;
    }

    let inspectorCursorBadge = doc.querySelector(".inspector-cursor-badge");
    if (!inspectorCursorBadge) {
      inspectorCursorBadge = doc.createElement("div");
      inspectorCursorBadge.className = "inspector-cursor-badge";
      inspectorCursorBadge.hidden = true;
      inspectorCursorBadge.textContent = "i";
      doc.body.appendChild(inspectorCursorBadge);
    }

    const inspectSelector = [
      ".ds-btn",
      ".ds-input",
      ".ds-select",
      ".ds-textarea",
      ".ds-card",
      ".ds-chip",
      ".ds-badge",
      ".ds-menu-item",
      ".ds-popover",
      ".ds-table",
      ".ds-switch-track",
    ].join(",");

    const state = {
      enabled: false,
      docked: false,
      mode: "follow",
      hoverTarget: null,
      pinnedTarget: null,
      activeTarget: null,
      contextTarget: null,
      chain: [],
      layerIndex: 0,
      cursorX: 24,
      cursorY: 24,
    };

    function getProbe() {
      if (state.probe && state.probe.isConnected) return state.probe;
      const probe = doc.createElement("span");
      probe.setAttribute("aria-hidden", "true");
      probe.style.position = "fixed";
      probe.style.left = "-9999px";
      probe.style.top = "-9999px";
      probe.style.width = "1px";
      probe.style.height = "1px";
      probe.style.opacity = "0";
      probe.style.pointerEvents = "none";
      doc.body.appendChild(probe);
      state.probe = probe;
      return probe;
    }

    function resolveTokenValue(token, mode) {
      const probe = getProbe();
      if (!probe) return "(n/a)";
      if (mode === "background") {
        probe.style.background = "none";
        probe.style.background = "var(" + token + ")";
        const cs = getComputedStyle(probe);
        const image = cs.backgroundImage || "none";
        if (image && image !== "none") return image;
        return cs.backgroundColor || "(unresolved)";
      }
      if (mode === "border") {
        probe.style.borderColor = "var(" + token + ")";
        return getComputedStyle(probe).borderColor || "(unresolved)";
      }
      probe.style.color = "var(" + token + ")";
      return getComputedStyle(probe).color || "(unresolved)";
    }

    function tokenSpecFor(el) {
      const spec = [
        { token: "--ds-accent", mode: "color" },
        { token: "--ds-text", mode: "color" },
        { token: "--ds-text-inverse", mode: "color" },
        { token: "--ds-btn-primary-text", mode: "color" },
        { token: "--ds-btn-selected-text", mode: "color" },
      ];
      if (el.matches(".ds-btn-primary")) {
        spec.push(
          { token: "--ds-btn-primary-bg", mode: "background" },
          { token: "--ds-btn-primary-bg-hover", mode: "background" },
          { token: "--ds-btn-primary-border", mode: "border" },
        );
      }
      if (el.matches(".ds-btn")) {
        spec.push(
          { token: "--ds-btn-bg", mode: "background" },
          { token: "--ds-btn-bg-hover", mode: "background" },
          { token: "--ds-btn-border", mode: "border" },
          { token: "--ds-btn-text", mode: "color" },
          { token: "--ds-btn-selected-bg", mode: "background" },
          { token: "--ds-btn-selected-border", mode: "border" },
        );
      }
      if (el.matches(".ds-card")) {
        spec.push(
          { token: "--ds-card-bg", mode: "background" },
          { token: "--ds-card-border", mode: "border" },
          { token: "--ds-card-shadow", mode: "color" },
        );
      }
      if (el.matches(".ds-input, .ds-select, .ds-textarea")) {
        spec.push(
          { token: "--ds-input-bg", mode: "background" },
          { token: "--ds-input-border", mode: "border" },
          { token: "--ds-input-text", mode: "color" },
        );
      }
      return spec;
    }

    function buildTokenTrace(el) {
      if (!el) return "-";
      return tokenSpecFor(el)
        .map(function (entry) {
          return (
            entry.token + " = " + resolveTokenValue(entry.token, entry.mode)
          );
        })
        .join("\n");
    }

    function componentLabel(el) {
      if (!el) return "Component";
      const className = Array.from(el.classList || []).find((x) =>
        x.startsWith("ds-"),
      );
      if (!className) return el.tagName.toLowerCase();
      return className.replace(/^ds-/, "").replace(/-/g, " ");
    }

    function elementDescriptor(el) {
      const classStr = String(el.className || "").trim();
      return (
        el.tagName.toLowerCase() +
        (classStr ? "." + classStr.split(/\s+/).join(".") : "")
      );
    }

    function setText(node, value) {
      if (!node) return;
      node.textContent = value || "-";
    }

    function currentTarget() {
      return state.mode === "pinned" ? state.pinnedTarget : state.hoverTarget;
    }

    function rebuildLayerChain(baseEl) {
      const chain = [];
      let node = baseEl;
      while (node && node instanceof Element) {
        if (node.matches(inspectSelector)) chain.push(node);
        node = node.parentElement;
      }
      state.chain = chain;
      if (!chain.length) {
        state.layerIndex = 0;
        state.activeTarget = null;
      } else {
        state.layerIndex = Math.max(
          0,
          Math.min(state.layerIndex, chain.length - 1),
        );
        state.activeTarget = chain[state.layerIndex];
      }
    }

    function syncLayerPicker() {
      if (!inspectorLayerSelect) return;
      inspectorLayerSelect.innerHTML = "";
      state.chain.forEach(function (el, idx) {
        const opt = doc.createElement("option");
        opt.value = String(idx);
        opt.textContent = (idx + 1).toString() + ". " + componentLabel(el);
        if (idx === state.layerIndex) opt.selected = true;
        inspectorLayerSelect.appendChild(opt);
      });
      inspectorLayerSelect.disabled = state.chain.length <= 1;
      if (inspectorLayerPrevBtn)
        inspectorLayerPrevBtn.disabled = state.layerIndex >= state.chain.length - 1;
      if (inspectorLayerNextBtn) inspectorLayerNextBtn.disabled = state.layerIndex <= 0;
    }

    function positionInspector(clientX, clientY) {
      const gap = 14;
      const maxX = win.innerWidth - inspector.offsetWidth - 10;
      const maxY = win.innerHeight - inspector.offsetHeight - 10;
      let x = Math.min(maxX, clientX + gap);
      let y = Math.min(maxY, clientY + gap);
      if (x < 10) x = Math.max(10, clientX - inspector.offsetWidth - gap);
      if (y < 10) y = Math.max(10, clientY - inspector.offsetHeight - gap);
      inspector.style.left = x + "px";
      inspector.style.top = y + "px";
    }

    function paintInspectorDetails(target) {
      if (!target) {
        setText(inspectorTitle, "Inspector");
        setText(inspectorElement, "-");
        setText(inspectorLayer, "-");
        setText(inspectorSurface, "-");
        setText(inspectorText, "-");
        setText(inspectorBorder, "-");
        setText(inspectorRadius, "-");
        setText(inspectorShadow, "-");
        setText(inspectorDockElement, "-");
        setText(inspectorDockLayer, "-");
        setText(inspectorDockSurface, "-");
        setText(inspectorDockText, "-");
        setText(inspectorDockBorder, "-");
        setText(inspectorDockRadius, "-");
        setText(inspectorDockShadow, "-");
        if (inspectorTokenTrace) inspectorTokenTrace.value = "";
        return;
      }
      const cs = getComputedStyle(target);
      const layerSummary =
        (state.layerIndex + 1).toString() + "/" + state.chain.length.toString();
      const surface =
        cs.backgroundImage && cs.backgroundImage !== "none"
          ? cs.backgroundImage
          : cs.backgroundColor || "transparent";
      const border =
        cs.borderWidth + " " + cs.borderStyle + " " + cs.borderColor;
      const trace = buildTokenTrace(target);
      setText(inspectorTitle, "Inspector: " + componentLabel(target));
      setText(inspectorElement, elementDescriptor(target));
      setText(inspectorLayer, layerSummary + " " + componentLabel(target));
      setText(inspectorSurface, surface);
      setText(inspectorText, cs.color);
      setText(inspectorBorder, border);
      setText(inspectorRadius, cs.borderRadius);
      setText(inspectorShadow, cs.boxShadow);
      setText(inspectorDockElement, elementDescriptor(target));
      setText(inspectorDockLayer, layerSummary + " " + componentLabel(target));
      setText(inspectorDockSurface, surface);
      setText(inspectorDockText, cs.color);
      setText(inspectorDockBorder, border);
      setText(inspectorDockRadius, cs.borderRadius);
      setText(inspectorDockShadow, cs.boxShadow);
      if (inspectorTokenTrace) inspectorTokenTrace.value = trace;
    }

    function hideFloatingInspector() {
      inspector.hidden = true;
    }

    function showFloatingInspector() {
      inspector.hidden = false;
      positionInspector(state.cursorX, state.cursorY);
    }

    function hideContextMenu() {
      if (inspectorContextMenu) inspectorContextMenu.hidden = true;
      state.contextTarget = null;
    }

    function syncInspectorControls() {
      inspectorToggleBtn.setAttribute("aria-pressed", String(state.enabled));
      inspectorToggleBtn.textContent = state.enabled ? "Inspect On" : "Inspect Off";
      inspectorToggleBtn.title = state.enabled
        ? "Hover inspector enabled"
        : "Hover inspector disabled";

      if (inspectorDockToggleBtn) {
        inspectorDockToggleBtn.disabled = !state.enabled;
        inspectorDockToggleBtn.setAttribute(
          "aria-pressed",
          String(state.docked),
        );
        inspectorDockToggleBtn.textContent = state.docked ? "Dock On" : "Dock Off";
      }
      if (inspectorFollowBtn) {
        inspectorFollowBtn.setAttribute(
          "aria-pressed",
          String(state.mode === "follow"),
        );
        inspectorFollowBtn.classList.toggle(
          "is-selected",
          state.mode === "follow",
        );
      }
      if (inspectorPinBtn) {
        inspectorPinBtn.setAttribute(
          "aria-pressed",
          String(state.mode === "pinned"),
        );
        inspectorPinBtn.classList.toggle("is-selected", state.mode === "pinned");
      }
      if (inspectorDockStatus) {
        if (!state.enabled) {
          inspectorDockStatus.textContent = "off";
        } else if (state.mode === "pinned") {
          inspectorDockStatus.textContent = state.docked ? "pinned+docked" : "pinned";
        } else {
          inspectorDockStatus.textContent = state.docked ? "follow+docked" : "follow";
        }
      }
      if (inspectorDockPanel) {
        inspectorDockPanel.hidden = !(state.enabled && state.docked);
      }
    }

    function refreshInspectorView() {
      if (!state.enabled) {
        hideFloatingInspector();
        return;
      }
      const target = currentTarget();
      if (!target) {
        paintInspectorDetails(null);
        hideFloatingInspector();
        return;
      }
      if (!state.chain.length || state.chain.indexOf(target) === -1) {
        rebuildLayerChain(target);
      }
      state.activeTarget = state.chain[state.layerIndex] || target;
      syncLayerPicker();
      paintInspectorDetails(state.activeTarget);
      if (state.docked) {
        hideFloatingInspector();
      } else {
        showFloatingInspector();
      }
    }

    function setMode(mode, pinTarget) {
      if (mode === "pinned") {
        state.mode = "pinned";
        state.pinnedTarget = pinTarget || state.activeTarget || state.hoverTarget;
      } else {
        state.mode = "follow";
        state.pinnedTarget = null;
      }
      if (state.mode === "pinned") inspectorCursorBadge.hidden = true;
      refreshInspectorView();
      syncInspectorControls();
    }

    function toggleDocked(next) {
      state.docked = !!next;
      refreshInspectorView();
      syncInspectorControls();
    }

    function toggleInspector(enabled) {
      state.enabled = !!enabled;
      if (!state.enabled) {
        state.hoverTarget = null;
        state.pinnedTarget = null;
        state.activeTarget = null;
        state.chain = [];
        state.layerIndex = 0;
        inspectorCursorBadge.hidden = true;
        hideFloatingInspector();
        hideContextMenu();
        paintInspectorDetails(null);
      }
      refreshInspectorView();
      syncInspectorControls();
    }

    function showContextMenu(clientX, clientY, target) {
      if (!inspectorContextMenu) return;
      state.contextTarget = target;
      inspectorContextMenu.hidden = false;
      const maxX = win.innerWidth - inspectorContextMenu.offsetWidth - 8;
      const maxY = win.innerHeight - inspectorContextMenu.offsetHeight - 8;
      inspectorContextMenu.style.left = Math.max(8, Math.min(maxX, clientX)) + "px";
      inspectorContextMenu.style.top = Math.max(8, Math.min(maxY, clientY)) + "px";
    }

    function copyTraceToClipboard() {
      if (!inspectorTokenTrace || !inspectorTokenTrace.value) return;
      const text = inspectorTokenTrace.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () {});
      } else {
        inspectorTokenTrace.select();
        doc.execCommand("copy");
      }
    }

    inspectorToggleBtn.addEventListener("click", function () {
      toggleInspector(!state.enabled);
    });

    if (inspectorDockToggleBtn) {
      inspectorDockToggleBtn.addEventListener("click", function () {
        if (!state.enabled) toggleInspector(true);
        toggleDocked(!state.docked);
      });
    }

    if (inspectorFollowBtn) {
      inspectorFollowBtn.addEventListener("click", function () {
        setMode("follow");
      });
    }

    if (inspectorPinBtn) {
      inspectorPinBtn.addEventListener("click", function () {
        setMode("pinned", state.hoverTarget || state.activeTarget);
      });
    }

    if (inspectorLayerPrevBtn) {
      inspectorLayerPrevBtn.addEventListener("click", function () {
        if (!state.chain.length) return;
        state.layerIndex = Math.min(state.chain.length - 1, state.layerIndex + 1);
        refreshInspectorView();
      });
    }

    if (inspectorLayerNextBtn) {
      inspectorLayerNextBtn.addEventListener("click", function () {
        if (!state.chain.length) return;
        state.layerIndex = Math.max(0, state.layerIndex - 1);
        refreshInspectorView();
      });
    }

    if (inspectorLayerSelect) {
      inspectorLayerSelect.addEventListener("change", function () {
        const idx = parseInt(inspectorLayerSelect.value, 10);
        if (Number.isNaN(idx)) return;
        state.layerIndex = Math.max(0, Math.min(idx, state.chain.length - 1));
        refreshInspectorView();
      });
    }

    if (inspectorCopyTraceBtn) {
      inspectorCopyTraceBtn.addEventListener("click", function () {
        copyTraceToClipboard();
      });
    }

    if (inspectorContextPinBtn) {
      inspectorContextPinBtn.addEventListener("click", function () {
        if (state.contextTarget) {
          setMode("pinned", state.contextTarget);
        }
        hideContextMenu();
      });
    }

    if (inspectorContextFollowBtn) {
      inspectorContextFollowBtn.addEventListener("click", function () {
        setMode("follow");
        hideContextMenu();
      });
    }

    if (inspectorContextReleaseBtn) {
      inspectorContextReleaseBtn.addEventListener("click", function () {
        state.pinnedTarget = null;
        setMode("follow");
        hideContextMenu();
      });
    }

    doc.addEventListener("mousemove", function (event) {
      if (!state.enabled) return;
      state.cursorX = event.clientX;
      state.cursorY = event.clientY;
      if (state.mode === "follow" && !state.docked) {
        inspectorCursorBadge.hidden = false;
        inspectorCursorBadge.style.left = event.clientX + "px";
        inspectorCursorBadge.style.top = event.clientY - 8 + "px";
      } else {
        inspectorCursorBadge.hidden = true;
      }
      const hovered = event.target;
      if (!(hovered instanceof Element)) return;
      if (
        inspector.contains(hovered) ||
        (inspectorDockPanel && inspectorDockPanel.contains(hovered)) ||
        (inspectorContextMenu && inspectorContextMenu.contains(hovered))
      ) {
        return;
      }
      if (state.mode === "pinned") return;
      const target = hovered.closest(inspectSelector);
      if (!target) {
        state.hoverTarget = null;
        state.chain = [];
        state.layerIndex = 0;
        refreshInspectorView();
        return;
      }
      state.hoverTarget = target;
      rebuildLayerChain(target);
      refreshInspectorView();
    });

    doc.addEventListener("contextmenu", function (event) {
      if (!state.enabled) return;
      const source = event.target;
      if (!(source instanceof Element)) return;
      if (
        inspector.contains(source) ||
        (inspectorDockPanel && inspectorDockPanel.contains(source)) ||
        (inspectorContextMenu && inspectorContextMenu.contains(source))
      ) {
        return;
      }
      const target = source.closest(inspectSelector);
      if (!target) return;
      event.preventDefault();
      state.hoverTarget = target;
      if (state.mode !== "pinned") {
        rebuildLayerChain(target);
      }
      refreshInspectorView();
      showContextMenu(event.clientX, event.clientY, target);
    });

    doc.addEventListener("click", function (event) {
      if (!inspectorContextMenu || inspectorContextMenu.hidden) return;
      const source = event.target;
      if (!(source instanceof Element)) {
        hideContextMenu();
        return;
      }
      if (!inspectorContextMenu.contains(source)) hideContextMenu();
    });

    doc.addEventListener("mouseleave", function () {
      inspectorCursorBadge.hidden = true;
      if (state.mode === "follow" && !state.docked) hideFloatingInspector();
    });

    doc.addEventListener("keydown", function (event) {
      if (
        event.target instanceof HTMLElement &&
        (event.target.closest(
          "input, textarea, select, [contenteditable='true']",
        ) ||
          event.target.isContentEditable)
      ) {
        return;
      }
      if (event.key.toLowerCase() === "i") {
        event.preventDefault();
        toggleInspector(!state.enabled);
        return;
      }
      if (event.key === "Escape") {
        hideContextMenu();
        return;
      }
      if (!state.enabled) return;
      if (event.key === "[") {
        event.preventDefault();
        if (state.chain.length) {
          state.layerIndex = Math.min(state.chain.length - 1, state.layerIndex + 1);
          refreshInspectorView();
        }
      }
      if (event.key === "]") {
        event.preventDefault();
        if (state.chain.length) {
          state.layerIndex = Math.max(0, state.layerIndex - 1);
          refreshInspectorView();
        }
      }
    });

    win.addEventListener("resize", function () {
      if (!inspector.hidden) positionInspector(state.cursorX, state.cursorY);
    });

    win.addEventListener(
      "scroll",
      function () {
        if (!inspector.hidden) positionInspector(state.cursorX, state.cursorY);
      },
      { passive: true },
    );

    syncInspectorControls();

    initializedShellApi = {
      activatePanel: activateStudioPanel,
    };
    return initializedShellApi;
  }

  win.DesignSystemStudioShell = {
    activatePanel: activateStudioPanel,
    initStudioShell: initStudioShell,
  };
})(window, document);
