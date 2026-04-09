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
    const inspectorSurface = doc.getElementById("inspectorSurface");
    const inspectorText = doc.getElementById("inspectorText");
    const inspectorBorder = doc.getElementById("inspectorBorder");
    const inspectorRadius = doc.getElementById("inspectorRadius");
    const inspectorShadow = doc.getElementById("inspectorShadow");
    const inspectorToggleBtn = doc.getElementById("inspectorToggleBtn");
    if (
      !inspector ||
      !inspectorTitle ||
      !inspectorElement ||
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
      inspectorCursorBadge.textContent = "o";
      doc.body.appendChild(inspectorCursorBadge);
    }

    const inspectorState = {
      enabled: false,
      hoverTarget: null,
      cursorX: 24,
      cursorY: 24,
    };
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

    function componentLabel(el) {
      if (!el) return "Component";
      const className = Array.from(el.classList || []).find((x) =>
        x.startsWith("ds-"),
      );
      if (!className) return el.tagName.toLowerCase();
      return className.replace(/^ds-/, "").replace(/-/g, " ");
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

    function showInspectorFor(el, clientX, clientY) {
      if (!el) return;
      const cs = getComputedStyle(el);
      inspectorTitle.textContent = "Inspector: " + componentLabel(el);
      inspectorElement.textContent =
        el.tagName.toLowerCase() +
        (el.className
          ? "." + String(el.className).trim().split(/\s+/).join(".")
          : "");
      inspectorSurface.textContent =
        cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)"
          ? cs.backgroundColor
          : cs.backgroundImage || "transparent";
      inspectorText.textContent = cs.color;
      inspectorBorder.textContent =
        cs.borderWidth + " " + cs.borderStyle + " " + cs.borderColor;
      inspectorRadius.textContent = cs.borderRadius;
      inspectorShadow.textContent = cs.boxShadow;
      inspector.hidden = false;
      positionInspector(clientX, clientY);
    }

    function hideInspector() {
      inspector.hidden = true;
    }

    function positionCursorBadge(clientX, clientY) {
      if (!inspectorState.enabled) return;
      inspectorCursorBadge.hidden = false;
      inspectorCursorBadge.style.left = clientX + "px";
      inspectorCursorBadge.style.top = clientY - 8 + "px";
    }

    function syncInspectorControls() {
      inspectorToggleBtn.setAttribute(
        "aria-pressed",
        String(inspectorState.enabled),
      );
      inspectorToggleBtn.textContent = inspectorState.enabled
        ? "Inspect On"
        : "Inspect Off";
      inspectorToggleBtn.title = inspectorState.enabled
        ? "Hover inspector enabled"
        : "Hover inspector disabled";
    }

    function toggleInspector(enabled) {
      inspectorState.enabled = enabled;
      if (!enabled) {
        inspectorState.hoverTarget = null;
        inspectorCursorBadge.hidden = true;
        hideInspector();
      } else if (inspectorState.hoverTarget) {
        showInspectorFor(
          inspectorState.hoverTarget,
          inspectorState.cursorX,
          inspectorState.cursorY,
        );
      }
      syncInspectorControls();
    }

    inspectorToggleBtn.addEventListener("click", function () {
      toggleInspector(!inspectorState.enabled);
    });

    doc.addEventListener("mousemove", function (event) {
      if (!inspectorState.enabled) return;
      inspectorState.cursorX = event.clientX;
      inspectorState.cursorY = event.clientY;
      positionCursorBadge(event.clientX, event.clientY);
      const hovered = event.target;
      if (!(hovered instanceof Element)) {
        hideInspector();
        return;
      }
      if (inspector.contains(hovered)) return;
      const target = hovered.closest(inspectSelector);
      if (!target) {
        inspectorState.hoverTarget = null;
        hideInspector();
        return;
      }
      inspectorState.hoverTarget = target;
      showInspectorFor(target, event.clientX, event.clientY);
    });

    doc.addEventListener("mouseleave", function () {
      inspectorCursorBadge.hidden = true;
      hideInspector();
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
        toggleInspector(!inspectorState.enabled);
      }
    });

    win.addEventListener("resize", function () {
      if (
        inspectorState.enabled &&
        inspectorState.hoverTarget &&
        !inspector.hidden
      ) {
        positionInspector(inspectorState.cursorX, inspectorState.cursorY);
      }
    });

    win.addEventListener(
      "scroll",
      function () {
        if (
          inspectorState.enabled &&
          inspectorState.hoverTarget &&
          !inspector.hidden
        ) {
          positionInspector(inspectorState.cursorX, inspectorState.cursorY);
        }
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
