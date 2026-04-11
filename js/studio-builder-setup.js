(function (win, doc) {
  let initializedBuilderSetup = null;

  function initBuilderSetup() {
    if (initializedBuilderSetup) return initializedBuilderSetup;

    const familyPresetSelect = doc.getElementById("familyPresetSelect");
    const huePresetSelect = doc.getElementById("huePresetSelect");
    const schemePresetSelect = doc.getElementById("schemePresetSelect");
    const stylePresetSelect = doc.getElementById("stylePresetSelect");
    const typographyPresetSelect = doc.getElementById(
      "typographyPresetSelect",
    );
    const scalePresetSelect = doc.getElementById("scalePresetSelect");
    const texturePresetSelect = doc.getElementById("texturePresetSelect");
    const autoApplyPresetToggle = doc.getElementById(
      "autoApplyPresetToggle",
    );

    if (familyPresetSelect) {
      familyPresetSelect.title =
        "Color family controls the tonal system (light/dark bias, contrast, saturation model).";
    }
    if (huePresetSelect) {
      huePresetSelect.title =
        "Hue controls the primary color identity applied to accent/state tokens.";
    }
    if (schemePresetSelect) {
      schemePresetSelect.title =
        "Scheme controls component-level color behavior and expressive accent logic.";
    }
    if (stylePresetSelect) {
      stylePresetSelect.title =
        "Style controls geometry, borders, depth, and interaction language.";
    }
    if (typographyPresetSelect) {
      typographyPresetSelect.title =
        "Typography controls font voice, type scale, and reading rhythm.";
    }
    if (scalePresetSelect) {
      scalePresetSelect.title =
        "Scale controls spacing and control heights only.";
    }
    if (texturePresetSelect) {
      texturePresetSelect.title =
        "Texture controls noise/gradient/blur dynamics layered over surfaces.";
    }

    initializedBuilderSetup = {
      familyPresetSelect: familyPresetSelect,
      huePresetSelect: huePresetSelect,
      schemePresetSelect: schemePresetSelect,
      stylePresetSelect: stylePresetSelect,
      typographyPresetSelect: typographyPresetSelect,
      scalePresetSelect: scalePresetSelect,
      texturePresetSelect: texturePresetSelect,
      autoApplyPresetToggle: autoApplyPresetToggle,
    };

    return initializedBuilderSetup;
  }

  win.DesignSystemStudioBuilderSetup = {
    initBuilderSetup: initBuilderSetup,
  };
})(window, document);
