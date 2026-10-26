const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { root, readLibrary, importProposal } = require('./icon-library.cjs');
function createStudioServer({ projectRoot = root, rebuild = () => promisify(execFile)(process.execPath, [path.join(root, 'scripts/build-package.cjs')], { windowsHide: true }) } = {}) {
  const token = randomBytes(32).toString('hex');
  let saving = false;
  const manifestWithSvg = () => {
    const manifest = readLibrary(projectRoot);
    return { ...manifest, icons: manifest.icons.map(entry => ({ ...entry, svg: fs.readFileSync(path.join(projectRoot, 'icons', entry.file), 'utf8') })) };
  };
  return http.createServer(async (req, res) => {
    const origin = 'http://127.0.0.1:' + res.socket.localPort;
    const respond = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    if (req.headers.host !== new URL(origin).host) return respond(403, { error: 'Open Studio using its printed localhost address.' });
    let route;
    try { route = decodeURIComponent(new URL(req.url, origin).pathname); } catch (_) { return respond(400, { error: 'Invalid path' }); }
    if (route === '/api/icon-project' && req.method === 'GET') return respond(200, { token, version: readLibrary(projectRoot).version });
    if (route === '/api/icon-approval' && req.method === 'POST') {
      if (req.headers.origin !== origin || req.headers['x-ds-project-token'] !== token || req.headers['content-type'] !== 'application/json') return respond(403, { error: 'Project connection is invalid; reload Studio.' });
      if (saving) return respond(409, { error: 'Another save is in progress.' });
      saving = true;
      let committed = false;
      try {
        const chunks = []; let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 3 * 1024 * 1024) { respond(413, { error: 'Approval exceeds 3 MB' }); return; }
          chunks.push(chunk);
        }
        importProposal(JSON.parse(Buffer.concat(chunks).toString('utf8')), projectRoot);
        committed = true;
        await rebuild();
        return respond(200, { manifest: manifestWithSvg(), packageAssets: require('./build-icons.cjs').packageAssets(projectRoot) });
      } catch (error) {
        return respond(committed ? 500 : error.code === 'DS_ICON_CONFLICT' ? 409 : 400, { error: error.message, committed,
          ...(committed ? { manifest: manifestWithSvg(), packageAssets: require('./build-icons.cjs').packageAssets(projectRoot) } : {}) });
      } finally { saving = false; }
    }
    if (route.startsWith('/api/')) return respond(404, { error: 'Unknown project action' });
    if (!['GET', 'HEAD'].includes(req.method)) return respond(405, { error: 'Unsupported method' });
    try {
      const file = fs.realpathSync(path.resolve(projectRoot, '.' + (route === '/' ? '/index.html' : route)));
      if (!file.startsWith(fs.realpathSync(projectRoot) + path.sep) || !fs.statSync(file).isFile() || /[/\\]\.git(?:[/\\]|$)/.test(file)) return respond(404, { error: 'Not found' });
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'text/plain', 'Cache-Control': 'no-store' });
      if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
    } catch (_) { respond(404, { error: 'Not found' }); }
  });
}
if (require.main === module) {
  const port = Number(process.env.DS_STUDIO_PORT || 4177);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid DS_STUDIO_PORT');
  const server = createStudioServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log('Project-connected Studio: http://127.0.0.1:' + port + '/index.html'));
}
module.exports = { createStudioServer };
