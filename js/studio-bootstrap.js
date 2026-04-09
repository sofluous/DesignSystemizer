(function (win, doc) {
  let initializedBootstrapApi = null;

  function initStudioBootstrap(opts) {
    if (initializedBootstrapApi) return initializedBootstrapApi;

    const root = opts.root;
    const renderBuilder = opts.renderBuilder;
    const tokenGroups = opts.tokenGroups || [];
    const builderGroupId = opts.builderGroupId;
    const builderPresetOwners = opts.builderPresetOwners || [];
    const builderGroupOwnerMap = opts.builderGroupOwnerMap || {};
    const builderState = opts.builderState;
    const humanLabel = opts.humanLabel;
    const controlMap = opts.controlMap;
    const applyControl = opts.applyControl;
    const applyShadowPreset = opts.applyShadowPreset;
    const getRawTokenValue = opts.getRawTokenValue;
    const syncControlsFromComputed = opts.syncControlsFromComputed;
    const themeSelect = opts.themeSelect;
    const familyPresetSelect = opts.familyPresetSelect;
    const huePresetSelect = opts.huePresetSelect;
    const schemePresetSelect = opts.schemePresetSelect;
    const stylePresetSelect = opts.stylePresetSelect;
    const typographyPresetSelect = opts.typographyPresetSelect;
    const scalePresetSelect = opts.scalePresetSelect;
    const texturePresetSelect = opts.texturePresetSelect;
    const autoApplyPresetToggle = opts.autoApplyPresetToggle;
    const autoApplyPresetKey = opts.autoApplyPresetKey;
    const resetConfirmKey = opts.resetConfirmKey;
    const baseThemePresetMap = opts.baseThemePresetMap;
    const buildColorBundle = opts.buildColorBundle;
    const inferTypographyPreset = opts.inferTypographyPreset;
    const inferTexturePreset = opts.inferTexturePreset;
    const schemePresets = opts.schemePresets;
    const stylePresets = opts.stylePresets;
    const scalePresets = opts.scalePresets;
    const typographyPresets = opts.typographyPresets;
    const texturePresets = opts.texturePresets;

    function tokenUsageHint(token) {
      const specificHints = {
        "--ds-bg":
          "Global app background. Keep this stable for predictable contrast.",
        "--ds-bg-elevated":
          "Primary panel/card surface used by most containers.",
        "--ds-bg-raised":
          "Nested group surface for subsections and grouped controls.",
        "--ds-bg-soft": "Soft separator surface for low-emphasis blocks.",
        "--ds-text":
          "Default content text color for body and primary labels.",
        "--ds-text-muted":
          "Secondary text for metadata, helper copy, and passive labels.",
        "--ds-text-inverse":
          "Text on strong fills (accent buttons, badges, highlighted chips).",
        "--ds-accent":
          "Primary interaction color for key actions and highlights.",
        "--ds-accent-strong":
          "High-contrast accent state for active/hover emphasis.",
        "--ds-focus":
          "Keyboard focus ring and focus-visible affordance color.",
        "--ds-btn-primary-bg":
          "Primary action background. Keep one primary per action region.",
        "--ds-btn-primary-text":
          "Primary label color. Set for contrast against primary background; for some themes this intentionally maps to --ds-btn-primary-border.",
        "--ds-btn-bg": "Secondary/neutral button background token.",
        "--ds-btn-text": "Secondary/neutral button label color token.",
        "--ds-input-bg":
          "Input field surface token for text-entry controls.",
        "--ds-input-text": "Input value text color.",
        "--ds-input-placeholder":
          "Placeholder hint text tone (muted but readable).",
        "--ds-border": "Default control/card border token.",
        "--ds-border-strong":
          "High-emphasis border for selected or structural edges.",
        "--ds-card-shadow":
          "Card elevation token. Keep depth subtle enough for readability.",
        "--ds-layout-gap": "Primary layout rhythm between major sections.",
        "--ds-control-h": "Standard control height for inputs and buttons.",
        "--ds-control-h-sm": "Compact control height for dense panels.",
        "--ds-body-texture-image":
          "Global texture overlay. Keep low-contrast to avoid noise.",
        "--ds-card-texture-image":
          "Card texture layer for material feel.",
        "--ds-control-texture-image":
          "Control texture layer for inputs/buttons.",
        "--ds-native-icon-filter":
          "Adjusts native input/date/time icons for theme contrast.",
      };
      if (specificHints[token]) return specificHints[token];
      if (
        token.indexOf("--ds-bg") === 0 ||
        token.indexOf("--ds-text") === 0 ||
        token.indexOf("--ds-border") === 0 ||
        token.indexOf("--ds-accent") === 0
      ) {
        return "Semantic token used by many components for visual language.";
      }
      if (
        token.indexOf("--ds-space") === 0 ||
        token.indexOf("--ds-layout") === 0 ||
        token.indexOf("--ds-card-pad") === 0 ||
        token.indexOf("--ds-control-h") === 0
      ) {
        return "Layout token for spacing, density, and component sizing only.";
      }
      if (
        token.indexOf("--ds-font") === 0 ||
        token.indexOf("--ds-fs") === 0 ||
        token.indexOf("--ds-lh") === 0 ||
        token.indexOf("--ds-label") === 0
      ) {
        return "Typography token for font family, scale, and readability.";
      }
      if (token.indexOf("--ds-shadow") === 0) {
        return "Depth token for elevation and layering effects.";
      }
      if (
        token.indexOf("--ds-body-texture") === 0 ||
        token.indexOf("--ds-card-texture") === 0 ||
        token.indexOf("--ds-control-texture") === 0 ||
        token.indexOf("--ds-texture-") === 0 ||
        (token.indexOf("--ds-") === 0 &&
          token.indexOf("backdrop-blur") > -1)
      ) {
        return "Texture token for dynamic material identity (grain, sheen, blur).";
      }
      if (
        token.indexOf("--ds-btn") === 0 ||
        token.indexOf("--ds-input") === 0 ||
        token.indexOf("--ds-card") === 0 ||
        token.indexOf("--ds-chip") === 0 ||
        token.indexOf("--ds-table") === 0 ||
        token.indexOf("--ds-modal") === 0 ||
        token.indexOf("--ds-toast") === 0
      ) {
        return "Component token mapped directly to a specific UI element.";
      }
      return "Foundation token shared across this design system.";
    }

    function copyTextValue(text) {
      if (!text) return Promise.resolve(false);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard
          .writeText(text)
          .then(function () {
            return true;
          })
          .catch(function () {
            return false;
          });
      }
      const probe = doc.createElement("textarea");
      probe.value = text;
      probe.setAttribute("readonly", "readonly");
      probe.style.position = "fixed";
      probe.style.left = "-9999px";
      probe.style.top = "-9999px";
      doc.body.appendChild(probe);
      probe.select();
      const ok = doc.execCommand("copy");
      probe.remove();
      return Promise.resolve(!!ok);
    }

    function studioIconMarkup(kind) {
      const icons = {
        info: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><path d="M12 7.25h.01"></path></svg>',
        copy:
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="9" width="10" height="10" rx="2"></rect><rect x="5" y="5" width="10" height="10" rx="2"></rect></svg>',
        reset:
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 2.3-5.66"></path><path d="M4 5v4h4"></path></svg>',
        search:
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg>',
      };
      return icons[kind] || "";
    }

    function sanitizeThemeName(raw) {
      return (
        (raw || "custom-theme")
          .trim()
          .replace(/[^a-z0-9\-_]/gi, "-")
          .toLowerCase() || "custom-theme"
      );
    }

    function buildThemeBlock(themeName) {
      const lines = [':root[data-theme="' + themeName + '"] {'];
      controlMap.forEach(function (meta, token) {
        const value = getRawTokenValue(meta);
        lines.push("  " + token + ": " + value + ";");
      });
      lines.push("}");
      return lines.join("\n");
    }

    function addToast(kind, text) {
      const stack = doc.getElementById("toastStack");
      if (!stack) return;
      const node = doc.createElement("div");
      node.className = "ds-toast " + kind;
      node.textContent = text;
      stack.appendChild(node);
      win.setTimeout(function () {
        node.remove();
      }, 2600);
    }

    const studioComponentsApi = win.DesignSystemStudioComponents || null;
    if (studioComponentsApi && studioComponentsApi.initStudioComponents) {
      studioComponentsApi.initStudioComponents();
    }

    const studioWikiApi = win.DesignSystemStudioWiki || null;
    const studioDemosApi = win.DesignSystemStudioDemos || null;
    const studioPackagingApi = win.DesignSystemStudioPackaging || null;
    const studioIconsApi = win.DesignSystemStudioIcons || null;
    const studioShellApi = win.DesignSystemStudioShell || null;
    const studioBuilderUiApi = win.DesignSystemStudioBuilderUi || null;
    const studioBuilderEngineApi =
      win.DesignSystemStudioBuilderEngine || null;

    if (studioBuilderUiApi) {
      studioBuilderUiApi.initBuilderUi({
        tokenGroups: tokenGroups,
        renderBuilder: renderBuilder,
        builderGroupId: builderGroupId,
        builderPresetOwners: builderPresetOwners,
        builderGroupOwnerMap: builderGroupOwnerMap,
        builderState: builderState,
        humanLabel: humanLabel,
        tokenUsageHint: tokenUsageHint,
        studioIconMarkup: studioIconMarkup,
        controlMap: controlMap,
        getRawTokenValue: getRawTokenValue,
        copyTextValue: copyTextValue,
        addToast: addToast,
      });
    }

    const shellController =
      studioShellApi && studioShellApi.initStudioShell
        ? studioShellApi.initStudioShell()
        : null;

    if (studioWikiApi) {
      studioWikiApi.initGuideNav({
        shell:
          shellController ||
          (studioShellApi &&
          typeof studioShellApi.activatePanel === "function"
            ? studioShellApi
            : null),
      });
    }

    if (studioIconsApi) {
      studioIconsApi.initStudioIcons();
    }

    const wikiFrame = doc.getElementById("wikiFrame");
    const wikiNavButtons = Array.from(doc.querySelectorAll(".wiki-nav-btn"));
    const wikiController =
      studioWikiApi && wikiFrame && wikiNavButtons.length
        ? studioWikiApi.initWikiNavigation({
            root: root,
            frame: wikiFrame,
            navButtons: wikiNavButtons,
          })
        : null;

    if (studioBuilderEngineApi) {
      studioBuilderEngineApi.initBuilderEngine({
        root: root,
        themeSelect: themeSelect,
        familyPresetSelect: familyPresetSelect,
        huePresetSelect: huePresetSelect,
        schemePresetSelect: schemePresetSelect,
        stylePresetSelect: stylePresetSelect,
        typographyPresetSelect: typographyPresetSelect,
        scalePresetSelect: scalePresetSelect,
        texturePresetSelect: texturePresetSelect,
        autoApplyPresetToggle: autoApplyPresetToggle,
        autoApplyPresetKey: autoApplyPresetKey,
        resetConfirmKey: resetConfirmKey,
        baseThemePresetMap: baseThemePresetMap,
        buildColorBundle: buildColorBundle,
        inferTypographyPreset: inferTypographyPreset,
        inferTexturePreset: inferTexturePreset,
        schemePresets: schemePresets,
        stylePresets: stylePresets,
        scalePresets: scalePresets,
        typographyPresets: typographyPresets,
        texturePresets: texturePresets,
        clearOverrides: function () {
          root.removeAttribute("style");
        },
        syncControlsFromComputed: syncControlsFromComputed,
        sanitizeThemeName: sanitizeThemeName,
        buildThemeBlock: buildThemeBlock,
        studioPackagingApi: studioPackagingApi,
        onThemeChanged: function () {
          const activeWikiBtn = Array.from(
            doc.querySelectorAll(".wiki-nav-btn[data-doc]"),
          ).find(function (btn) {
            return btn.getAttribute("aria-pressed") === "true";
          });
          if (activeWikiBtn && wikiController) {
            wikiController.setActiveDoc(activeWikiBtn.getAttribute("data-doc"));
          }
        },
      });
    }

    const dropdown = doc.getElementById("actionsDropdown");
    const dropdownToggle = doc.getElementById("dropdownToggle");
    if (dropdown && dropdownToggle) {
      dropdownToggle.addEventListener("click", function () {
        const open = dropdown.classList.toggle("is-open");
        dropdownToggle.setAttribute("aria-expanded", String(open));
      });
    }

    const popover = doc.getElementById("helpPopover");
    const popoverToggle = doc.getElementById("popoverToggle");

    function positionPopover() {
      if (!popover || !popoverToggle) return;
      const panel = popover.querySelector(".ds-popover");
      if (!panel) return;
      const gap = 8;
      const vw = win.innerWidth;
      const vh = win.innerHeight;
      const triggerRect = popoverToggle.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const panelW = panelRect.width || 260;
      const panelH = panelRect.height || 120;
      const placeTop =
        vh - triggerRect.bottom - gap < panelH &&
        triggerRect.top - gap > vh - triggerRect.bottom - gap;
      const targetTop = placeTop
        ? triggerRect.top - panelH - gap
        : triggerRect.bottom + gap;
      let targetLeft = triggerRect.left;
      if (targetLeft + panelW > vw - gap) targetLeft = vw - gap - panelW;
      if (targetLeft < gap) targetLeft = gap;
      if (targetTop < gap) {
        panel.style.top = gap + "px";
      } else if (targetTop + panelH > vh - gap) {
        panel.style.top = Math.max(gap, vh - gap - panelH) + "px";
      } else {
        panel.style.top = targetTop + "px";
      }
      panel.style.left = targetLeft + "px";
    }

    function closePopover() {
      if (!popover || !popoverToggle) return;
      popover.classList.remove("is-open");
      popoverToggle.setAttribute("aria-expanded", "false");
    }

    if (popover && popoverToggle) {
      popoverToggle.addEventListener("click", function () {
        const willOpen = !popover.classList.contains("is-open");
        if (!willOpen) {
          closePopover();
          return;
        }
        positionPopover();
        popover.classList.add("is-open");
        popoverToggle.setAttribute("aria-expanded", "true");
      });
      win.addEventListener("resize", function () {
        if (popover.classList.contains("is-open")) positionPopover();
      });
      win.addEventListener(
        "scroll",
        function () {
          if (popover.classList.contains("is-open")) positionPopover();
        },
        { passive: true },
      );
    }

    doc.addEventListener("click", function (event) {
      if (dropdown && dropdownToggle && !dropdown.contains(event.target)) {
        dropdown.classList.remove("is-open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
      if (popover && !popover.contains(event.target)) closePopover();
    });

    const modal = doc.getElementById("modal");
    const drawer = doc.getElementById("drawer");
    const openModalBtn = doc.getElementById("openModalBtn");
    const closeModalBtn = doc.getElementById("closeModalBtn");
    const confirmModalBtn = doc.getElementById("confirmModalBtn");
    const openDrawerBtn = doc.getElementById("openDrawerBtn");
    const closeDrawerBtn = doc.getElementById("closeDrawerBtn");
    const tokenInfoDialog = doc.getElementById("tokenInfoDialog");
    const closeTokenInfoBtn = doc.getElementById("closeTokenInfoBtn");
    const toastSuccessBtn = doc.getElementById("toastSuccessBtn");
    const toastErrorBtn = doc.getElementById("toastErrorBtn");

    if (openModalBtn && modal) {
      openModalBtn.addEventListener("click", function () {
        modal.showModal();
      });
    }
    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener("click", function () {
        modal.close();
      });
    }
    if (confirmModalBtn && modal) {
      confirmModalBtn.addEventListener("click", function () {
        modal.close();
      });
    }
    if (openDrawerBtn && drawer) {
      openDrawerBtn.addEventListener("click", function () {
        drawer.showModal();
      });
    }
    if (closeDrawerBtn && drawer) {
      closeDrawerBtn.addEventListener("click", function () {
        drawer.close();
      });
    }
    if (closeTokenInfoBtn && tokenInfoDialog) {
      closeTokenInfoBtn.addEventListener("click", function () {
        tokenInfoDialog.close();
      });
    }
    if (toastSuccessBtn) {
      toastSuccessBtn.addEventListener("click", function () {
        addToast("success", "Saved successfully.");
      });
    }
    if (toastErrorBtn) {
      toastErrorBtn.addEventListener("click", function () {
        addToast("danger", "Action failed. Please retry.");
      });
    }

    if (studioDemosApi) {
      studioDemosApi.initStudioDemos();
    }

    initializedBootstrapApi = {
      addToast: addToast,
      buildThemeBlock: buildThemeBlock,
      copyTextValue: copyTextValue,
      sanitizeThemeName: sanitizeThemeName,
      studioIconMarkup: studioIconMarkup,
      tokenUsageHint: tokenUsageHint,
    };
    return initializedBootstrapApi;
  }

  win.DesignSystemStudioBootstrap = {
    initStudioBootstrap: initStudioBootstrap,
  };
})(window, document);
