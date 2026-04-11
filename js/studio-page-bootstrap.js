(function (win, doc) {
  let initializedPageBootstrap = null;

  function initStudioPageBootstrap() {
    if (initializedPageBootstrap) return initializedPageBootstrap;

    const root = doc.documentElement;
    const storageKey = "ds-theme";
    const resetConfirmKey = "ds-skip-reset-confirm";
    const autoApplyPresetKey = "ds-auto-apply-presets";
    const themeSelect = doc.getElementById("themeSelect");
    const defaultTheme = root.getAttribute("data-theme") || "steel-night";

    if (win.DesignSystemThemeSelector && themeSelect) {
      win.DesignSystemThemeSelector.initThemeSelector(themeSelect, {
            root,
            storageKey,
            defaultTheme,
      });
    }

    const studioBuilderBootstrapApi =
      win.DesignSystemStudioBuilderBootstrap || null;
    const builderBootstrap =
      studioBuilderBootstrapApi &&
      studioBuilderBootstrapApi.initBuilderBootstrap
        ? studioBuilderBootstrapApi.initBuilderBootstrap({
            root,
          })
        : {};

    const renderBuilder =
      builderBootstrap.renderBuilder ||
      function () {};

    const studioBootstrapApi = win.DesignSystemStudioBootstrap || null;
    if (studioBootstrapApi && studioBootstrapApi.initStudioBootstrap) {
      studioBootstrapApi.initStudioBootstrap({
        root,
        renderBuilder,
        tokenGroups: builderBootstrap.tokenGroups || [],
        builderGroupId:
          builderBootstrap.builderGroupId ||
          function (name) {
            return String(name || "");
          },
        builderPresetOwners: builderBootstrap.builderPresetOwners || [],
        builderGroupOwnerMap: builderBootstrap.builderGroupOwnerMap || {},
        builderState:
          builderBootstrap.builderState || {
            activeOwner: "__all__",
            activeGroup: "__all__",
            searchQuery: "",
          },
        humanLabel:
          builderBootstrap.humanLabel ||
          function (token) {
            return String(token || "");
          },
        controlMap: builderBootstrap.controlMap || new Map(),
        applyControl:
          builderBootstrap.applyControl ||
          function () {},
        applyShadowPreset:
          builderBootstrap.applyShadowPreset ||
          function () {},
        getRawTokenValue:
          builderBootstrap.getRawTokenValue ||
          function () {
            return "";
          },
        syncControlsFromComputed:
          builderBootstrap.syncControlsFromComputed ||
          function () {},
        themeSelect: themeSelect,
        familyPresetSelect: builderBootstrap.familyPresetSelect || null,
        huePresetSelect: builderBootstrap.huePresetSelect || null,
        schemePresetSelect: builderBootstrap.schemePresetSelect || null,
        stylePresetSelect: builderBootstrap.stylePresetSelect || null,
        typographyPresetSelect:
          builderBootstrap.typographyPresetSelect || null,
        scalePresetSelect: builderBootstrap.scalePresetSelect || null,
        texturePresetSelect:
          builderBootstrap.texturePresetSelect || null,
        autoApplyPresetToggle:
          builderBootstrap.autoApplyPresetToggle || null,
        autoApplyPresetKey,
        resetConfirmKey,
        baseThemePresetMap: builderBootstrap.baseThemePresetMap || {},
        buildColorBundle:
          builderBootstrap.buildColorBundle ||
          function () {
            return {};
          },
        inferTypographyPreset:
          builderBootstrap.inferTypographyPreset ||
          function () {
            return "neutral-ui";
          },
        inferTexturePreset:
          builderBootstrap.inferTexturePreset ||
          function () {
            return "clean";
          },
        schemePresets: builderBootstrap.schemePresets || {},
        stylePresets: builderBootstrap.stylePresets || {},
        scalePresets: builderBootstrap.scalePresets || {},
        typographyPresets: builderBootstrap.typographyPresets || {},
        texturePresets: builderBootstrap.texturePresets || {},
      });
    }

    initializedPageBootstrap = {
      builderBootstrap: builderBootstrap,
      themeSelect: themeSelect,
    };

    return initializedPageBootstrap;
  }

  win.DesignSystemStudioPageBootstrap = {
    initStudioPageBootstrap: initStudioPageBootstrap,
  };
})(window, document);
