(function (win) {
  "use strict";
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const linear = (x) => x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  const gamma = (x) => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  function split(value) {
    let depth = 0, start = 0;
    const result = [];
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "(") depth++;
      if (value[i] === ")") depth--;
      if (value[i] === "," && depth === 0) { result.push(value.slice(start, i).trim()); start = i + 1; }
    }
    result.push(value.slice(start).trim());
    return result;
  }
  function resolve(value, tokens, seen = []) {
    return String(value || "").replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g, (_, key, fallback) => {
      if (seen.includes(key)) throw new Error("Token cycle: " + seen.concat(key).join(" -> "));
      if (!(key in tokens) && fallback === undefined) throw new Error("Missing token: " + key);
      return resolve(tokens[key] ?? fallback, tokens, seen.concat(key));
    });
  }
  function toLab(rgb) {
    const [r, g, b] = rgb.map(linear);
    const l = Math.cbrt(.4122214708*r + .5363325363*g + .0514459929*b);
    const m = Math.cbrt(.2119034982*r + .6806995451*g + .1073969566*b);
    const s = Math.cbrt(.0883024619*r + .2817188376*g + .6299787005*b);
    return [.2104542553*l + .793617785*m - .0040720468*s,
      1.9779984951*l - 2.428592205*m + .4505937099*s,
      .0259040371*l + .7827717662*m - .808675766*s];
  }
  function fromLab([l, a, b]) {
    const x = Math.pow(l + .3963377774*a + .2158037573*b, 3);
    const y = Math.pow(l - .1055613458*a - .0638541728*b, 3);
    const z = Math.pow(l - .0894841775*a - 1.291485548*b, 3);
    return [4.0767416621*x - 3.3077115913*y + .2309699292*z,
      -1.2684380046*x + 2.6097574011*y - .3413193965*z,
      -.0041960863*x - .7034186147*y + 1.707614701*z].map((v) => clamp(gamma(v)));
  }
  function color(raw) {
    const v = raw.trim().toLowerCase().replace(/\s+/g, " ");
    const named = { black: [0,0,0,1], white: [1,1,1,1], transparent: [0,0,0,0] };
    if (named[v]) return named[v];
    if (/^#[\da-f]{3,8}$/.test(v)) {
      let h = v.slice(1);
      if (h.length === 3 || h.length === 4) h = [...h].map((c) => c+c).join("");
      if (h.length === 6) h += "ff";
      if (h.length !== 8) return null;
      return [0,2,4,6].map((i) => parseInt(h.slice(i,i+2),16)/255);
    }
    const fn = v.match(/^(rgba?|hsla?)\((.*)\)$/);
    if (fn) {
      const p = fn[2].split(/[\s,/]+/).filter(Boolean);
      const n = p.map(parseFloat);
      if (n.some((x) => !Number.isFinite(x))) return null;
      const alpha = p[3] ? n[3] / (p[3].endsWith("%") ? 100 : 1) : 1;
      if (fn[1].startsWith("rgb")) return n.slice(0,3).map((x,i) => clamp(x/(p[i].endsWith("%") ? 100 : 255))).concat(alpha);
      const h = ((n[0] % 360) + 360) % 360 / 60, s = n[1]/100, l = n[2]/100;
      const c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs(h%2-1)), m = l-c/2;
      const rgb = [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.floor(h)];
      return rgb.map((q) => q+m).concat(alpha);
    }
    if (v.startsWith("color-mix(")) {
      const parts = split(v.slice(10,-1));
      if (parts.length !== 3 || !/^in (oklab|srgb)$/.test(parts[0])) return null;
      const operands = parts.slice(1).map((p) => {
        const m = p.match(/^(.*)\s+([\d.]+)%$/);
        return { rgb: color(m ? m[1] : p), weight: m ? Number(m[2])/100 : null };
      });
      if (operands.some((p) => !p.rgb)) return null;
      let [a,b] = operands.map((p) => p.weight);
      if (a === null && b === null) a = b = .5;
      else if (a === null) a = 1-b;
      else if (b === null) b = 1-a;
      const sum = a+b;
      if (sum <= 0) return null;
      a /= sum; b /= sum;
      const [one,two] = operands.map((p) => p.rgb);
      const alpha = one[3]*a + two[3]*b;
      if (!alpha) return [0,0,0,0];
      const lab = parts[0] === "in oklab";
      const p = lab ? toLab(one.slice(0,3)) : one, q = lab ? toLab(two.slice(0,3)) : two;
      const mixed = [0,1,2].map((i) => (p[i]*one[3]*a + q[i]*two[3]*b)/alpha);
      return (lab ? fromLab(mixed) : mixed).concat(alpha*Math.min(1,sum));
    }
    return null;
  }
  function over(fg, bg) {
    return fg.slice(0,3).map((v,i) => v*fg[3] + bg[i]*(1-fg[3])).concat(1);
  }
  function ratio(fg, bg) {
    const lum = (c) => c.slice(0,3).map(linear).reduce((sum,x,i) => sum+x*[.2126,.7152,.0722][i],0);
    const a = lum(over(fg,bg)), b = lum(bg);
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  }
  function samples(raw, under) {
    const solid = color(raw);
    if (solid) return [over(solid,under)];
    if (!/^(repeating-)?(linear|radial)-gradient\(/.test(raw)) return [];
    const parts = split(raw.slice(raw.indexOf("(")+1,-1));
    const stops = parts.map((p) => color(p.replace(/\s+-?[\d.]+(?:%|px)(?:\s+-?[\d.]+(?:%|px))?$/, ""))).filter(Boolean);
    if (stops.length < 2) return [];
    const result = [];
    for (let i=1;i<stops.length;i++) for (let j=0;j<=16;j++) {
      result.push(over(stops[i-1].map((v,k) => v+(stops[i][k]-v)*j/16),under));
    }
    return result;
  }
  const pairs = [
    ["--ds-tab-fg", "--ds-tab-bg"],
    ["--ds-tab-border", "--ds-tab-bg"],
    ["--ds-tab-active-border", "--ds-tab-active-bg"],
    ["--ds-chip-text", "--ds-chip-bg"],
    ["--ds-chip-accent-text", "--ds-chip-accent-bg"],
    ["--ds-chip-alt-text", "--ds-chip-alt-bg"],
    ["--ds-text", "--ds-bg"],
    ["--ds-text-muted", "--ds-bg"],
    ["--ds-tab-active-fg", "--ds-tab-active-bg"],
    ["--ds-btn-selected-text", "--ds-btn-selected-bg"],
    ["--ds-btn-primary-text", "--ds-btn-primary-bg"],
    ["--ds-btn-primary-text-hover", "--ds-btn-primary-bg-hover"],
    ["--ds-btn-primary-text-selected", "--ds-btn-primary-bg-hover"],
    ["--ds-check-mark", "--ds-check-checked-bg"],
    ["--ds-input-text", "--ds-input-bg"],
    ["--ds-input-readonly-text", "--ds-input-readonly-bg"],
    ["--ds-btn-text", "--ds-btn-bg"],
    ["--ds-btn-tertiary-text", "--ds-btn-tertiary-bg"],
  ];
  function audit(tokens) {
    const under = color(resolve(tokens["--ds-bg"],tokens)) || [1,1,1,1];
    return pairs.map(([fg,bg]) => {
      const foreground = color(resolve(tokens[fg],tokens));
      const backgrounds = samples(resolve(tokens[bg],tokens),under);
      return { fg, bg, ratio: foreground && backgrounds.length ? Math.min(...backgrounds.map((b) => ratio(foreground,b))) : null };
    });
  }
  function repair(tokens, pass = 0) {
    const fixes = [];
    // These aliases need independent hover/selected contrast after all layers are merged.
    tokens["--ds-btn-primary-text-hover"] ||= "var(--ds-btn-primary-text)";
    tokens["--ds-btn-primary-text-selected"] ||= "var(--ds-btn-primary-text-hover)";
    for (const [fg,bg] of pairs) {
      const under = color(resolve(tokens["--ds-bg"],tokens)) || [1,1,1,1];
      const backgrounds = samples(resolve(tokens[bg],tokens),under);
      const foreground = color(resolve(tokens[fg],tokens));
      if (!backgrounds.length || !foreground) continue;
      if (Math.min(...backgrounds.map((b) => ratio(foreground,b))) >= 4.5) continue;
      const choices = ["#000000", "#ffffff"].map((value) => ({ value, score: Math.min(...backgrounds.map((b) => ratio(color(value),b))) }));
      choices.sort((a,b) => b.score-a.score);
      tokens[fg] = choices[0].value;
      // A gradient spanning dark and light cannot support one readable label color.
      if (choices[0].score < 4.5) tokens[bg] = choices[0].value === "#000000" ? "#ffffff" : "#000000";
      fixes.push({ fg, bg });
    }
    tokens["--ds-tab-active-icon"] = "var(--ds-tab-active-fg)";
    if (pass < 3 && fixes.length) fixes.push(...repair(tokens, pass + 1));
    return fixes;
  }
  win.DesignSystemThemeContrast = { resolve, color, samples, ratio, audit, repair };
})(window);
