;(function (win, doc) {
  function initBuilderControls(options) {
    const root = options.root;
    const controlMap = options.controlMap;

    function normalizeHex(v) {
      const raw = (v || "").trim();
      if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return null;
      if (raw.length === 4) {
        return "#" + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3];
      }
      return raw.toLowerCase();
    }

    function toHex(v) {
      const direct = normalizeHex(v);
      if (direct) return direct;
      const probe = doc.createElement("span");
      probe.style.color = "";
      probe.style.color = (v || "").trim();
      if (!probe.style.color) return null;
      probe.style.position = "fixed";
      probe.style.left = "-9999px";
      probe.style.top = "-9999px";
      doc.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      const match = resolved.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!match) return null;
      return (
        "#" +
        [match[1], match[2], match[3]]
          .map((n) => Number(n).toString(16).padStart(2, "0"))
          .join("")
      );
    }

    function splitTopLevelComma(v) {
      const out = [];
      let depth = 0;
      let start = 0;
      for (let i = 0; i < v.length; i += 1) {
        const ch = v[i];
        if (ch === "(") depth += 1;
        else if (ch === ")") depth = Math.max(0, depth - 1);
        else if (ch === "," && depth === 0) {
          out.push(v.slice(start, i).trim());
          start = i + 1;
        }
      }
      out.push(v.slice(start).trim());
      return out.filter(Boolean);
    }

    function parseShadow(raw) {
      if (!raw || raw === "none") return null;
      const first = splitTopLevelComma(raw)[0] || raw;
      const inset = /\binset\b/i.test(first);
      const noInset = first
        .replace(/\binset\b/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      const match = noInset.match(
        /^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(.+)$/i,
      );
      if (!match) return null;
      return {
        x: parseFloat(match[1]) || 0,
        y: parseFloat(match[2]) || 0,
        blur: parseFloat(match[3]) || 0,
        spread: parseFloat(match[4] || "0") || 0,
        color: toHex(match[5].trim()) || "#000000",
        inset,
      };
    }

    function buildShadow(meta) {
      const x = Number(meta.x.value) || 0;
      const y = Number(meta.y.value) || 0;
      const blur = Math.max(0, Number(meta.blur.value) || 0);
      const spread = Number(meta.spread.value) || 0;
      const color =
        normalizeHex(meta.color.value) || meta.color.value || "#000000";
      return (
        (meta.inset.checked ? "inset " : "") +
        x +
        "px " +
        y +
        "px " +
        blur +
        "px " +
        spread +
        "px " +
        color
      );
    }

    function parseRgba(raw) {
      const match = (raw || "")
        .trim()
        .match(
          /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,\/]+([0-9]*\.?[0-9]+))?\s*\)$/i,
        );
      if (match) {
        return {
          r: Math.min(255, Math.max(0, Number(match[1]) || 0)),
          g: Math.min(255, Math.max(0, Number(match[2]) || 0)),
          b: Math.min(255, Math.max(0, Number(match[3]) || 0)),
          a: Math.min(
            1,
            Math.max(0, match[4] !== undefined ? Number(match[4]) : 1),
          ),
        };
      }
      const hex = toHex(raw);
      if (!hex) return null;
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
        a: 1,
      };
    }

    function buildRgba(meta) {
      const r = Math.min(255, Math.max(0, Number(meta.r.value) || 0));
      const g = Math.min(255, Math.max(0, Number(meta.g.value) || 0));
      const b = Math.min(255, Math.max(0, Number(meta.b.value) || 0));
      const a = Math.min(1, Math.max(0, Number(meta.a.value) || 0));
      return "rgba(" + r + ", " + g + ", " + b + ", " + a.toFixed(2) + ")";
    }

    function parsePaint(raw) {
      const v = (raw || "").trim();
      const grad = v.match(
        /^linear-gradient\(\s*([\-0-9.]+)deg\s*,\s*(.+?)\s*,\s*(.+?)\s*\)$/i,
      );
      if (grad) {
        return {
          mode: "gradient",
          angle: parseFloat(grad[1]) || 180,
          c1: toHex(grad[2].trim()) || "#666666",
          c2: toHex(grad[3].trim()) || "#333333",
        };
      }
      const hex = toHex(v);
      if (hex) return { mode: "solid", angle: 180, c1: hex, c2: hex };
      return { mode: "solid", angle: 180, c1: "#555555", c2: "#222222" };
    }

    function buildPaint(meta) {
      const mode = meta.mode.value;
      if (mode === "gradient") {
        const ang = Number(meta.angle.value) || 180;
        const c1 = normalizeHex(meta.c1.value) || "#666666";
        const c2 = normalizeHex(meta.c2.value) || "#333333";
        return "linear-gradient(" + ang + "deg, " + c1 + ", " + c2 + ")";
      }
      return normalizeHex(meta.c1.value) || meta.c1.value || "#555555";
    }

    function parseTranslateY(raw) {
      const match = (raw || "")
        .trim()
        .match(/^translateY\(\s*(-?\d+(?:\.\d+)?)px\s*\)$/i);
      return match ? parseFloat(match[1]) || 0 : 0;
    }

    function buildTranslateY(meta) {
      const y = Number(meta.y.value) || 0;
      return "translateY(" + y + "px)";
    }

    function parseBezier(raw) {
      const match = (raw || "")
        .trim()
        .match(
          /^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/i,
        );
      if (!match) return null;
      return {
        x1: parseFloat(match[1]),
        y1: parseFloat(match[2]),
        x2: parseFloat(match[3]),
        y2: parseFloat(match[4]),
      };
    }

    function buildBezier(meta) {
      return (
        "cubic-bezier(" +
        Number(meta.x1.value) +
        ", " +
        Number(meta.y1.value) +
        ", " +
        Number(meta.x2.value) +
        ", " +
        Number(meta.y2.value) +
        ")"
      );
    }

    function parseLength(v, fallback) {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    }

    function syncControlsFromComputed() {
      const cs = getComputedStyle(root);
      controlMap.forEach((meta, token) => {
        const raw = cs.getPropertyValue(token).trim();
        if (meta.type === "color") {
          const hex = toHex(raw);
          if (hex) {
            meta.main.value = hex;
            meta.extra.value = hex;
          } else {
            meta.extra.value = raw;
          }
        } else if (meta.type === "shadow") {
          const sh = parseShadow(raw);
          if (sh) {
            meta.x.value = sh.x;
            meta.y.value = sh.y;
            meta.blur.value = sh.blur;
            meta.spread.value = sh.spread;
            meta.color.value = sh.color;
            meta.inset.checked = sh.inset;
          } else {
            meta.x.value = 0;
            meta.y.value = 2;
            meta.blur.value = 8;
            meta.spread.value = 0;
            meta.color.value = "#000000";
            meta.inset.checked = false;
          }
        } else if (meta.type === "rgba") {
          const rgba = parseRgba(raw) || { r: 0, g: 0, b: 0, a: 0.6 };
          meta.r.value = rgba.r;
          meta.g.value = rgba.g;
          meta.b.value = rgba.b;
          meta.a.value = rgba.a;
        } else if (meta.type === "paint") {
          const paint = parsePaint(raw);
          meta.mode.value = paint.mode;
          meta.angle.value = paint.angle;
          meta.c1.value = paint.c1;
          meta.c2.value = paint.c2;
          meta.angle.disabled = paint.mode !== "gradient";
          meta.c2.disabled = paint.mode !== "gradient";
        } else if (meta.type === "translateY") {
          meta.y.value = parseTranslateY(raw);
        } else if (meta.type === "bezier") {
          const b = parseBezier(raw) || { x1: 0.2, y1: 0, x2: 0, y2: 1 };
          meta.x1.value = b.x1;
          meta.y1.value = b.y1;
          meta.x2.value = b.x2;
          meta.y2.value = b.y2;
        } else if (meta.type === "length") {
          meta.main.value = parseLength(raw, 0);
        } else if (meta.type === "number") {
          meta.main.value = parseFloat(raw) || 0;
        } else {
          meta.main.value = raw;
        }
      });
    }

    function applyControl(meta, source) {
      let value = "";
      if (meta.type === "color") {
        if (source === "picker") {
          value = normalizeHex(meta.main.value) || meta.main.value;
          meta.extra.value = value;
        } else {
          const normalized = toHex(meta.extra.value);
          if (!normalized) return;
          value = normalized;
          meta.main.value = normalized;
          meta.extra.value = normalized;
        }
      } else if (meta.type === "shadow") {
        value = buildShadow(meta);
      } else if (meta.type === "rgba") {
        value = buildRgba(meta);
      } else if (meta.type === "paint") {
        value = buildPaint(meta);
        meta.angle.disabled = meta.mode.value !== "gradient";
        meta.c2.disabled = meta.mode.value !== "gradient";
      } else if (meta.type === "translateY") {
        value = buildTranslateY(meta);
      } else if (meta.type === "bezier") {
        value = buildBezier(meta);
      } else if (meta.type === "length") {
        value = String(meta.main.value) + meta.unit;
      } else {
        value = meta.main.value;
      }
      root.style.setProperty(meta.token, value);
    }

    function getRawTokenValue(meta) {
      if (!meta) return "";
      if (meta.type === "color") return meta.extra.value.trim();
      if (meta.type === "shadow") return buildShadow(meta);
      if (meta.type === "rgba") return buildRgba(meta);
      if (meta.type === "paint") return buildPaint(meta);
      if (meta.type === "translateY") return buildTranslateY(meta);
      if (meta.type === "bezier") return buildBezier(meta);
      if (meta.type === "length") {
        return String(meta.main.value).trim() + meta.unit;
      }
      return String(meta.main.value).trim();
    }

    return {
      normalizeHex,
      toHex,
      splitTopLevelComma,
      parseShadow,
      buildShadow,
      parseRgba,
      buildRgba,
      parsePaint,
      buildPaint,
      parseTranslateY,
      buildTranslateY,
      parseBezier,
      buildBezier,
      parseLength,
      syncControlsFromComputed,
      applyControl,
      getRawTokenValue,
    };
  }

  win.DesignSystemStudioBuilderControls = {
    initBuilderControls,
  };
})(window, document);
