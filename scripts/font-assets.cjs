const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
function fontAssets() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'fonts/manifest.json'), 'utf8'));
  const files = new Map();
  const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
  for (const face of manifest.faces) {
    for (const [file, hash, binary] of [[face.file, face.sha256, true], [face.licenseFile, face.licenseSha256, false]]) {
      if (!/^fonts\/[a-z0-9]+\/[^/]+$/.test(file) || file.includes('..')) throw new Error('Invalid font asset path: ' + file);
      const bytes = fs.readFileSync(path.join(root, file));
      if (digest(bytes) !== hash) throw new Error('Font integrity mismatch: ' + file);
      if (!binary && !bytes.toString('utf8').includes('SIL OPEN FONT LICENSE Version 1.1')) throw new Error('Missing OFL license: ' + file);
      files.set(file, { name: file, content: bytes.toString(binary ? 'base64' : 'utf8'), ...(binary ? { encoding: 'base64' } : {}) });
    }
  }
  files.set('fonts/manifest.json', { name: 'fonts/manifest.json', content: JSON.stringify(manifest, null, 2) + '\n' });
  const css = (prefix) => '/* Local OFL fonts; preserve per-family OFL.txt notices and manifest.json. */\n' + manifest.faces.map(face =>
    '@font-face { font-family: "' + face.family + '"; font-style: ' + face.style + '; font-weight: ' + face.weight + '; font-display: swap; src: url("' + prefix + face.file + '") format("truetype"); }'
  ).join('\n') + '\n';
  return { manifest, files: [...files.values()], css: css('./'), studioCss: css('../') };
}
module.exports = { fontAssets };
