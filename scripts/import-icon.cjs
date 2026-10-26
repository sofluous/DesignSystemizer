const fs = require('node:fs');
const { importProposal } = require('./icon-library.cjs');
try {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node scripts/import-icon.cjs path/to/icon-approval.json');
  if (fs.statSync(file).size > 3 * 1024 * 1024) throw new Error('Approval file exceeds 3 MB');
  const manifest = importProposal(JSON.parse(fs.readFileSync(file, 'utf8')));
  console.log('Approved collection ' + manifest.version + ' is committed. Rebuilding generated icon snapshots...');
  require('./build-icons.cjs').build();
  console.log('Approved icon collection ' + manifest.version + '. Run node scripts/build-package.cjs to refresh the distributable package.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
