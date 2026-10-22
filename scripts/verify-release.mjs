import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { VERSION } from '../src/version.mjs';

export function verifyRelease({ root, tag, version, mainRef = 'origin/main' }) {
  if (typeof tag !== 'string' || !/^\d{8}-v\d+\.\d+\.\d+$/.test(tag)) throw new Error('Release tag must use YYYYMMDD-vX.Y.Z without a suffix.');
  if (tag !== version) throw new Error(`Release tag ${tag} does not match source version ${version}.`);
  if (!existsSync(join(root, 'docs', 'releases', `${tag}.md`))) throw new Error(`Release notes are missing: docs/releases/${tag}.md`);
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  let type;
  try { type = git('cat-file', '-t', `refs/tags/${tag}`); } catch { throw new Error(`Release tag ${tag} does not exist.`); }
  if (type !== 'tag') throw new Error(`Release tag ${tag} must be annotated.`);
  const commit = git('rev-parse', `refs/tags/${tag}^{commit}`);
  try { git('merge-base', '--is-ancestor', commit, mainRef); } catch { throw new Error(`Release tag ${tag} is not reachable from ${mainRef}.`); }
  return { tag, commit };
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    const result = verifyRelease({ root: fileURLToPath(new URL('../', import.meta.url)), tag: process.argv[2] || process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME, version: VERSION, mainRef: process.argv[3] || 'origin/main' });
    console.log(`Release verified: ${result.tag} (${result.commit})`);
  } catch (error) {
    console.error(`Release verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
