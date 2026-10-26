const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function main() {
  const fixture = require('./icon-project-fixture.cjs').createFixture();
  await new Promise(resolve => fixture.server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + fixture.server.address().port;
  try {
    const connection = await (await fetch(origin + '/api/icon-project')).json();
    const proposal = { schemaVersion: 1, expectedVersion: connection.version, alias: 'action.search', source: { library: 'local', name: 'server-fixture', revision: 'fixture-1', url: '', license: 'Project-owned', licenseText: 'Test fixture ownership notice' }, modifications: 'None', exceptionReason: '',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 2L3 4" stroke="currentColor"/></svg>' };
    const send = (changes = {}, extra = {}) => fetch(origin + '/api/icon-approval', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'X-DS-Project-Token': connection.token, ...extra }, body: JSON.stringify({ ...proposal, ...changes }) });
    const manifestPath = path.join(fixture.directory, 'icons/approved.json');
    const before = fs.readFileSync(manifestPath, 'utf8');
    assert.equal((await send({}, { Origin: 'http://other.example' })).status, 403);
    assert.equal((await send({}, { 'X-DS-Project-Token': 'invalid' })).status, 403);
    assert.equal((await send({ svg: '<script/>' })).status, 400);
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), before, 'Rejected requests preserve project');
    const response = await send(); assert.equal(response.status, 200);
    const result = await response.json();
    assert.ok(result.manifest.icons.find(entry => entry.alias === 'action.search').svg.includes('M1 2L3 4'));
    assert.notEqual(result.manifest.version, connection.version);
    assert.equal(fixture.builds(), 1);
    assert.equal(result.packageAssets.version, result.manifest.version, 'Live export assets match saved collection');
    assert.equal((await send({ modifications: 'Changed in a stale tab' })).status, 409, 'Conflicting stale edit is rejected');
    const repeated = await (await send()).json();
    assert.equal(repeated.manifest.version, result.manifest.version, 'Save retry is idempotent');
    assert.equal((await fetch(origin + '/.git/config')).status, 404);
    console.log('PASS project connection, origin/token checks, rejected SVG preservation, direct save, rebuild and idempotent retry');
  } finally { fixture.server.closeAllConnections(); await new Promise(resolve => fixture.server.close(resolve)); fixture.dispose(); }
  const failing = require('./icon-project-fixture.cjs').createFixture({ failRebuild: true });
  await new Promise(resolve => failing.server.listen(0, '127.0.0.1', resolve));
  const failedOrigin = 'http://127.0.0.1:' + failing.server.address().port;
  try {
    const connection = await (await fetch(failedOrigin + '/api/icon-project')).json();
    const proposal = { schemaVersion: 1, expectedVersion: connection.version, alias: 'action.search',
      source: { library: 'local', name: 'partial-save', revision: 'fixture-1', url: '', license: 'Project-owned', licenseText: 'Fixture ownership' },
      modifications: 'None', svg: '<svg viewBox="0 0 24 24"><path d="M1 2L3 4"/></svg>' };
    const response = await fetch(failedOrigin + '/api/icon-approval', { method: 'POST', headers: { Origin: failedOrigin, 'Content-Type': 'application/json', 'X-DS-Project-Token': connection.token }, body: JSON.stringify(proposal) });
    assert.equal(response.status, 500);
    const result = await response.json();
    assert.equal(result.committed, true, 'Build failure must disclose committed source');
    assert.notEqual(result.manifest.version, connection.version);
    assert.equal(result.packageAssets.version, result.manifest.version, 'Live exports remain consistent with committed source');
    console.log('PASS explicit source-committed/package-failed recovery');
  } finally { failing.server.closeAllConnections(); await new Promise(resolve => failing.server.close(resolve)); failing.dispose(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
