(function (win, doc) {
  function utilityToggleMarkup(kind, isActive, previewNext) {
    const icons = {
      visibilityOn:
        '<svg class="ds-icon-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z"></path><circle cx="12" cy="12" r="2.8"></circle></svg>',
      visibilityOff:
        '<svg class="ds-icon-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"></path><path d="M10.7 6.3A10 10 0 0 1 12 6c5.9 0 9.5 6 9.5 6a16.6 16.6 0 0 1-3.2 3.8"></path><path d="M6.2 6.2A16.7 16.7 0 0 0 2.5 12s3.6 6 9.5 6a9.7 9.7 0 0 0 2.5-.33"></path></svg>',
      lockOn:
        '<svg class="ds-icon-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="10.5" width="11" height="8" rx="2"></rect><path d="M8.8 10.5V8.6a3.2 3.2 0 1 1 6.4 0v1.9"></path></svg>',
      lockOff:
        '<svg class="ds-icon-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="10.5" width="11" height="8" rx="2"></rect><path d="M15.2 10.5V8.6a3.2 3.2 0 1 0-6.4 0"></path></svg>',
    };
    if (kind === "visibility") {
      if (isActive) return previewNext ? icons.visibilityOff : icons.visibilityOn;
      return icons.visibilityOn;
    }
    if (kind === "lock") {
      if (isActive) return previewNext ? icons.lockOff : icons.lockOn;
      return icons.lockOn;
    }
    return "";
  }

  function initUtilityToggleDemos() {
    doc.querySelectorAll("[data-utility-toggle]").forEach(function (btn) {
      const row = btn.closest(".ds-utility-demo-item");
      function render() {
        const kind = btn.getAttribute("data-utility-toggle");
        const isActive = btn.getAttribute("aria-pressed") === "true";
        const previewNext = btn.dataset.previewNext === "1";
        btn.innerHTML = utilityToggleMarkup(kind, isActive, previewNext);
        if (kind === "visibility") {
          btn.title = isActive
            ? previewNext
              ? btn.getAttribute("data-off-label") || "Show item"
              : btn.getAttribute("data-on-label") || "Hide item"
            : btn.getAttribute("data-off-label") || "Show item";
        } else if (kind === "lock") {
          btn.title = isActive
            ? previewNext
              ? btn.getAttribute("data-off-label") || "Lock item"
              : btn.getAttribute("data-on-label") || "Unlock item"
            : btn.getAttribute("data-off-label") || "Lock item";
        }
      }
      btn.addEventListener("mouseenter", function () {
        btn.dataset.previewNext = "1";
        render();
      });
      btn.addEventListener("mouseleave", function () {
        btn.dataset.previewNext = "0";
        render();
      });
      btn.addEventListener("focus", function () {
        btn.dataset.previewNext = "1";
        render();
      });
      btn.addEventListener("blur", function () {
        btn.dataset.previewNext = "0";
        render();
      });
      btn.addEventListener("click", function () {
        const isActive = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", String(!isActive));
        btn.blur();
        btn.dataset.previewNext = row && row.matches(":hover") ? "1" : "0";
        render();
      });
      render();
    });
  }

  function initSliderDemo() {
    const sliderDemo = doc.getElementById("sliderDemo");
    const sliderDemoValue = doc.getElementById("sliderDemoValue");
    if (!sliderDemo || !sliderDemoValue) return;
    sliderDemo.addEventListener("input", function () {
      sliderDemoValue.textContent = sliderDemo.value;
    });
  }

  function initSegmentedDemo() {
    const segDemo = doc.getElementById("segDemo");
    if (!segDemo) return;
    segDemo.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", function () {
        segDemo
          .querySelectorAll("button")
          .forEach((peer) => peer.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
      }),
    );
  }

  function initDemoTabsets() {
    doc.querySelectorAll(".demo-tabset").forEach((setEl) => {
      const tabs = Array.from(setEl.querySelectorAll(".ds-tab[data-tab-target]"));
      tabs.forEach((tab) =>
        tab.addEventListener("click", function () {
          const targetId = tab.getAttribute("data-tab-target");
          tabs.forEach((peer) => peer.setAttribute("aria-selected", "false"));
          setEl
            .querySelectorAll(".ds-tabpanel")
            .forEach((panel) => (panel.hidden = true));
          tab.setAttribute("aria-selected", "true");
          const panel = targetId ? setEl.querySelector("#" + targetId) : null;
          if (panel) panel.hidden = false;
        }),
      );
    });
  }

  function initMasterPanelDemo() {
    const masterPanel = doc.querySelector(".ds-master-panel");
    if (!masterPanel) return;
    const masterTabBtns = Array.from(
      masterPanel.querySelectorAll("[data-master-tab]"),
    );
    const masterPanes = Array.from(masterPanel.querySelectorAll(".ds-master-pane"));
    masterTabBtns.forEach((btn) =>
      btn.addEventListener("click", function () {
        const targetId = btn.getAttribute("data-master-tab");
        masterTabBtns.forEach((peer) => {
          const active = peer === btn;
          peer.classList.toggle("is-active", active);
          peer.setAttribute("aria-selected", String(active));
        });
        masterPanes.forEach((pane) => {
          pane.hidden = pane.id !== targetId;
        });
      }),
    );
  }

  function initMasterReadouts() {
    [
      ["masterExposure", "masterExposureValue"],
      ["masterGlow", "masterGlowValue"],
      ["masterPanX", "masterPanXValue"],
      ["masterPanY", "masterPanYValue"],
    ].forEach(function ([inputId, outputId]) {
      const input = doc.getElementById(inputId);
      const output = doc.getElementById(outputId);
      if (!input || !output) return;
      const sync = function () {
        output.textContent = input.value;
      };
      input.addEventListener("input", sync);
      sync();
    });
  }

  function initArrowDemo() {
    const arrowOut = doc.getElementById("arrowValue");
    const arrowUpBtn = doc.getElementById("arrowUpBtn");
    const arrowDownBtn = doc.getElementById("arrowDownBtn");
    if (!arrowOut || !arrowUpBtn || !arrowDownBtn) return;
    let arrowValue = 0;
    arrowUpBtn.addEventListener("click", function () {
      arrowValue += 1;
      arrowOut.textContent = String(arrowValue);
    });
    arrowDownBtn.addEventListener("click", function () {
      arrowValue -= 1;
      arrowOut.textContent = String(arrowValue);
    });
  }

  function initSidebarCollapseDemo() {
    const sidebarCollapseBtn = doc.getElementById("sidebarCollapseBtn");
    const appShellDemo = doc.getElementById("appShellDemo");
    if (!sidebarCollapseBtn || !appShellDemo) return;
    sidebarCollapseBtn.addEventListener("click", function () {
      const collapsed = appShellDemo.classList.toggle("is-collapsed");
      sidebarCollapseBtn.setAttribute("aria-pressed", String(collapsed));
      sidebarCollapseBtn.textContent = collapsed ? "Expand" : "Collapse";
    });
  }

  function initCameraPadDemo() {
    const cameraPadReadout = doc.getElementById("cameraPadReadout");
    const cameraPadState = { x: 0, y: 0, z: 1, mode: "grid" };

    function renderCameraPadState() {
      if (!cameraPadReadout) return;
      cameraPadReadout.textContent =
        "mode:" +
        cameraPadState.mode +
        " x:" +
        cameraPadState.x +
        " y:" +
        cameraPadState.y +
        " z:" +
        cameraPadState.z.toFixed(1);
    }

    doc.querySelectorAll("[data-cam]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const action = btn.getAttribute("data-cam");
        if (action === "up") cameraPadState.y += 1;
        else if (action === "down") cameraPadState.y -= 1;
        else if (action === "left") cameraPadState.x -= 1;
        else if (action === "right") cameraPadState.x += 1;
        else if (action === "zoomIn")
          cameraPadState.z = Math.min(3, cameraPadState.z + 0.1);
        else if (action === "zoomOut")
          cameraPadState.z = Math.max(0.2, cameraPadState.z - 0.1);
        else if (action === "viewGrid") cameraPadState.mode = "grid";
        else if (action === "viewColumn") cameraPadState.mode = "column";
        else if (action === "viewIso") cameraPadState.mode = "iso";
        else if (action === "snapFrame") cameraPadState.mode = "frame";
        else if (action === "home") {
          cameraPadState.mode = "home";
          cameraPadState.x = 0;
          cameraPadState.y = 0;
        } else if (action === "reset") {
          cameraPadState.mode = "grid";
          cameraPadState.x = 0;
          cameraPadState.y = 0;
          cameraPadState.z = 1;
        }
        renderCameraPadState();
      });
    });

    renderCameraPadState();
  }

  function initGizmoDemo() {
    const gizmoReadout = doc.getElementById("gizmoReadout");
    const gizmoStepLabel = doc.getElementById("gizmoStepLabel");
    const gizmoModel = doc.getElementById("gizmoModel");
    const gizmoAxisY = doc.getElementById("gizmoAxisY");
    const gizmoState = { x: 0, y: 0, z: 0, scale: 1, step: 1 };

    function renderGizmoState() {
      if (!gizmoReadout) return;
      gizmoReadout.textContent =
        "x:" +
        gizmoState.x +
        " y:" +
        gizmoState.y +
        " z:" +
        gizmoState.z +
        " s:" +
        gizmoState.scale.toFixed(1);
      if (gizmoStepLabel) {
        gizmoStepLabel.textContent = "step:" + gizmoState.step.toFixed(1);
      }
      if (gizmoModel) {
        const tx = 110 + gizmoState.x * 6;
        const ty = 100 - gizmoState.y * 6 - gizmoState.z * 2;
        gizmoModel.setAttribute(
          "transform",
          "translate(" +
            tx +
            " " +
            ty +
            ") scale(" +
            gizmoState.scale.toFixed(2) +
            ")",
        );
      }
      if (gizmoAxisY) {
        gizmoAxisY.setAttribute(
          "y2",
          String(56 - Math.round(gizmoState.z * 4)),
        );
      }
    }

    doc.querySelectorAll("[data-gizmo]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const action = btn.getAttribute("data-gizmo");
        const step = gizmoState.step;
        if (action === "up") gizmoState.y += step;
        else if (action === "down") gizmoState.y -= step;
        else if (action === "left") gizmoState.x -= step;
        else if (action === "right") gizmoState.x += step;
        else if (action === "zUp") gizmoState.z += step;
        else if (action === "zDown") gizmoState.z -= step;
        else if (action === "scaleUp")
          gizmoState.scale = Math.min(5, gizmoState.scale + step * 0.1);
        else if (action === "scaleDown")
          gizmoState.scale = Math.max(0.2, gizmoState.scale - step * 0.1);
        else if (action === "stepFine") gizmoState.step = 0.5;
        else if (action === "stepCoarse") gizmoState.step = 2;
        else if (action === "center") {
          gizmoState.x = 0;
          gizmoState.y = 0;
          gizmoState.z = 0;
        } else if (action === "reset") {
          gizmoState.x = 0;
          gizmoState.y = 0;
          gizmoState.z = 0;
          gizmoState.scale = 1;
          gizmoState.step = 1;
        }
        renderGizmoState();
      });
    });

    renderGizmoState();
  }

  function initStudioDemos() {
    initSliderDemo();
    initSegmentedDemo();
    initDemoTabsets();
    initMasterPanelDemo();
    initMasterReadouts();
    initArrowDemo();
    initSidebarCollapseDemo();
    initCameraPadDemo();
    initGizmoDemo();
    initUtilityToggleDemos();
  }

  win.DesignSystemStudioDemos = {
    initStudioDemos,
  };
})(window, document);
