(function (win, doc) {
  "use strict";
  let initialized;
  function initPreview() {
    if (initialized) return initialized;
    const frame = doc.getElementById("builderPreviewFrame");
    const template = doc.getElementById("builderPreviewTemplate");
    const previewDoc = frame.contentDocument;
    // The frame stays on its inherited-origin blank document. Only trusted sample
    // markup is inserted; user token values are assigned through style.setProperty.
    previewDoc.open();
    previewDoc.write('<!doctype html><html lang="en" data-theme="steel-night"><head><meta charset="utf-8"><title>Theme preview</title></head><body></body></html>');
    previewDoc.close();
    const runtime = previewDoc.createElement("style");
    runtime.textContent = win.DesignSystemThemePackageAssets.css;
    previewDoc.head.appendChild(runtime);
    const fonts = previewDoc.createElement("link");
    fonts.rel = "stylesheet";
    fonts.href = new URL("./css/fonts.css", doc.baseURI).href;
    previewDoc.head.appendChild(fonts);
    const layout = previewDoc.createElement("link");
    layout.rel = "stylesheet";
    layout.href = new URL("./css/studio-preview.css", doc.baseURI).href;
    previewDoc.head.appendChild(layout);
    const returnButton = previewDoc.createElement("button");
    returnButton.type = "button";
    returnButton.className = "ds-btn ds-btn-sm";
    returnButton.textContent = "Return to editor";
    returnButton.addEventListener("click", () => doc.getElementById("focusPreviewBtn").focus());
    previewDoc.body.appendChild(returnButton);
    previewDoc.body.appendChild(previewDoc.importNode(template.content, true));
    const tabs = Array.from(previewDoc.querySelectorAll('[role="tab"]'));
    function selectTab(tab) {
      for (const item of tabs) {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        previewDoc.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
      }
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", (event) => {
        const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        selectTab(tabs[next]);
        tabs[next].focus();
      });
    });
    const panel = doc.getElementById("panel-builder");
    const view = doc.getElementById("builderViewSelect");
    const settings = doc.getElementById("builderSettings");
    const narrow = win.matchMedia("(max-width: 980px)");
    let explicitView = false;
    function applyView() {
      const main = panel.querySelector(".builder-workspace-main");
      const side = panel.querySelector(".builder-workspace-side");
      if ((view.value === "preview" && main.contains(doc.activeElement)) || (view.value === "editor" && side.contains(doc.activeElement))) view.focus();
      main.hidden = view.value === "preview";
      side.hidden = view.value === "editor";
      panel.dataset.builderView = view.value;
    }
    function responsiveView() {
      if (!explicitView) view.value = narrow.matches ? "editor" : "both";
      if (narrow.matches && settings.contains(doc.activeElement)) settings.querySelector("summary").focus();
      settings.open = !narrow.matches;
      applyView();
    }
    view.addEventListener("change", () => { explicitView = true; applyView(); });
    narrow.addEventListener("change", responsiveView);
    responsiveView();
    doc.getElementById("focusPreviewBtn").addEventListener("click", () => returnButton.focus());
    previewDoc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") doc.getElementById("focusPreviewBtn").focus();
    });
    // Keep component specimens themed, while their navigation and the Studio
    // editor retain the fixed shell theme. Mirror values without rebuilding DOM.
    const gallery = doc.querySelector(".component-library-flow");
    let previous = {};
    function bindSession(session) {
      let fontStylesFailed = false;
      function sync() {
        const tokens = session.tokens;
        const fontNote = doc.getElementById("builderPreviewFonts");
        if (fontNote) {
          const names = ["--ds-font-sans", "--ds-font-mono"].map((token) => {
            const stack = win.DesignSystemThemeContrast.resolve(tokens[token], tokens);
            const preferred = stack.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
            const bundled = win.DesignSystemThemePackageAssets.fontManifest.faces.some((face) => face.family === preferred);
            const failed = fontStylesFailed || Array.from(previewDoc.fonts).some((face) =>
              face.family.replace(/^['"]|['"]$/g, "") === preferred && face.status === "error");
            return preferred + (bundled ? (failed ? " (load issue)" : " (bundled)") : " (device/custom)");
          });
          const edited = ["--ds-font-sans", "--ds-font-mono"].some((token) => Object.hasOwn(session.overrides, token));
          fontNote.textContent = "Body: " + names[0] + "; Code: " + names[1] + (edited ? "; Font edits applied" : "");
          fontNote.title = "Configured preferred faces; device/custom fonts may use fallbacks. Body: " + tokens["--ds-font-sans"] + "; Code: " + tokens["--ds-font-mono"];
          fontNote.dataset.fontOverrides = String(edited);
        }
        if (gallery) {
          for (const key of Object.keys(previous)) if (!(key in tokens)) gallery.style.removeProperty(key);
          for (const [key, value] of Object.entries(tokens)) if (previous[key] !== value) gallery.style.setProperty(key, value);
          previous = tokens;
        }
      }
      session.subscribe(sync);
      previewDoc.fonts.addEventListener("loadingdone", sync);
      previewDoc.fonts.addEventListener("loadingerror", sync);
      fonts.addEventListener("error", () => { fontStylesFailed = true; sync(); });
    }
    initialized = { root: previewDoc.documentElement, frame, bindSession };
    return initialized;
  }
  win.DesignSystemStudioThemePreview = { initPreview };
})(window, document);
