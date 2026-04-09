;(function (win, doc) {
  const builderGroupDescriptions = {
    "Semantic Colors":
      "Core semantic tokens for surfaces, text, borders, accent, and feedback colors.",
    Typography:
      "Font families, scale, line-height, and label behavior that shape readability.",
    "Geometry and Borders":
      "Corner shape, border weight, and line treatment across components.",
    "Density and Layout":
      "Spacing rhythm, control sizing, and structural layout cadence.",
    "Surface and Depth":
      "Material treatment, shadows, textures, blur, and layered surface behavior.",
    "Buttons and Inputs":
      "Direct component tokens for buttons, fields, and interactive form elements.",
    "Motion and Layers":
      "Animation timing, motion behavior, and elevation ordering.",
    "App Layout and Utility":
      "Shell-level layout primitives, rails, panels, and shared utility surfaces.",
    "Native Controls":
      "Browser-native inputs, indicators, and control-specific styling hooks.",
    "Chips and Scrollbars":
      "Compact status tokens, chips, badges, and scrolling affordances.",
  };

  const builderSectionDefinitions = {
    "Semantic Colors": [
      {
        title: "Surfaces",
        description: "Global app and panel backgrounds.",
        match: (token) => token.indexOf("--ds-bg") === 0,
      },
      {
        title: "Text",
        description: "Readable foreground, muted, and inverse text.",
        match: (token) => token.indexOf("--ds-text") === 0,
      },
      {
        title: "Accent and Focus",
        description: "Primary highlight and keyboard focus language.",
        match: (token) =>
          token.indexOf("--ds-accent") === 0 || token === "--ds-focus",
      },
      {
        title: "Feedback",
        description: "Success, warning, danger, and info states.",
        match: (token) =>
          [
            "--ds-success",
            "--ds-warning",
            "--ds-danger",
            "--ds-info",
          ].includes(token),
      },
      {
        title: "Borders and Native Icons",
        description: "Structural borders and browser-supplied indicator contrast.",
        match: (token) =>
          token.indexOf("--ds-border") === 0 || token.indexOf("--ds-native") === 0,
      },
    ],
    Typography: [
      {
        title: "Font Families",
        description: "Brand voice for primary, mono, and heading styles.",
        match: (token) => token.indexOf("--ds-font") === 0,
      },
      {
        title: "Type Scale",
        description: "Font sizes and line-height rhythm.",
        match: (token) =>
          token.indexOf("--ds-fs") === 0 || token.indexOf("--ds-lh") === 0,
      },
      {
        title: "Labels and Case",
        description: "Uppercase behavior and spacing for metadata labels.",
        match: (token) => token.indexOf("--ds-label") === 0,
      },
    ],
    "Geometry and Borders": [
      {
        title: "Radius",
        description: "How soft or technical corners feel.",
        match: (token) => token.indexOf("--ds-radius") === 0,
      },
      {
        title: "Border Construction",
        description: "Weight and style of outlines across the system.",
        match: (token) =>
          token === "--ds-border-w" || token === "--ds-border-style",
      },
    ],
    "Density and Layout": [
      {
        title: "Spacing Rhythm",
        description: "The base spatial cadence used between elements.",
        match: (token) => token.indexOf("--ds-space") === 0,
      },
      {
        title: "Layout Structure",
        description: "Panel widths, grid gaps, and shell spacing.",
        match: (token) =>
          token.indexOf("--ds-layout") === 0 || token.indexOf("--ds-hud-card") === 0,
      },
      {
        title: "Control Sizing",
        description: "Core control heights and card padding.",
        match: (token) =>
          token.indexOf("--ds-control-h") === 0 || token === "--ds-card-pad",
      },
    ],
    "Surface and Depth": [
      {
        title: "Shadows",
        description: "Elevation, inset depth, and hover/press feedback.",
        match: (token) => token.indexOf("--ds-shadow") === 0,
      },
      {
        title: "Material Layers",
        description: "Surface overlays, blur, and texture behavior.",
        match: (token) =>
          token.indexOf("--ds-body-") === 0 ||
          token.indexOf("--ds-card-") === 0 ||
          token.indexOf("--ds-control-") === 0 ||
          token.indexOf("--ds-texture-") === 0,
      },
    ],
    "Buttons and Inputs": [
      {
        title: "Buttons",
        description: "Primary, secondary, tertiary, and icon action tokens.",
        match: (token) => token.indexOf("--ds-btn") === 0,
      },
      {
        title: "Inputs",
        description: "Field surfaces, text, icons, and placeholder behavior.",
        match: (token) => token.indexOf("--ds-input") === 0,
      },
      {
        title: "Selection and Form Controls",
        description: "Checks, radios, switches, ranges, and helper controls.",
        match: (token) =>
          token.indexOf("--ds-check") === 0 ||
          token.indexOf("--ds-radio") === 0 ||
          token.indexOf("--ds-switch") === 0 ||
          token.indexOf("--ds-range") === 0 ||
          token.indexOf("--ds-spin") === 0,
      },
    ],
    "Motion and Layers": [
      {
        title: "Timing and Easing",
        description: "Motion duration and easing curves.",
        match: (token) =>
          token.indexOf("--ds-dur") === 0 || token.indexOf("--ds-ease") === 0,
      },
      {
        title: "Interaction Motion",
        description: "Transforms and movement on press or hover.",
        match: (token) =>
          token.indexOf("--ds-btn-press") === 0 ||
          token.indexOf("--ds-popover-offset") === 0 ||
          token.indexOf("--ds-toast-offset") === 0,
      },
      {
        title: "Layer Order",
        description: "Z-index and stacking behavior for overlays.",
        match: (token) => token.indexOf("--ds-z-") === 0,
      },
    ],
    "App Layout and Utility": [
      {
        title: "App Shell",
        description: "Rail, side panel, toolbar, and shell behavior.",
        match: (token) =>
          token.indexOf("--ds-rail") === 0 ||
          token.indexOf("--ds-sidebar") === 0 ||
          token.indexOf("--ds-toolbar") === 0 ||
          token.indexOf("--ds-app") === 0,
      },
      {
        title: "Cards and Utility Surfaces",
        description: "Reusable shell components and utility overlays.",
        match: (token) =>
          token.indexOf("--ds-card") === 0 ||
          token.indexOf("--ds-modal") === 0 ||
          token.indexOf("--ds-drawer") === 0 ||
          token.indexOf("--ds-toast") === 0 ||
          token.indexOf("--ds-popover") === 0 ||
          token.indexOf("--ds-dropdown") === 0,
      },
    ],
    "Native Controls": [
      {
        title: "Date and Time",
        description: "Native field icons and built-in browser affordances.",
        match: (token) =>
          token.indexOf("--ds-native") === 0 || token.indexOf("--ds-spin") === 0,
      },
    ],
    "Chips and Scrollbars": [
      {
        title: "Chips and Badges",
        description: "Compact status tokens, tags, and low-footprint indicators.",
        match: (token) =>
          token.indexOf("--ds-chip") === 0 ||
          token.indexOf("--ds-badge") === 0 ||
          token.indexOf("--ds-pill") === 0,
      },
      {
        title: "Scrollbars",
        description:
          "Track and thumb behavior for horizontal and vertical scrolling.",
        match: (token) => token.indexOf("--ds-scroll") === 0,
      },
    ],
  };

  function getBuilderSectionDefinition(groupName, token) {
    const defs = builderSectionDefinitions[groupName] || [];
    for (let i = 0; i < defs.length; i += 1) {
      if (defs[i].match(token)) return defs[i];
    }
    return {
      title: "Additional Tokens",
      description: "Supporting tokens for this property set.",
    };
  }

  function initBuilderRenderer(options) {
    const tokenGroups = options.tokenGroups;
    const builderGroupOwnerMap = options.builderGroupOwnerMap;
    const builderPresetOwners = options.builderPresetOwners;
    const builderState = options.builderState;
    const builderGroupId = options.builderGroupId;
    const humanLabel = options.humanLabel;
    const controlMap = options.controlMap;
    const applyControl = options.applyControl;
    const applyShadowPreset = options.applyShadowPreset;

    function renderBuilder() {
      const host = doc.getElementById("builderGroups");
      if (!host) return;
      host.innerHTML = "";
      tokenGroups.forEach((group) => {
        const ownerKey = builderGroupOwnerMap[group.name] || "__all__";
        const ownerLabel =
          builderPresetOwners.find((owner) => owner.key === ownerKey)?.label ||
          "Mixed";
        const card = doc.createElement("article");
        card.className = "ds-card builder-group";
        card.setAttribute("data-group-name", group.name);
        card.setAttribute("data-group-owner", ownerKey);
        card.id = "builder-group-" + builderGroupId(group.name);

        const titleWrap = doc.createElement("div");
        titleWrap.className = "builder-group-title-wrap";
        const kicker = doc.createElement("div");
        kicker.className = "builder-group-kicker";
        const owner = doc.createElement("span");
        owner.className = "builder-group-owner";
        owner.textContent = ownerLabel;
        kicker.appendChild(owner);
        const count = doc.createElement("span");
        count.className = "builder-group-count";
        count.textContent = group.controls.length + " tokens";
        kicker.appendChild(count);
        titleWrap.appendChild(kicker);
        const title = doc.createElement("h3");
        title.className = "ds-card-title";
        title.textContent = group.name;
        titleWrap.appendChild(title);
        const subtitle = doc.createElement("p");
        subtitle.className = "ds-muted builder-group-subtitle";
        subtitle.textContent =
          builderGroupDescriptions[group.name] ||
          "Token controls for this area of the system.";
        titleWrap.appendChild(subtitle);
        card.appendChild(titleWrap);

        const sections = new Map();
        let firstSection = true;
        group.controls.forEach((control) => {
          const sectionDef = getBuilderSectionDefinition(group.name, control.token);
          let sectionParts = sections.get(sectionDef.title);
          if (!sectionParts) {
            const sectionHost = doc.createElement("details");
            sectionHost.className = "builder-section";
            sectionHost.setAttribute("data-builder-section", sectionDef.title);
            sectionHost.open = firstSection;
            firstSection = false;
            sectionHost.addEventListener("toggle", function () {
              if (!sectionHost.open) return;
              const searchActive = builderState.searchQuery.trim().length > 0;
              if (searchActive) return;
              card.querySelectorAll(".builder-section").forEach((otherSection) => {
                if (otherSection !== sectionHost) otherSection.open = false;
              });
            });
            const summary = doc.createElement("summary");
            summary.className = "builder-section-summary";
            const sectionHead = doc.createElement("div");
            sectionHead.className = "builder-section-head";
            const sectionTitle = doc.createElement("div");
            sectionTitle.className = "builder-section-title";
            sectionTitle.textContent = sectionDef.title;
            sectionHead.appendChild(sectionTitle);
            if (sectionDef.description) {
              const sectionCopy = doc.createElement("p");
              sectionCopy.className = "builder-section-copy";
              sectionCopy.textContent = sectionDef.description;
              sectionHead.appendChild(sectionCopy);
            }
            summary.appendChild(sectionHead);
            sectionHost.appendChild(summary);
            const sectionBody = doc.createElement("div");
            sectionBody.className = "builder-section-body";
            sectionHost.appendChild(sectionBody);
            sectionParts = { host: sectionHost, body: sectionBody };
            sections.set(sectionDef.title, sectionParts);
            card.appendChild(sectionHost);
          }

          const field = doc.createElement("div");
          field.className = "builder-field";
          field.dataset.searchText = (
            humanLabel(control.token) +
            " " +
            control.token +
            " " +
            sectionDef.title +
            " " +
            group.name +
            " " +
            ownerLabel
          ).toLowerCase();
          const label = doc.createElement("label");
          label.textContent = humanLabel(control.token);
          field.appendChild(label);

          let main;
          let extra;
          let meta;
          if (control.type === "color") {
            const row = doc.createElement("div");
            row.className = "builder-field-row";
            main = doc.createElement("input");
            main.type = "color";
            main.className = "builder-color";
            extra = doc.createElement("input");
            extra.type = "text";
            extra.className = "ds-input";
            row.appendChild(main);
            row.appendChild(extra);
            field.appendChild(row);
            meta = {
              token: control.token,
              type: control.type,
              unit: control.unit || "",
              main,
              extra,
            };
            main.addEventListener("input", () => applyControl(meta, "picker"));
            extra.addEventListener("input", () => applyControl(meta, "text"));
          } else if (control.type === "shadow") {
            const grid = doc.createElement("div");
            grid.className = "builder-shadow-grid";
            const x = doc.createElement("input");
            x.className = "ds-input";
            x.type = "number";
            x.step = "1";
            const y = doc.createElement("input");
            y.className = "ds-input";
            y.type = "number";
            y.step = "1";
            const blur = doc.createElement("input");
            blur.className = "ds-input";
            blur.type = "number";
            blur.step = "1";
            const spread = doc.createElement("input");
            spread.className = "ds-input";
            spread.type = "number";
            spread.step = "1";
            x.placeholder = "x";
            y.placeholder = "y";
            blur.placeholder = "blur";
            spread.placeholder = "spread";
            grid.appendChild(x);
            grid.appendChild(y);
            grid.appendChild(blur);
            grid.appendChild(spread);
            field.appendChild(grid);
            const compact = doc.createElement("div");
            compact.className = "builder-shadow-grid compact";
            const color = doc.createElement("input");
            color.type = "color";
            color.className = "builder-color";
            const insetWrap = doc.createElement("label");
            insetWrap.className = "builder-shadow-flag";
            const inset = doc.createElement("input");
            inset.type = "checkbox";
            insetWrap.appendChild(inset);
            insetWrap.appendChild(doc.createTextNode("Inset"));
            compact.appendChild(color);
            compact.appendChild(insetWrap);
            field.appendChild(compact);
            const presets = doc.createElement("div");
            presets.className = "builder-preset-row";
            [
              ["flat", "Flat"],
              ["soft", "Soft"],
              ["hard", "Hard"],
              ["glow", "Glow"],
              ["inset", "Inset"],
            ].forEach((pair) => {
              const btn = doc.createElement("button");
              btn.type = "button";
              btn.className = "ds-btn";
              btn.textContent = pair[1];
              btn.addEventListener("click", () => applyShadowPreset(meta, pair[0]));
              presets.appendChild(btn);
            });
            field.appendChild(presets);
            meta = { token: control.token, type: "shadow", x, y, blur, spread, color, inset };
            [x, y, blur, spread, color, inset].forEach((el) =>
              el.addEventListener("input", () => applyControl(meta)),
            );
          } else if (control.type === "rgba") {
            const grid = doc.createElement("div");
            grid.className = "builder-multi-grid";
            const r = doc.createElement("input");
            r.className = "ds-input";
            r.type = "number";
            r.min = "0";
            r.max = "255";
            r.step = "1";
            r.placeholder = "R";
            const g = doc.createElement("input");
            g.className = "ds-input";
            g.type = "number";
            g.min = "0";
            g.max = "255";
            g.step = "1";
            g.placeholder = "G";
            const b = doc.createElement("input");
            b.className = "ds-input";
            b.type = "number";
            b.min = "0";
            b.max = "255";
            b.step = "1";
            b.placeholder = "B";
            const a = doc.createElement("input");
            a.className = "ds-input";
            a.type = "number";
            a.min = "0";
            a.max = "1";
            a.step = "0.01";
            a.placeholder = "A";
            [r, g, b, a].forEach((el) => grid.appendChild(el));
            field.appendChild(grid);
            meta = { token: control.token, type: "rgba", r, g, b, a };
            [r, g, b, a].forEach((el) =>
              el.addEventListener("input", () => applyControl(meta)),
            );
          } else if (control.type === "paint") {
            const row = doc.createElement("div");
            row.className = "builder-field-row single";
            const mode = doc.createElement("select");
            mode.className = "ds-select";
            [
              ["solid", "Solid"],
              ["gradient", "Linear"],
            ].forEach((pair) => {
              const opt = doc.createElement("option");
              opt.value = pair[0];
              opt.textContent = pair[1];
              mode.appendChild(opt);
            });
            row.appendChild(mode);
            field.appendChild(row);
            const grid = doc.createElement("div");
            grid.className = "builder-multi-grid";
            const angle = doc.createElement("input");
            angle.className = "ds-input";
            angle.type = "number";
            angle.step = "1";
            angle.placeholder = "angle";
            const c1 = doc.createElement("input");
            c1.type = "color";
            c1.className = "builder-color";
            const c2 = doc.createElement("input");
            c2.type = "color";
            c2.className = "builder-color";
            const pad = doc.createElement("div");
            [angle, c1, c2, pad].forEach((el) => grid.appendChild(el));
            field.appendChild(grid);
            meta = { token: control.token, type: "paint", mode, angle, c1, c2 };
            [mode, angle, c1, c2].forEach((el) =>
              el.addEventListener("input", () => applyControl(meta)),
            );
          } else if (control.type === "translateY") {
            const row = doc.createElement("div");
            row.className = "builder-field-row single";
            const y = doc.createElement("input");
            y.className = "ds-input";
            y.type = "number";
            y.step = "0.5";
            row.appendChild(y);
            field.appendChild(row);
            meta = { token: control.token, type: "translateY", y };
            y.addEventListener("input", () => applyControl(meta));
          } else if (control.type === "bezier") {
            const grid = doc.createElement("div");
            grid.className = "builder-multi-grid";
            const x1 = doc.createElement("input");
            x1.className = "ds-input";
            x1.type = "number";
            x1.step = "0.01";
            x1.placeholder = "x1";
            const y1 = doc.createElement("input");
            y1.className = "ds-input";
            y1.type = "number";
            y1.step = "0.01";
            y1.placeholder = "y1";
            const x2 = doc.createElement("input");
            x2.className = "ds-input";
            x2.type = "number";
            x2.step = "0.01";
            x2.placeholder = "x2";
            const y2 = doc.createElement("input");
            y2.className = "ds-input";
            y2.type = "number";
            y2.step = "0.01";
            y2.placeholder = "y2";
            [x1, y1, x2, y2].forEach((el) => grid.appendChild(el));
            field.appendChild(grid);
            const presets = doc.createElement("div");
            presets.className = "builder-preset-row";
            [
              ["standard", [0.2, 0, 0, 1]],
              ["easeOut", [0, 0, 0.2, 1]],
              ["linear", [0, 0, 1, 1]],
              ["snappy", [0.22, 1, 0.36, 1]],
            ].forEach((pair) => {
              const btn = doc.createElement("button");
              btn.type = "button";
              btn.className = "ds-btn";
              btn.textContent = pair[0];
              btn.addEventListener("click", () => {
                x1.value = pair[1][0];
                y1.value = pair[1][1];
                x2.value = pair[1][2];
                y2.value = pair[1][3];
                applyControl(meta);
              });
              presets.appendChild(btn);
            });
            field.appendChild(presets);
            meta = { token: control.token, type: "bezier", x1, y1, x2, y2 };
            [x1, y1, x2, y2].forEach((el) =>
              el.addEventListener("input", () => applyControl(meta)),
            );
          } else if (control.type === "select") {
            const row = doc.createElement("div");
            row.className = "builder-field-row single";
            main = doc.createElement("select");
            main.className = "ds-select";
            control.options.forEach((opt) => {
              const option = doc.createElement("option");
              option.value = opt;
              option.textContent = opt;
              main.appendChild(option);
            });
            row.appendChild(main);
            field.appendChild(row);
            meta = {
              token: control.token,
              type: control.type,
              unit: control.unit || "",
              main,
              extra,
            };
            main.addEventListener("input", () => applyControl(meta));
          } else {
            const row = doc.createElement("div");
            row.className = "builder-field-row single";
            main = doc.createElement("input");
            main.className = "ds-input";
            if (control.type === "length" || control.type === "number") {
              main.type = "number";
              if (control.step) main.step = control.step;
            } else {
              main.type = "text";
            }
            row.appendChild(main);
            field.appendChild(row);
            meta = {
              token: control.token,
              type: control.type,
              unit: control.unit || "",
              main,
              extra,
            };
            main.addEventListener("input", () => applyControl(meta));
          }
          controlMap.set(control.token, meta);
          sectionParts.body.appendChild(field);
        });
        host.appendChild(card);
      });
    }

    return {
      renderBuilder,
    };
  }

  win.DesignSystemStudioBuilderRenderer = {
    initBuilderRenderer,
  };
})(window, document);
