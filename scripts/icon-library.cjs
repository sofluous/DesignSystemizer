const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const hash = (text) => createHash('sha256').update(text).digest('hex');
function registry() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/icon-registry.js'), 'utf8'), context);
  return context.window.DesignSystemIconRegistry;
}
function required(value, label, max = 10000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error('Missing or invalid ' + label);
  return value.trim();
}

// Accept a deliberately small, inert SVG subset at the filesystem boundary.
// Browser approval sanitizes first; imports are independently checked, never trusted.
function validateSvg(svg) {
  required(svg, 'SVG', 2 * 1024 * 1024);
  const tags = new Set('svg g path rect circle ellipse line polyline polygon defs linearGradient radialGradient stop clipPath mask title desc'.split(' '));
  const attrs = new Set('xmlns viewBox width height x y x1 x2 y1 y2 cx cy r rx ry d points fill fill-rule clip-rule stroke stroke-width stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity fill-opacity stroke-opacity transform id offset stop-color stop-opacity gradientUnits gradientTransform spreadMethod clipPathUnits maskUnits maskContentUnits clip-path mask vector-effect'.split(' '));
  const stack = [];
  let end = 0, roots = 0, geometry = 0;
  for (const token of svg.matchAll(/<[^>]*>/g)) {
    const text = svg.slice(end, token.index);
    if (/[<>]/.test(text) || /&(?!amp;|lt;|gt;|quot;|apos;)/.test(text) || (!stack.length && text.trim())) throw new Error('Unsupported SVG text');
    const match = token[0].match(/^<(\/)?([A-Za-z]+)([\s\S]*?)(\/?)>$/);
    if (!match || !tags.has(match[2])) throw new Error('Unsupported SVG element');
    const [, closing, tag, attributes, selfClosing] = match;
    if (closing) {
      if (attributes.trim() || selfClosing || stack.pop() !== tag) throw new Error('Unbalanced SVG');
    } else {
      if (!stack.length && (tag !== 'svg' || ++roots !== 1)) throw new Error('Expected one SVG root');
      if (tag === 'svg' && stack.length) throw new Error('Nested SVG is unsupported');
      let attrEnd = 0;
      const seen = new Set();
      for (const attr of attributes.matchAll(/\s+([\w:-]+)\s*=\s*("[^"]*"|'[^']*')/g)) {
        if (attributes.slice(attrEnd, attr.index).trim()) throw new Error('Malformed SVG attributes');
        const name = attr[1], value = attr[2].slice(1, -1);
        if (!attrs.has(name) || seen.has(name) || /[<&\\]/.test(value) || /javascript:|data:|expression\(/i.test(value)) throw new Error('Unsafe SVG attribute: ' + name);
        if (name === 'xmlns' ? value !== 'http://www.w3.org/2000/svg' : /https?:|\/\//i.test(value)) throw new Error('External SVG reference');
        if (/url\(/i.test(value) && !/^url\(#[a-z0-9_-]+\)$/i.test(value)) throw new Error('External SVG paint');
        seen.add(name); attrEnd = attr.index + attr[0].length;
      }
      if (attributes.slice(attrEnd).trim()) throw new Error('Malformed SVG attributes');
      if (tag === 'svg' && !seen.has('viewBox')) throw new Error('SVG needs a viewBox');
      if (/^(path|rect|circle|ellipse|line|polyline|polygon)$/.test(tag)) geometry++;
      if (!selfClosing) stack.push(tag);
    }
    end = token.index + token[0].length;
  }
  if (stack.length || roots !== 1 || !geometry || svg.slice(end).trim()) throw new Error('Incomplete SVG');
  return svg;
}
function validateProposal(value) {
  if (!value || value.schemaVersion !== 1) throw new Error('Unsupported icon approval schema');
  const icon = registry().find((item) => item.alias === value.alias);
  if (!icon) throw new Error('Unknown semantic alias; add its situation to js/icon-registry.js first');
  const source = value.source || {};
  const validated = {
    schemaVersion: 1, alias: icon.alias,
    source: {
      library: required(source.library, 'source library', 100),
      name: required(source.name, 'source icon name', 200),
      revision: required(source.revision, 'exact source revision', 200),
      url: typeof source.url === 'string' ? source.url.trim() : '',
      license: required(source.license, 'license identifier', 100),
      licenseText: required(source.licenseText, 'license and copyright notice', 50000),
    },
    modifications: required(value.modifications, 'modifications (use None if unchanged)', 2000),
    exceptionReason: typeof value.exceptionReason === 'string' ? value.exceptionReason.trim() : '',
    svg: validateSvg(value.svg),
  };
  if (/^(main|master|latest|head)$/i.test(validated.source.revision)) throw new Error('Use a fixed release, commit or custom asset revision');
  if (validated.source.url && !/^https:\/\/[^\s]+$/i.test(validated.source.url)) throw new Error('Source URL must use HTTPS');
  if (['lucide', 'iconoir', 'tabler'].includes(validated.source.library)) {
    const revision = validated.source.revision;
    const repositories = { lucide: 'lucide-icons/lucide', iconoir: 'iconoir-icons/iconoir', tabler: 'tabler/tabler-icons' };
    const prefix = 'https://raw.githubusercontent.com/' + repositories[validated.source.library] + '/' + revision + '/';
    if (!/^(?:[a-f0-9]{40}|v?\d[\w.-]*)$/i.test(revision) || !validated.source.url.startsWith(prefix)) throw new Error('Library source URL must contain its official repository and fixed release or full commit');
  }
  if (!['lucide', 'local'].includes(validated.source.library) && !validated.exceptionReason) throw new Error('Explain why a secondary source is needed');
  return validated;
}
function readLibrary(projectRoot = root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'icons/approved.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || !/^\d+\.\d+\.\d+$/.test(manifest.version) || !Array.isArray(manifest.icons)) throw new Error('Invalid approved library');
  const aliases = new Set();
  for (const entry of manifest.icons) {
    if (aliases.has(entry.alias) || !/^approved\/[a-z0-9.-]+\.svg$/.test(entry.file)) throw new Error('Duplicate alias or unsafe asset path');
    aliases.add(entry.alias);
    const svg = fs.readFileSync(path.join(projectRoot, 'icons', entry.file), 'utf8');
    validateProposal({ ...entry, schemaVersion: 1, svg });
    if (hash(svg) !== entry.sha256) throw new Error('Asset checksum mismatch: ' + entry.alias);
  }
  return manifest;
}
function commitProposal(proposal, projectRoot) {
  const value = validateProposal(proposal);
  const manifest = readLibrary(projectRoot);
  const sha256 = hash(value.svg);
  const file = 'approved/' + value.alias + '-' + sha256.slice(0, 16) + '.svg';
  const { svg, schemaVersion, ...metadata } = value;
  const entry = { ...metadata, file, sha256 };
  const existing = manifest.icons.find((item) => item.alias === value.alias);
  if (existing && JSON.stringify(existing) === JSON.stringify(entry)) return manifest;
  if (proposal.expectedVersion !== undefined && proposal.expectedVersion !== manifest.version) {
    const error = new Error('The project changed in another session. Reload Studio before saving; your draft is retained.');
    error.code = 'DS_ICON_CONFLICT'; throw error;
  }
  const next = { ...manifest, version: manifest.version.replace(/\d+$/, (patch) => Number(patch) + 1),
    icons: manifest.icons.filter((item) => item.alias !== value.alias).concat(entry).sort((a, b) => a.alias.localeCompare(b.alias)) };
  fs.mkdirSync(path.join(projectRoot, 'icons/approved'), { recursive: true });
  // Immutable asset first; one atomic manifest replacement commits the new collection.
  fs.writeFileSync(path.join(projectRoot, 'icons', file), svg, { flag: 'w' });
  const manifestPath = path.join(projectRoot, 'icons/approved.json');
  const temporary = manifestPath + '.tmp';
  try {
    fs.writeFileSync(temporary, JSON.stringify(next, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temporary, manifestPath);
  } catch (error) {
    throw new Error('Approval was not committed. Existing manifest is preserved; check for a concurrent import or stale approved.json.tmp. ' + error.message);
  }
  return next;
}
function importProposal(proposal, projectRoot = root) {
  const lock = path.join(projectRoot, 'icons/approved.lock');
  let descriptor;
  try { descriptor = fs.openSync(lock, 'wx'); }
  catch (_) { throw new Error('Another import may be active. Inspect icons/approved.lock before retrying.'); }
  try { return commitProposal(proposal, projectRoot); }
  finally { fs.closeSync(descriptor); fs.unlinkSync(lock); }
}
module.exports = { root, hash, registry, validateSvg, validateProposal, readLibrary, importProposal };
