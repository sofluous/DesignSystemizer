const fs = require('node:fs');
const path = require('node:path');

// Publish only an explicitly owned output directory. A failed swap restores the
// previous package. Process termination can leave the lock/backup for recovery.
function publishPackage(destination, files, { rename = fs.renameSync } = {}) {
  destination = path.resolve(destination);
  const parent = path.dirname(destination);
  if (destination === parent) throw new Error('Output cannot be a filesystem root');
  fs.mkdirSync(parent, { recursive: true });
  const lock = destination + '.lock';
  const descriptor = fs.openSync(lock, 'wx');
  let stage, backup, previousMoved = false;
  function removeOwned(target) {
    const resolved = path.resolve(target);
    if (path.dirname(resolved) !== parent || !path.basename(resolved).startsWith(path.basename(destination) + '.stage-')) throw new Error('Unsafe package cleanup');
    fs.rmSync(resolved, { recursive: true, force: true });
  }
  try {
    stage = fs.mkdtempSync(destination + '.stage-');
    backup = path.join(stage, 'previous');
    const next = path.join(stage, 'next');
    fs.mkdirSync(next);
    const seen = new Set();
    for (const file of files) {
      const target = path.resolve(next, file.name);
      const key = process.platform === 'win32' ? target.toLowerCase() : target;
      if (!target.startsWith(next + path.sep) || seen.has(key)) throw new Error('Invalid or duplicate output path: ' + file.name);
      seen.add(key);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.encoding === 'base64' ? Buffer.from(file.content, 'base64') : file.content);
    }
    if (fs.existsSync(destination)) { rename(destination, backup); previousMoved = true; }
    try { rename(next, destination); }
    catch (error) {
      if (previousMoved) {
        try { fs.renameSync(backup, destination); previousMoved = false; }
        catch (rollback) { throw new Error('Package replacement and rollback failed; preserve ' + stage + ': ' + rollback.message); }
      }
      throw error;
    }
    previousMoved = false;
  } finally {
    // Preserve the backup if rollback itself failed; never delete the last good output.
    if (stage && !previousMoved) removeOwned(stage);
    fs.closeSync(descriptor);
    fs.unlinkSync(lock);
  }
}
module.exports = { publishPackage };
