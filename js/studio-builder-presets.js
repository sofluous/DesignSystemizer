(function (win, doc) {
  function initBuilderPresets(opts) {
    const familyPresetSelect = opts.familyPresetSelect;
    const huePresetSelect = opts.huePresetSelect;
    const schemePresetSelect = opts.schemePresetSelect;
    const stylePresetSelect = opts.stylePresetSelect;
    const typographyPresetSelect = opts.typographyPresetSelect;
    const scalePresetSelect = opts.scalePresetSelect;
    const texturePresetSelect = opts.texturePresetSelect;
    const colorFamilyPresets = opts.colorFamilyPresets || {};
    const huePresets = opts.huePresets || {};
    const schemePresets = opts.schemePresets || {};
    const stylePresets = opts.stylePresets || {};
    const scalePresets = opts.scalePresets || {};
    const typographyPresets = opts.typographyPresets || {};
    const texturePresets = opts.texturePresets || {};
    const baseThemePresetMap = opts.baseThemePresetMap || {};
    const applyControl = opts.applyControl || function () {};

    function fillPresetSelect(el, dict) {
      if (!el) return;
      Object.keys(dict).forEach(function (key) {
        const option = doc.createElement("option");
        option.value = key;
        option.textContent = key;
        el.appendChild(option);
      });
    }

    function inferTexturePreset(styleKey) {
      const map = {
        "base-default": "clean",
        terminal: "terminal-screen",
        technical: "clean",
        paper: "paper-grain",
        skeuo: "soft-gradient",
        glassmorph: "frosted-glass",
        material: "clean",
        "hud-glow": "wire-grid",
        neumorph: "soft-ambient",
        "eva-wire": "eva-wire-base",
        "eva-unit01": "eva-unit-base",
        "saturn-skeuo": "brushed-metal",
        "old-web": "portal-classic",
        "terminal-amber": "amber-screen",
        "candy-pop": "spectrum-wash",
        "complimentary-gradient": "spectrum-wash",
        "vaporwave-neon": "wire-grid",
        "holo-nocturne": "holo-dark",
        "oilslick-organic": "oilslick-dark",
        "graphic-signal": "poster-paper",
        "graphic-diagram": "poster-paper",
      };
      return map[styleKey] || "clean";
    }

    function inferTypographyPreset(styleKey) {
      const map = {
        "base-default": "neutral-ui",
        terminal: "terminal-glow",
        "terminal-amber": "terminal-glow",
        technical: "technical-mono",
        paper: "mint-humanist",
        skeuo: "mint-humanist",
        glassmorph: "neutral-ui",
        material: "neutral-ui",
        neumorph: "soft-display",
        "eva-wire": "eva-wire-sans",
        "eva-unit01": "eva-unit-sans",
        "saturn-skeuo": "saturn-euro",
        "old-web": "portal-ui",
        "graphic-signal": "poster-grotesk",
        "graphic-diagram": "poster-grotesk",
      };
      return map[styleKey] || "neutral-ui";
    }

    Object.keys(baseThemePresetMap).forEach(function (key) {
      if (!baseThemePresetMap[key].scheme) {
        baseThemePresetMap[key].scheme = "standard";
      }
      if (!baseThemePresetMap[key].typography) {
        baseThemePresetMap[key].typography = inferTypographyPreset(
          baseThemePresetMap[key].style,
        );
      }
      if (!baseThemePresetMap[key].texture) {
        baseThemePresetMap[key].texture = inferTexturePreset(
          baseThemePresetMap[key].style,
        );
      }
    });

    const paletteLockedStyles = new Set([]);

    function auditPresetConnectivity() {
      const issues = [];
      Object.entries(baseThemePresetMap).forEach(function (entry) {
        const themeName = entry[0];
        const combo = entry[1];
        if (!colorFamilyPresets[combo.family]) {
          issues.push(themeName + " missing family preset: " + combo.family);
        }
        if (!huePresets[combo.hue]) {
          issues.push(themeName + " missing hue preset: " + combo.hue);
        }
        if (!stylePresets[combo.style]) {
          issues.push(themeName + " missing style preset: " + combo.style);
        }
        if (!schemePresets[combo.scheme]) {
          issues.push(themeName + " missing scheme preset: " + combo.scheme);
        }
        if (!typographyPresets[combo.typography]) {
          issues.push(
            themeName + " missing typography preset: " + combo.typography,
          );
        }
        if (!scalePresets[combo.scale]) {
          issues.push(themeName + " missing scale preset: " + combo.scale);
        }
        if (!texturePresets[combo.texture]) {
          issues.push(themeName + " missing texture preset: " + combo.texture);
        }
      });
      if (issues.length) {
        console.warn("[ThemeBuilder] Preset connectivity issues:", issues);
      }
      return issues;
    }

    function auditStyleComposability() {
      const corePaletteTokens = new Set([
        "--ds-bg",
        "--ds-bg-elevated",
        "--ds-bg-raised",
        "--ds-bg-soft",
        "--ds-text",
        "--ds-text-muted",
        "--ds-text-inverse",
        "--ds-accent",
        "--ds-accent-strong",
        "--ds-border",
        "--ds-border-strong",
        "--ds-focus",
        "--ds-success",
        "--ds-warning",
        "--ds-danger",
        "--ds-info",
      ]);
      const issues = [];
      Object.entries(stylePresets).forEach(function (entry) {
        const styleName = entry[0];
        const bundle = entry[1];
        if (paletteLockedStyles.has(styleName)) return;
        Object.keys(bundle).forEach(function (token) {
          if (corePaletteTokens.has(token)) {
            issues.push(styleName + " hardcodes core palette token: " + token);
          }
        });
      });
      if (issues.length) {
        console.warn("[ThemeBuilder] Style composability issues:", issues);
      }
      return issues;
    }

    function hsl(h, s, l) {
      return (
        "hsl(" +
        Math.round(h) +
        " " +
        Math.round(s) +
        "% " +
        Math.round(l) +
        "%)"
      );
    }

    function clamp(v, min, max) {
      return Math.min(max, Math.max(min, v));
    }

    function rotate(h, d) {
      return (h + d + 360) % 360;
    }

    function hueEnergyLift(h) {
      const hue = ((h % 360) + 360) % 360;
      if (hue >= 40 && hue <= 72) return 0;
      if (hue < 20 || hue > 330) return 8;
      if (hue < 40) return 4;
      if (hue <= 170) return 5;
      if (hue <= 260) return 12;
      return 8;
    }

    function hslToRgb(h, s, l) {
      const hue = ((h % 360) + 360) % 360;
      const sat = clamp(s, 0, 100) / 100;
      const lig = clamp(l, 0, 100) / 100;
      const c = (1 - Math.abs(2 * lig - 1)) * sat;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = lig - c / 2;
      let r1 = 0;
      let g1 = 0;
      let b1 = 0;
      if (hue < 60) {
        r1 = c;
        g1 = x;
      } else if (hue < 120) {
        r1 = x;
        g1 = c;
      } else if (hue < 180) {
        g1 = c;
        b1 = x;
      } else if (hue < 240) {
        g1 = x;
        b1 = c;
      } else if (hue < 300) {
        r1 = x;
        b1 = c;
      } else {
        r1 = c;
        b1 = x;
      }
      return [r1 + m, g1 + m, b1 + m];
    }

    function hexToRgb(hex) {
      const clean = (hex || "").trim().replace("#", "");
      if (!/^[0-9a-f]{6}$/i.test(clean)) return [0, 0, 0];
      return [
        parseInt(clean.slice(0, 2), 16) / 255,
        parseInt(clean.slice(2, 4), 16) / 255,
        parseInt(clean.slice(4, 6), 16) / 255,
      ];
    }

    function luminance(rgb) {
      const toLinear = function (c) {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      const linear = rgb.map(toLinear);
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }

    function contrastRatio(rgbA, rgbB) {
      const l1 = luminance(rgbA);
      const l2 = luminance(rgbB);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function hueProfile(hueKey) {
      const hue = huePresets[hueKey] || huePresets.cyan;
      if (typeof hue.h === "number") return { h: hue.h, neutral: false };
      const map = {
        gray: 220,
        steel: 210,
        slate: 230,
        black: 220,
        white: 45,
      };
      return { h: map[hue.neutral] || 200, neutral: true };
    }

    function buildColorBundle(familyKey, hueKey) {
      const fam = colorFamilyPresets[familyKey] || colorFamilyPresets.bold;
      const hue = hueProfile(hueKey);
      const h = hue.h;
      const sat = clamp(
        hue.neutral ? Math.max(6, fam.sat * 0.28) : fam.sat,
        4,
        96,
      );
      const aSat = clamp(
        hue.neutral ? Math.max(4, fam.accentSat * 0.25) : fam.accentSat,
        4,
        100,
      );
      const isLight = fam.mode === "light";
      let surfaceSatBg = clamp(sat * 0.22, 5, 34);
      let surfaceSatElevated = clamp(sat * 0.24, 6, 36);
      let surfaceSatRaised = clamp(sat * 0.3, 8, 40);
      let surfaceSatSoft = clamp(sat * 0.36, 10, 46);
      let borderSat = clamp(sat * 0.26, 8, 36);
      let borderStrongSat = clamp(sat * 0.34, 12, 44);
      let accentL = fam.accentL;
      let textSat = isLight ? Math.max(6, sat * 0.18) : Math.max(8, sat * 0.24);
      let mutedTextSat = clamp(sat * 0.2, 8, 30);
      if (familyKey === "cathode" || familyKey === "electric") {
        textSat = clamp(sat * 0.74, 34, 92);
        mutedTextSat = clamp(sat * 0.52, 20, 68);
      } else if (familyKey === "signal") {
        textSat = clamp(sat * 0.52, 24, 82);
        mutedTextSat = clamp(sat * 0.36, 16, 56);
      } else if (familyKey === "race-ui") {
        surfaceSatBg = clamp(sat * 0.9, 64, 96);
        surfaceSatElevated = clamp(sat * 0.035, 1, 5);
        surfaceSatRaised = clamp(sat * 0.05, 2, 7);
        surfaceSatSoft = clamp(sat * 0.07, 3, 9);
        borderSat = clamp(sat * 0.04, 2, 6);
        borderStrongSat = clamp(sat * 0.05, 2, 7);
        textSat = clamp(sat * 0.05, 2, 7);
        mutedTextSat = clamp(sat * 0.08, 4, 10);
        accentL = clamp(fam.accentL + hueEnergyLift(h), 28, 66);
      }
      const textColor = hsl(h, textSat, fam.textL);
      const textInverseColor = isLight ? "#f6fbff" : "#0f1216";
      const primaryBgColor = hsl(h, aSat, accentL);
      const textContrast = contrastRatio(
        hslToRgb(h, textSat, fam.textL),
        hslToRgb(h, aSat, accentL),
      );
      const inverseContrast = contrastRatio(
        hexToRgb(textInverseColor),
        hslToRgb(h, aSat, accentL),
      );
      const primaryTextColor =
        inverseContrast >= textContrast ? textInverseColor : textColor;
      const bundle = {
        "--ds-bg": hsl(h, surfaceSatBg, fam.bgL),
        "--ds-bg-elevated": hsl(h, surfaceSatElevated, fam.elevL),
        "--ds-bg-raised": hsl(h, surfaceSatRaised, fam.raisedL),
        "--ds-bg-soft": hsl(h, surfaceSatSoft, fam.softL),
        "--ds-text": textColor,
        "--ds-text-muted": hsl(h, mutedTextSat, fam.mutedL),
        "--ds-text-inverse": textInverseColor,
        "--ds-border": hsl(h, borderSat, fam.borderL),
        "--ds-border-strong": hsl(h, borderStrongSat, fam.borderStrongL),
        "--ds-accent": hsl(h, aSat, accentL),
        "--ds-accent-strong": hsl(
          h,
          aSat,
          clamp(accentL + (isLight ? -9 : 8), 6, 94),
        ),
        "--ds-accent-alt":
          "color-mix(in oklab, var(--ds-accent) 68%, var(--ds-focus) 32%)",
        "--ds-accent-alt-strong":
          "color-mix(in oklab, var(--ds-accent-alt) 72%, black 28%)",
        "--ds-focus": hsl(
          h,
          clamp(aSat * 0.92, 0, 100),
          clamp(accentL + (isLight ? -5 : 16), 6, 96),
        ),
        "--ds-success": hsl(
          rotate(h, 118),
          clamp(aSat * 0.74, 20, 95),
          clamp(accentL + (isLight ? -8 : 8), 8, 90),
        ),
        "--ds-warning": hsl(
          rotate(h, 54),
          clamp(aSat * 0.78, 20, 95),
          clamp(accentL + (isLight ? -2 : 10), 8, 90),
        ),
        "--ds-danger": hsl(
          rotate(h, -34),
          clamp(aSat * 0.8, 20, 95),
          clamp(accentL + (isLight ? -1 : 10), 8, 90),
        ),
        "--ds-info": hsl(
          rotate(h, 18),
          clamp(aSat * 0.72, 20, 95),
          clamp(accentL + (isLight ? -4 : 9), 8, 90),
        ),
        "--ds-btn-primary-bg": primaryBgColor,
        "--ds-btn-primary-bg-hover": hsl(
          h,
          aSat,
          clamp(accentL + (isLight ? -7 : 7), 6, 95),
        ),
        "--ds-btn-primary-border": hsl(
          h,
          clamp(aSat * 0.9, 0, 100),
          clamp(accentL + (isLight ? -13 : 2), 6, 95),
        ),
        "--ds-btn-primary-text": primaryTextColor,
        "--ds-btn-tertiary-bg":
          "color-mix(in oklab, var(--ds-accent-alt) 18%, var(--ds-bg-raised))",
        "--ds-btn-tertiary-bg-hover":
          "color-mix(in oklab, var(--ds-btn-tertiary-bg) 82%, var(--ds-accent-alt) 18%)",
        "--ds-btn-tertiary-border":
          "color-mix(in oklab, var(--ds-accent-alt-strong) 62%, var(--ds-border) 38%)",
        "--ds-btn-tertiary-text": "var(--ds-accent-alt)",
        "--ds-native-color-scheme": isLight ? "light" : "dark",
        "--ds-native-icon-filter": isLight
          ? "none"
          : "invert(1) brightness(1.06)",
        "--ds-native-icon-opacity": isLight ? "0.86" : "0.92",
        "--ds-bg-overlay": isLight
          ? "rgba(24,26,30,0.15)"
          : "rgba(5,9,15,0.72)",
      };
      if (familyKey === "electric") {
        bundle["--ds-bg-overlay"] = "rgba(2,7,14,0.8)";
        bundle["--ds-focus"] = hsl(h, 100, 82);
      }
      if (familyKey === "sunset") {
        bundle["--ds-bg-overlay"] = "rgba(20,7,3,0.75)";
      }
      if (familyKey === "frost") {
        bundle["--ds-bg-overlay"] = "rgba(24,38,58,0.18)";
      }
      if (familyKey === "neumorph") {
        bundle["--ds-bg-overlay"] = "rgba(73,84,104,0.24)";
      }
      if (familyKey === "signal") {
        bundle["--ds-bg-overlay"] = "rgba(2,3,6,0.84)";
      }
      if (familyKey === "alloy") {
        bundle["--ds-bg-overlay"] = "rgba(9,10,14,0.66)";
      }
      if (familyKey === "race-ui") {
        bundle["--ds-bg-overlay"] = "rgba(14,12,8,0.28)";
      }
      if (familyKey === "monochrome" || familyKey === "noir") {
        bundle["--ds-success"] = bundle["--ds-accent"];
        bundle["--ds-warning"] = bundle["--ds-accent-strong"];
        bundle["--ds-danger"] = bundle["--ds-accent"];
        bundle["--ds-info"] = bundle["--ds-accent-strong"];
      }
      return bundle;
    }

    const shadowPresets = {
      flat: { x: 0, y: 0, blur: 0, spread: 0, color: "#000000", inset: false },
      soft: { x: 0, y: 4, blur: 14, spread: 0, color: "#000000", inset: false },
      hard: { x: 0, y: 2, blur: 0, spread: 0, color: "#000000", inset: false },
      glow: {
        x: 0,
        y: 0,
        blur: 16,
        spread: 0,
        color: "#66ccff",
        inset: false,
      },
      inset: { x: 0, y: 1, blur: 3, spread: 0, color: "#000000", inset: true },
    };

    function applyShadowPreset(meta, key) {
      const preset = shadowPresets[key];
      if (!preset) return;
      meta.x.value = preset.x;
      meta.y.value = preset.y;
      meta.blur.value = preset.blur;
      meta.spread.value = preset.spread;
      meta.color.value = preset.color;
      meta.inset.checked = preset.inset;
      applyControl(meta);
    }

    function builderGroupId(name) {
      return String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function humanLabel(token) {
      return token.replace("--ds-", "").replace(/-/g, " ");
    }

    fillPresetSelect(familyPresetSelect, colorFamilyPresets);
    fillPresetSelect(huePresetSelect, huePresets);
    fillPresetSelect(schemePresetSelect, schemePresets);
    fillPresetSelect(stylePresetSelect, stylePresets);
    fillPresetSelect(typographyPresetSelect, typographyPresets);
    fillPresetSelect(scalePresetSelect, scalePresets);
    fillPresetSelect(texturePresetSelect, texturePresets);

    if (familyPresetSelect) familyPresetSelect.value = "bold";
    if (huePresetSelect) huePresetSelect.value = "cyan";
    if (schemePresetSelect) schemePresetSelect.value = "standard";
    if (stylePresetSelect) stylePresetSelect.value = "material";
    if (typographyPresetSelect) typographyPresetSelect.value = "neutral-ui";
    if (scalePresetSelect) scalePresetSelect.value = "standard";
    if (texturePresetSelect) texturePresetSelect.value = "clean";

    auditPresetConnectivity();
    auditStyleComposability();

    return {
      inferTexturePreset: inferTexturePreset,
      inferTypographyPreset: inferTypographyPreset,
      buildColorBundle: buildColorBundle,
      applyShadowPreset: applyShadowPreset,
      builderGroupId: builderGroupId,
      humanLabel: humanLabel,
    };
  }

  win.DesignSystemStudioBuilderPresets = {
    initBuilderPresets: initBuilderPresets,
  };
})(window, document);
