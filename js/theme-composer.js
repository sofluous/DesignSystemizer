(function (win) {
  "use strict";

  const layers = ["scheme", "style", "typography", "scale", "texture"];
  function validValue(value) {
    let quote = "", depth = 0;
    for (let i = 0; i < value.length; i++) {
      const c = value[i];
      if (c === "\\") { i++; continue; }
      if (quote) { if (c === quote) quote = ""; continue; }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === "(" ) depth++;
      if (c === ")" && --depth < 0) return false;
      if (!depth && /[;{}<>]/.test(c)) return false;
      if (c === "/" && value[i+1] === "*") return false;
    }
    return !quote && depth === 0 && value.trim().length > 0;
  }
  function derivePaint(tokens) {
    function imageCount(value) {
      let count = 1, depth = 0;
      for (const c of value) {
        if (c === "(") depth++;
        if (c === ")") depth--;
        if (c === "," && depth === 0) count++;
      }
      return count;
    }
    const resolved = (key) => win.DesignSystemThemeContrast.resolve(tokens[key], tokens);
    const blend = resolved("--ds-texture-blend");
    const modes = (texture, baseCount) => Array(imageCount(resolved(texture))).fill(blend).concat(Array(baseCount).fill("normal")).join(", ");
    // CSS repeats short blend lists: an extra texture must never put the base paint in overlay mode.
    tokens["--ds-control-paint-blend"] = modes("--ds-control-texture-image", 1);
    tokens["--ds-card-paint-blend"] = modes("--ds-card-texture-image", imageCount(resolved("--ds-card-bg-image")) + 1);
    tokens["--ds-body-paint-blend"] = modes("--ds-body-texture-image", imageCount(resolved("--ds-body-bg-image")));
    for (const part of ["btn", "btn-primary", "btn-tertiary", "input", "card"]) {
      const key = "--ds-" + part;
      const value = win.DesignSystemThemeContrast.resolve(tokens[key + "-bg"], tokens);
      const image = /gradient\(|url\(/.test(value);
      tokens[key + "-paint-color"] = image ? "var(--ds-bg-raised)" : "var(" + key + "-bg)";
      tokens[key + "-paint-image"] = image ? "var(" + key + "-bg)" : "none";
    }
    return tokens;
  }

  function serialize(name, tokens) {
    if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error("Invalid theme name");
    return ':root[data-theme="' + name + '"] {\n' +
      Object.keys(tokens).sort().map((key) => {
        const value = String(tokens[key]);
        if (!/^--[a-z0-9-]+$/i.test(key) || !validValue(value)) {
          throw new Error("Invalid token assignment: " + key);
        }
        return "  " + key + ": " + value + ";";
      }).join("\n") + "\n}";
  }

  function createComposer(data, defaults, buildColorBundle) {
    function compose(recipe) {
      if (!data.colorFamilyPresets[recipe.family] || !data.huePresets[recipe.hue]) {
        throw new Error("Unknown color family or hue");
      }
      const tokens = Object.assign({}, defaults, buildColorBundle(recipe.family, recipe.hue));
      layers.forEach((layer) => {
        const preset = data[layer + "Presets"][recipe[layer]];
        if (!preset) throw new Error("Unknown " + layer + " preset: " + recipe[layer]);
        Object.assign(tokens, preset);
      });
      // Selected controls must use a paired foreground/background, independent of primary buttons.
      const fixes = win.DesignSystemThemeContrast.repair(tokens);
      return { tokens: derivePaint(tokens), fixes };
    }
    return { compose };
  }

  function createSession(composer, root) {
    let recipe = null;
    let base = {};
    let overrides = {};
    let fixes = [];
    let history = [];
    const listeners = new Set();
    let applied = {};
    const snapshot = () => ({ recipe: recipe && { ...recipe }, overrides: { ...overrides } });
    function publish() {
      const tokens = derivePaint({ ...base, ...overrides });
      if (root) {
        Object.keys(applied).filter((key) => !(key in tokens)).forEach((key) => root.style.removeProperty(key));
        Object.entries(tokens).forEach(([key, value]) => {
          if (applied[key] !== value) root.style.setProperty(key, value);
        });
        applied = tokens;
      }
      listeners.forEach((fn) => fn());
    }
    function checkpoint() {
      if (recipe) history.push(snapshot());
      if (history.length > 100) history.shift();
    }
    function restore(state) {
      const result = composer.compose(state.recipe);
      recipe = { ...state.recipe };
      base = result.tokens;
      fixes = result.fixes;
      overrides = { ...state.overrides };
      publish();
    }
    return {
      select(next, manual = overrides) {
        // Validate before changing the current draft.
        composer.compose(next);
        checkpoint();
        restore({ recipe: next, overrides: manual });
      },
      load(state) { history = []; restore(state); },
      edit(token, value) {
        if (!(token in base)) throw new Error("Unknown token: " + token);
        serialize("validation", { [token]: value });
        const proposed = { ...base, ...overrides, [token]: value };
        Object.values(proposed).forEach((raw) => win.DesignSystemThemeContrast.resolve(raw, proposed));
        checkpoint();
        overrides[token] = value;
        publish();
      },
      reset() { checkpoint(); overrides = {}; publish(); },
      undo() { if (history.length) restore(history.pop()); },
      get canUndo() { return history.length > 0; },
      get recipe() { return recipe && { ...recipe }; },
      get overrides() { return { ...overrides }; },
      get tokens() { return derivePaint({ ...base, ...overrides }); },
      get fixes() { return fixes.slice(); },
      snapshot,
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    };
  }

  win.DesignSystemThemeComposer = { createComposer, createSession, serialize };
})(window);
