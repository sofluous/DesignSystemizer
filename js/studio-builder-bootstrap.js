(function (win) {
  let initializedBuilderBootstrap = null;

  function initBuilderBootstrap(opts) {
    if (initializedBuilderBootstrap) return initializedBuilderBootstrap;

    const root = opts.root;

    const controlMap = new Map();

    const studioBuilderConfigApi =
      win.DesignSystemStudioBuilderConfig || null;
    const builderConfig =
      studioBuilderConfigApi && studioBuilderConfigApi.initBuilderConfig
        ? studioBuilderConfigApi.initBuilderConfig()
        : {
            tokenGroups: [],
            builderPresetOwners: [],
            builderGroupOwnerMap: {},
          };
    const tokenGroups = builderConfig.tokenGroups || [];
    const builderPresetOwners = builderConfig.builderPresetOwners || [];
    const builderGroupOwnerMap = builderConfig.builderGroupOwnerMap || {};

    const studioBuilderThemeDataApi =
      win.DesignSystemStudioBuilderThemeData || null;
    const builderThemeData =
      studioBuilderThemeDataApi &&
      studioBuilderThemeDataApi.initBuilderThemeData
        ? studioBuilderThemeDataApi.initBuilderThemeData()
        : {
            huePresets: {},
            colorFamilyPresets: {},
            stylePresets: {},
            scalePresets: {},
            texturePresets: {},
            schemePresets: {},
            typographyPresets: {},
            baseThemePresetMap: {},
          };
    const huePresets = builderThemeData.huePresets || {};
    const colorFamilyPresets = builderThemeData.colorFamilyPresets || {};
    const stylePresets = builderThemeData.stylePresets || {};
    const scalePresets = builderThemeData.scalePresets || {};
    const texturePresets = builderThemeData.texturePresets || {};
    const schemePresets = builderThemeData.schemePresets || {};
    const typographyPresets = builderThemeData.typographyPresets || {};
    const baseThemePresetMap = builderThemeData.baseThemePresetMap || {};

    const studioBuilderSetupApi =
      win.DesignSystemStudioBuilderSetup || null;
    const builderSetup =
      studioBuilderSetupApi && studioBuilderSetupApi.initBuilderSetup
        ? studioBuilderSetupApi.initBuilderSetup()
        : {};
    const familyPresetSelect = builderSetup.familyPresetSelect || null;
    const huePresetSelect = builderSetup.huePresetSelect || null;
    const schemePresetSelect = builderSetup.schemePresetSelect || null;
    const stylePresetSelect = builderSetup.stylePresetSelect || null;
    const typographyPresetSelect =
      builderSetup.typographyPresetSelect || null;
    const scalePresetSelect = builderSetup.scalePresetSelect || null;
    const texturePresetSelect = builderSetup.texturePresetSelect || null;
    const autoApplyPresetToggle =
      builderSetup.autoApplyPresetToggle || null;

    const studioBuilderControlsApi =
      win.DesignSystemStudioBuilderControls || null;
    const builderControls =
      studioBuilderControlsApi &&
      studioBuilderControlsApi.initBuilderControls
        ? studioBuilderControlsApi.initBuilderControls({
            root,
            controlMap,
          })
        : null;
    const syncControlsFromComputed = builderControls
      ? builderControls.syncControlsFromComputed
      : function () {};
    const applyControl = builderControls
      ? builderControls.applyControl
      : function () {};
    const getRawTokenValue = builderControls
      ? builderControls.getRawTokenValue
      : function () {
          return "";
        };

    const studioBuilderPresetsApi =
      win.DesignSystemStudioBuilderPresets || null;
    const builderPresetUtils =
      studioBuilderPresetsApi && studioBuilderPresetsApi.initBuilderPresets
        ? studioBuilderPresetsApi.initBuilderPresets({
            familyPresetSelect,
            huePresetSelect,
            schemePresetSelect,
            stylePresetSelect,
            typographyPresetSelect,
            scalePresetSelect,
            texturePresetSelect,
            colorFamilyPresets,
            huePresets,
            schemePresets,
            stylePresets,
            scalePresets,
            typographyPresets,
            texturePresets,
            baseThemePresetMap,
            applyControl: function (meta) {
              applyControl(meta);
            },
          })
        : null;
    const inferTexturePreset =
      builderPresetUtils && builderPresetUtils.inferTexturePreset
        ? builderPresetUtils.inferTexturePreset
        : function () {
            return "clean";
          };
    const inferTypographyPreset =
      builderPresetUtils && builderPresetUtils.inferTypographyPreset
        ? builderPresetUtils.inferTypographyPreset
        : function () {
            return "neutral-ui";
          };
    const buildColorBundle =
      builderPresetUtils && builderPresetUtils.buildColorBundle
        ? builderPresetUtils.buildColorBundle
        : function () {
            return {};
          };
    const applyShadowPreset =
      builderPresetUtils && builderPresetUtils.applyShadowPreset
        ? builderPresetUtils.applyShadowPreset
        : function () {};
    const builderGroupId =
      builderPresetUtils && builderPresetUtils.builderGroupId
        ? builderPresetUtils.builderGroupId
        : function (name) {
            return String(name || "");
          };
    const humanLabel =
      builderPresetUtils && builderPresetUtils.humanLabel
        ? builderPresetUtils.humanLabel
        : function (token) {
            return String(token || "");
          };

    const studioBuilderRendererApi =
      win.DesignSystemStudioBuilderRenderer || null;
    const builderState = {
      activeOwner: "__all__",
      activeGroup: "__all__",
      searchQuery: "",
    };
    const builderRenderer =
      studioBuilderRendererApi &&
      studioBuilderRendererApi.initBuilderRenderer
        ? studioBuilderRendererApi.initBuilderRenderer({
            tokenGroups,
            builderGroupOwnerMap,
            builderPresetOwners,
            builderState,
            builderGroupId,
            humanLabel,
            controlMap,
            applyControl,
            applyShadowPreset,
          })
        : null;
    const renderBuilder =
      builderRenderer && builderRenderer.renderBuilder
        ? builderRenderer.renderBuilder
        : function () {};

    initializedBuilderBootstrap = {
      renderBuilder,
      tokenGroups,
      builderGroupId,
      builderPresetOwners,
      builderGroupOwnerMap,
      builderState,
      humanLabel,
      controlMap,
      applyControl,
      applyShadowPreset,
      getRawTokenValue,
      syncControlsFromComputed,
      familyPresetSelect,
      huePresetSelect,
      schemePresetSelect,
      stylePresetSelect,
      typographyPresetSelect,
      scalePresetSelect,
      texturePresetSelect,
      autoApplyPresetToggle,
      baseThemePresetMap,
      buildColorBundle,
      inferTypographyPreset,
      inferTexturePreset,
      schemePresets,
      stylePresets,
      scalePresets,
      typographyPresets,
      texturePresets,
    };

    return initializedBuilderBootstrap;
  }

  win.DesignSystemStudioBuilderBootstrap = {
    initBuilderBootstrap: initBuilderBootstrap,
  };
})(window);
