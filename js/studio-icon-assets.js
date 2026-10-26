(function (win, doc) {
  "use strict";
  const cache = new Map();
  const source = (id) => (win.DesignSystemIconSources || []).find((item) => item.id === id);
  function parseReference(raw) {
    const ref = String(raw || "").trim();
    if (/^https?:\/\//i.test(ref)) {
      const url = new URL(ref);
      if (!/\.svg$/i.test(url.pathname) || url.username || url.password) throw new Error("Enter an HTTP(S) SVG URL without credentials.");
      return { mode: "manual", sourceId: "manual-url", iconName: url.pathname.split("/").pop(), manualRef: ref, previewUrl: url.href, label: "Custom SVG / " + url.pathname.split("/").pop() };
    }
    const match = ref.match(/^([a-z][a-z0-9-]*):([a-z0-9][a-z0-9_-]*)$/i);
    const library = match && source(match[1]);
    if (!library) throw new Error("Use an approved library reference such as lucide:search, or an HTTP(S) .svg URL.");
    return { mode: "manual", sourceId: library.id, iconName: match[2], manualRef: ref, label: library.name + " / " + match[2] };
  }
  function urlFor(choice) {
    if (!choice) return "";
    let raw = choice.localFile || choice.previewUrl || "";
    if (!raw && /^https?:\/\//i.test(choice.manualRef || "")) raw = choice.manualRef;
    if (!raw && choice.sourceId === "local" && /^[a-z0-9_-]+$/i.test(choice.iconName)) raw = "./icons/" + choice.iconName + ".svg";
    const library = source(choice.sourceId);
    if (!raw && library?.previewUrlTemplate && choice.iconName) raw = library.previewUrlTemplate.replace(/\{name\}/g, encodeURIComponent(choice.iconName));
    if (!raw) return "";
    const url = new URL(raw, doc.baseURI);
    return ["http:", "https:", "file:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  }
  function hasGlyph(choice) { return !!(choice && ((typeof choice.glyph === "string" && choice.glyph.trim()) || (typeof choice.svg === "string" && choice.svg.trim()))); }
  function same(a, b) {
    if (!a || !b || a.sourceId !== b.sourceId || a.iconName !== b.iconName) return false;
    return a.sourceId !== "manual-url" || urlFor(a) === urlFor(b);
  }
  function reference(choice) { return choice ? choice.localFile || choice.manualRef || (choice.sourceId + ":" + choice.iconName) : "Unassigned"; }
  function sanitizeSvg(raw, title) {
    if (typeof raw !== "string" || raw.length > 2 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(raw)) throw new Error("Unsupported SVG document.");
    const parsed = new win.DOMParser().parseFromString(raw, "image/svg+xml");
    const svg = parsed.documentElement;
    if (parsed.querySelector("parsererror") || svg.localName !== "svg") throw new Error("The selected resource is not a valid SVG.");
    const comments = parsed.createTreeWalker(svg, win.NodeFilter.SHOW_COMMENT);
    const removeComments = [];
    while (comments.nextNode()) removeComments.push(comments.currentNode);
    removeComments.forEach((comment) => comment.remove());
    const tags = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "defs", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "title", "desc"]);
    const attrs = new Set(["xmlns", "viewBox", "width", "height", "x", "y", "x1", "x2", "y1", "y2", "cx", "cy", "r", "rx", "ry", "d", "points", "fill", "fill-rule", "clip-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset", "opacity", "fill-opacity", "stroke-opacity", "transform", "id", "offset", "stop-color", "stop-opacity", "gradientUnits", "gradientTransform", "spreadMethod", "clipPathUnits", "maskUnits", "maskContentUnits", "clip-path", "mask", "vector-effect"]);
    for (const el of [svg, ...svg.querySelectorAll("*")]) {
      if (!tags.has(el.localName)) { el.remove(); continue; }
      for (const attr of [...el.attributes]) {
        if (!attrs.has(attr.name) || /javascript:|data:|https?:|expression\(/i.test(attr.value) && attr.name !== "xmlns" || /url\(/i.test(attr.value) && !/^url\(#[a-z0-9_-]+\)$/i.test(attr.value)) el.removeAttribute(attr.name);
      }
    }
    if (!svg.querySelector("path,rect,circle,ellipse,line,polyline,polygon")) throw new Error("SVG has no supported vector geometry.");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (!svg.hasAttribute("viewBox")) svg.setAttribute("viewBox", "0 0 24 24");
    if (title) {
      svg.querySelectorAll("title").forEach((item) => item.remove());
      const label = parsed.createElementNS("http://www.w3.org/2000/svg", "title");
      label.textContent = title;
      svg.prepend(label);
    }
    return new win.XMLSerializer().serializeToString(svg) + "\n";
  }
  function inlineSvg(choice, title) {
    if (choice.svg) return sanitizeSvg(choice.svg, title);
    return sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + choice.glyph + '</svg>', title);
  }
  function render(host, choice, lazy = false) {
    if (!host) return;
    host.replaceChildren();
    host.className = "icon-preview";
    host.dataset.reference = reference(choice);
    host.setAttribute("role", "img");
    host.setAttribute("aria-label", choice?.label || "No icon selected");
    const status = doc.createElement("span");
    status.className = "icon-preview-state";
    const unavailable = (message) => {
      host.dataset.previewState = "unavailable";
      status.textContent = message;
      host.appendChild(status);
      host.setAttribute("aria-label", (choice?.label || "Icon") + ": " + message);
    };
    if (hasGlyph(choice)) {
      try { host.innerHTML = inlineSvg(choice); host.dataset.previewState = "ready"; }
      catch (_) { unavailable("Invalid SVG"); }
      return;
    }
    const url = urlFor(choice);
    if (!url) { unavailable(choice ? "Reference only" : "No selection"); return; }
    host.dataset.previewState = "loading";
    status.textContent = "Loading…";
    const image = doc.createElement("img");
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.loading = lazy ? "lazy" : "eager";
    image.addEventListener("load", () => { if (host.contains(image)) { host.dataset.previewState = "ready"; status.remove(); } });
    image.addEventListener("error", () => { if (host.contains(image)) { image.remove(); unavailable("Preview unavailable"); } });
    image.src = url;
    host.append(image, status);
  }
  async function svgFor(choice, title) {
    if (hasGlyph(choice)) return inlineSvg(choice, title);
    const url = urlFor(choice);
    if (!url) throw new Error("This reference has no SVG asset. Choose an available source to download an SVG.");
    if (!cache.has(url)) {
      const controller = new win.AbortController();
      const timeout = win.setTimeout(() => controller.abort(), 15000);
      const request = win.fetch(url, { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer" })
        .then(async (response) => {
          if (!response.ok) throw new Error("SVG request failed (" + response.status + ").");
          return sanitizeSvg(await response.text());
        }).catch((error) => { cache.delete(url); throw error; }).finally(() => win.clearTimeout(timeout));
      cache.set(url, request);
    }
    return sanitizeSvg(await cache.get(url), title);
  }
  win.DesignSystemStudioIconAssets = { parseReference, urlFor, hasGlyph, same, reference, render, svgFor, sanitizeSvg };
})(window, document);
