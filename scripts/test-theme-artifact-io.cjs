const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeArtifacts } = require('./build-themes.cjs');

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-theme-io-'));
const outputRoot = path.join(temporary, 'repository');
const generated = { files: { 'css/themes.css': 'runtime\n' }, report: '[]\n' };
try {
  writeArtifacts(generated, { outputRoot });
  assert.equal(fs.existsSync(path.join(outputRoot, '_docs')), false, 'normal build creates no docs tree');
  writeArtifacts(generated, { outputRoot, check: true });
  const reportPath = path.join(temporary, 'evidence', 'report.json');
  assert.throws(() => writeArtifacts(generated, { outputRoot, check: true, reportPath }), /stale/);
  assert.equal(fs.existsSync(path.dirname(reportPath)), false, 'check mode does not create output');
  writeArtifacts(generated, { outputRoot, reportPath });
  assert.equal(fs.readFileSync(reportPath, 'utf8'), generated.report);
  writeArtifacts(generated, { outputRoot, check: true, reportPath });
  fs.writeFileSync(reportPath, 'stale');
  assert.throws(() => writeArtifacts(generated, { outputRoot, check: true, reportPath }), /stale/);
  writeArtifacts(generated, { outputRoot, check: true });
  fs.writeFileSync(path.join(outputRoot, 'css/themes.css'), 'stale');
  assert.throws(() => writeArtifacts(generated, { outputRoot, check: true }), /stale/);
  assert.throws(() => writeArtifacts(generated, { outputRoot, reportPath: '' }), /non-empty/);
  assert.throws(() => writeArtifacts(generated, { outputRoot, reportPath: path.join(outputRoot, 'css/themes.css') }), /overwrite/);
  console.log('PASS mandatory runtime freshness, explicit report output/checks, and read-only checks');
} finally {
  assert.equal(path.dirname(temporary), os.tmpdir());
  assert.ok(path.basename(temporary).startsWith('ds-theme-io-'));
  fs.rmSync(temporary, { recursive: true });
}
