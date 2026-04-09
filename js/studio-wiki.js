(function (win, doc) {
  function initGuideNav(opts) {
    const shell = opts && opts.shell;
    const navButtons = Array.from(
      doc.querySelectorAll(".guide-nav-btn[data-guide-target]"),
    );
    const guideSections = Array.from(
      doc.querySelectorAll(".guide-section[id]"),
    );
    if (!navButtons.length) return null;

    function setActiveGuideTarget(id) {
      navButtons.forEach((btn) =>
        btn.setAttribute(
          "aria-pressed",
          String(btn.getAttribute("data-guide-target") === id),
        ),
      );
      guideSections.forEach((section) => {
        section.hidden = section.id !== id;
      });
    }

    function bindGuidePanelActions(section) {
      if (!section) return;
      section
        .querySelectorAll("[data-open-panel]")
        .forEach(function (btn) {
          if (btn.dataset.boundGuideAction === "1") return;
          btn.dataset.boundGuideAction = "1";
          btn.addEventListener("click", function () {
            const panelKey = btn.getAttribute("data-open-panel");
            if (!panelKey) return;
            if (shell && typeof shell.activatePanel === "function") {
              shell.activatePanel(panelKey);
            }
          });
        });
    }

    navButtons.forEach((btn, index) => {
      btn.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      btn.addEventListener("click", function () {
        const target = doc.getElementById(btn.getAttribute("data-guide-target"));
        if (!target) return;
        setActiveGuideTarget(target.id);
      });
    });

    if (guideSections.length) {
      setActiveGuideTarget(guideSections[0].id);
    }

    guideSections.forEach(bindGuidePanelActions);

    return { setActiveGuideTarget };
  }

  function initWikiNavigation(opts) {
    const root = (opts && opts.root) || doc.documentElement;
    const frame = opts && opts.frame;
    const navButtons = Array.isArray(opts && opts.navButtons)
      ? opts.navButtons
      : [];
    if (!frame || !navButtons.length) return null;

    function wikiViewerSrc(docPath) {
      const theme = root.getAttribute("data-theme") || "steel-night";
      return (
        "./wiki/viewer.html?doc=" +
        encodeURIComponent(docPath) +
        "&embed=1&theme=" +
        encodeURIComponent(theme)
      );
    }

    function syncThemeTokens() {
      const iframeDoc = frame.contentDocument;
      if (!iframeDoc) return;
      const iframeRoot = iframeDoc.documentElement;
      const activeTheme = root.getAttribute("data-theme") || "steel-night";
      iframeRoot.setAttribute("data-theme", activeTheme);
      const src = win.getComputedStyle(root);
      for (let i = 0; i < src.length; i += 1) {
        const prop = src[i];
        if (!prop || prop.indexOf("--ds-") !== 0) continue;
        iframeRoot.style.setProperty(prop, src.getPropertyValue(prop));
      }
    }

    function setActiveDoc(docPath) {
      if (!docPath) return;
      navButtons.forEach((btn) => {
        btn.setAttribute(
          "aria-pressed",
          String(btn.getAttribute("data-doc") === docPath),
        );
      });
      const nextSrc = wikiViewerSrc(docPath);
      if (frame.getAttribute("src") !== nextSrc) {
        frame.setAttribute("src", nextSrc);
      } else {
        syncThemeTokens();
      }
    }

    frame.addEventListener("load", function () {
      syncThemeTokens();
    });

    let initialDoc = "FOUNDATIONS.md";
    try {
      const initialUrl = new URL(frame.getAttribute("src"), win.location.href);
      const docFromSrc = initialUrl.searchParams.get("doc");
      if (docFromSrc) initialDoc = docFromSrc;
    } catch (_) {}

    setActiveDoc(initialDoc);
    navButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const docPath = btn.getAttribute("data-doc");
        if (!docPath) return;
        setActiveDoc(docPath);
      });
    });

    return {
      setActiveDoc,
      syncThemeTokens,
    };
  }

  win.DesignSystemStudioWiki = {
    initGuideNav,
    initWikiNavigation,
  };
})(window, document);
