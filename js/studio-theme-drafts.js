(function (win) {
  "use strict";
  const storageKey = "ds-studio-drafts";
  const maxFileBytes = 2 * 1024 * 1024;
  const layers = ["family", "hue", "scheme", "style", "typography", "scale", "texture"];
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  function parse(text) {
    if (typeof text !== "string" || text.length > maxFileBytes) throw new Error("Recipe exceeds the 2 MB limit.");
    try { return JSON.parse(text); } catch (_) { throw new Error("The file is not valid JSON."); }
  }
  function decodeRecipe(value, session) {
    if (!isRecord(value) || value.schemaVersion !== 1) throw new Error("Unsupported recipe version. Use a schemaVersion 1 theme.recipe.json export.");
    if (value.generator && value.generator.contractVersion > 1) throw new Error("This recipe requires a newer Studio composition contract.");
    if (!isRecord(value.layers) || !layers.every((key) => typeof value.layers[key] === "string")) throw new Error("The recipe must contain all seven layers.");
    const themeName = value.themeName === undefined ? value.baseTheme : value.themeName;
    if (typeof themeName !== "string" || !/^[a-z0-9_-]{1,120}$/i.test(themeName)) throw new Error("Invalid theme name.");
    const recipe = session.normalizeRecipe(Object.fromEntries(layers.map((key) => [key, value.layers[key]])));
    const overrides = value.overrides;
    if (!isRecord(overrides)) throw new Error("Invalid overrides");
    // Reconcile the saved snapshot before resolving references: preset changes can
    // create cycles that the saved source values themselves are able to repair.
    const base = session.validate({ recipe, overrides: {} });
    const composed = { ...base, ...overrides };
    const manual = { ...overrides };
    let compatibilityOverrides = 0;
    if (value.tokens !== undefined) {
      if (!isRecord(value.tokens)) throw new Error("Invalid exported token snapshot.");
      for (const [token, raw] of Object.entries(value.tokens)) {
        if (!Object.hasOwn(base, token) || typeof raw !== "string") throw new Error("Unknown or invalid snapshot token: " + token);
        if (!win.DesignSystemThemeComposer.isDerived(token) && composed[token] !== raw) {
          if (Object.hasOwn(overrides, token)) throw new Error("Snapshot disagrees with its manual override: " + token);
          manual[token] = raw;
          compatibilityOverrides++;
        }
      }
      win.DesignSystemThemeComposer.serialize("validation", value.tokens);
    }
    const state = { recipe, overrides: manual };
    const tokens = session.validate(state);
    if (value.tokens) {
      for (const [token, raw] of Object.entries(value.tokens)) {
        if (tokens[token] !== raw) throw new Error("Incompatible generated token: " + token + ". Open this export with its original Studio version.");
      }
    }
    return { state, themeName, compatibilityOverrides };
  }

  function createStore(getStorage) {
    const observed = new Map();
    let blocked = false;
    function read() {
      const text = getStorage().getItem(storageKey);
      if (!text) return { format: "design-system-studio-drafts", version: 1, drafts: {} };
      const value = JSON.parse(text);
      if (!isRecord(value) || value.format !== "design-system-studio-drafts" || value.version !== 1 || !isRecord(value.drafts)) {
        throw new Error("Saved drafts have an unsupported or damaged format. They have not been overwritten.");
      }
      return value;
    }
    return {
      load() {
        try {
          const value = read();
          for (const [id, draft] of Object.entries(value.drafts)) observed.set(id, JSON.stringify(draft));
          return value.drafts;
        } catch (error) { blocked = true; throw error; }
      },
      save(id, draft) {
        if (blocked) throw new Error("Automatic saving is paused to protect unreadable saved drafts. Download your recipe and reload to retry.");
        const value = read();
        const previous = Object.hasOwn(value.drafts, id) ? JSON.stringify(value.drafts[id]) : undefined;
        if (previous !== observed.get(id)) throw new Error("This theme was changed in another tab. Download your recipe before reloading to resolve the conflict.");
        const next = JSON.stringify(draft);
        if (previous === next) return;
        Object.defineProperty(value.drafts, id, { value: draft, enumerable: true, configurable: true, writable: true });
        getStorage().setItem(storageKey, JSON.stringify(value));
        observed.set(id, next);
      },
    };
  }
  win.DesignSystemStudioThemeDrafts = { storageKey, maxFileBytes, parse, decodeRecipe, createStore };
})(window);
