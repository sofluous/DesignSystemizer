const contract = require('./theme-token-ownership.json');

function validateOwnership({ data, defaults, composer, buildColorBundle, isDerived }, specification = contract) {
  if (specification.schemaVersion !== 1) throw new Error('Unsupported token ownership schema');
  const owners = new Map();
  const errors = [];
  const knownOwners = new Set(["family", "scheme", "style", "typography", "scale", "texture", "foundation", "generated"]);
  for (const [owner, group] of Object.entries(specification.groups)) {
    if (!knownOwners.has(owner)) errors.push("Unknown owner: " + owner);
    for (const token of group.tokens) {
      if (owners.has(token)) errors.push('Duplicate token owner: ' + token);
      owners.set(token, owner);
    }
  }
  const exceptions = new Map();
  const key = (layer, preset, token) => [layer, preset, token].join('/');
  for (const exception of specification.exceptions) {
    if (!exception.reason || !exception.reason.trim()) errors.push('Missing exception reason: ' + exception.preset);
    for (const token of exception.tokens) {
      const id = key(exception.layer, exception.preset, token);
      if (exceptions.has(id)) errors.push('Duplicate ownership exception: ' + id);
      exceptions.set(id, exception);
    }
  }
  const usedExceptions = new Set();
  const seen = new Set(Object.keys(defaults));
  function assignment(layer, preset, token, value, bundle = false) {
    seen.add(token);
    if (!owners.has(token)) { errors.push('Unowned token: ' + key(layer, preset, token)); return; }
    if (typeof value !== 'string') errors.push('Non-string token value: ' + key(layer, preset, token));
    const owner = owners.get(token);
    const allowed = bundle ? ['family', 'scheme'].includes(owner) : owner === layer;
    if (allowed) return;
    const id = key(layer, preset, token);
    if (!bundle && exceptions.has(id)) usedExceptions.add(id);
    else errors.push(id + ' belongs to ' + owner);
  }
  for (const layer of ['scheme', 'style', 'typography', 'scale', 'texture']) {
    for (const [preset, values] of Object.entries(data[layer + 'Presets'])) {
      for (const [token, value] of Object.entries(values)) assignment(layer, preset, token, value);
    }
  }
  for (const [hue, values] of Object.entries(data.huePresets)) {
    if (Object.keys(values).some((token) => token.startsWith('--'))) errors.push('Hue is parameter-only: ' + hue);
  }
  for (const [family, values] of Object.entries(data.colorFamilyPresets)) {
    if (Object.keys(values).some((token) => token.startsWith('--'))) errors.push('Family token assignments must use palette: ' + family);
    if (values.palette !== undefined && (!values.palette || typeof values.palette !== 'object' || Array.isArray(values.palette))) {
      errors.push('Invalid Family palette: ' + family);
      continue;
    }
    for (const [token, value] of Object.entries(values.palette || {})) assignment('family', family, token, value);
    for (const hue of Object.keys(data.huePresets)) {
      for (const [token, value] of Object.entries(buildColorBundle(family, hue))) assignment('family+hue', family + '+' + hue, token, value, true);
    }
  }
  const sample = composer.compose(Object.values(data.baseThemePresetMap)[0]).tokens;
  for (const token of Object.keys(sample).filter(isDerived)) {
    seen.add(token);
    if (owners.get(token) !== 'generated') errors.push('Derived token must be owned by generated: ' + token);
  }
  for (const token of seen) {
    if (!owners.has(token)) errors.push('Missing ownership entry: ' + token);
    if (owners.has(token) && (owners.get(token) === 'generated') !== isDerived(token)) errors.push('Incorrect generated ownership: ' + token);
  }
  for (const token of owners.keys()) if (!seen.has(token)) errors.push('Stale ownership entry: ' + token);
  for (const id of exceptions.keys()) if (!usedExceptions.has(id)) errors.push('Stale ownership exception: ' + id);
  if (errors.length) throw new Error('Theme ownership check failed:\n' + [...new Set(errors)].join('\n'));
  return { tokenCount: owners.size, exceptionCount: usedExceptions.size, owners, exceptions: specification.exceptions };
}

function ownershipMarkdown(result) {
  return '# Theme token ownership\n\nGenerated from `scripts/theme-token-ownership.json`; edit that contract, not this page. Every build validates ownership before emitting themes.\n\n' +
    `${result.tokenCount} tokens have explicit owners. ${result.exceptionCount} existing off-owner assignments are retained as named compatibility exceptions. These are migration debt, not permission for new overlaps. New, duplicate, unowned, or stale entries fail the build.\n\n` +
    'Foundations seed every property. Family + Hue generate the semantic palette and seed component color defaults; later modules specialize their owned properties. Hue owns generator parameters rather than a separate set of CSS tokens. Generated aliases are read-only. Explicit user overrides remain outside preset ownership enforcement.\n\n' +
    'Family may declare a `palette` object containing only Family-owned semantic tokens. Fixed Family surfaces are explicit palette intent; Scheme must not select the page palette. Type Four Sprint now obtains its page background from `race-ui.palette`, while `rr4-sprint` owns component color treatment.\n\n' +
    'Ownership does not yet certify CSS value types, arbitrary mixed-layer readability, font availability, or freedom from literal component paints. These require separate validation.\n\n' +
    Object.entries(contract.groups).map(([owner, group]) => '## ' + owner + '\n\n' + group.description + '\n\n' +
      '| Token |\n|---|\n' + group.tokens.map((token) => '| `' + token + '` |').join('\n')).join('\n\n') +
    '\n\n## Existing compatibility exceptions\n\n| Module | Preset | Tokens owned elsewhere | Reason |\n|---|---|---|---|\n' +
    result.exceptions.map((entry) => '| ' + entry.layer + ' | `' + entry.preset + '` | ' + entry.tokens.map((token) => '`' + token + '`').join(', ') + ' | ' + entry.reason + ' |').join('\n') + '\n';
}

module.exports = { contract, validateOwnership, ownershipMarkdown };
