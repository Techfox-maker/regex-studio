import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { verifyRelease } from '../scripts/verify-release.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const version = '20261022-v0.0.1';

test('release verification accepts only annotated, documented stable releases', async t => {
  const temporaryRoot = join(projectRoot, '.tmp');
  mkdirSync(temporaryRoot, { recursive: true });
  const root = mkdtempSync(join(temporaryRoot, 'release-test-'));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const verify = options => verifyRelease({ root, tag: version, version, ...options });
  try {
    git('init', '-b', 'main');
    git('config', 'user.name', 'Fixture');
    git('config', 'user.email', 'fixture@example.invalid');
    git('config', 'commit.gpgsign', 'false');
    git('config', 'tag.gpgsign', 'false');
    mkdirSync(join(root, 'docs', 'releases'), { recursive: true });
    writeFileSync(join(root, 'docs', 'releases', `${version}.md`), '# Fixture release\n');
    git('add', 'docs');
    git('commit', '-m', 'Fixture baseline');
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    git('tag', '-a', version, '-m', 'Fixture release');
    await t.test('accepts an annotated tag on main', () => assert.equal(verify().commit, git('rev-parse', 'HEAD')));
    await t.test('rejects suffixes and malformed tags', () => assert.throws(() => verify({ tag: `${version}-probe` }), /YYYYMMDD/));
    await t.test('rejects version mismatches', () => assert.throws(() => verify({ version: '20261022-v0.0.3' }), /does not match/));
    await t.test('requires matching release notes', () => assert.throws(() => verify({ tag: '20261022-v0.0.3', version: '20261022-v0.0.3' }), /notes are missing/));
    await t.test('rejects a lightweight tag', () => {
      const tag = '20261022-v0.0.4';
      writeFileSync(join(root, 'docs', 'releases', `${tag}.md`), '# Fixture notes\n');
      git('tag', tag);
      assert.throws(() => verify({ tag, version: tag }), /must be annotated/);
    });
    await t.test('rejects an annotated tag outside main history', () => {
      const tag = '20261022-v0.0.5';
      git('switch', '-c', 'unmerged');
      writeFileSync(join(root, 'docs', 'releases', `${tag}.md`), '# Unmerged fixture\n');
      git('add', 'docs');
      git('commit', '-m', 'Fixture unmerged change');
      git('tag', '-a', tag, '-m', 'Unmerged fixture release');
      assert.throws(() => verify({ tag, version: tag }), /not reachable from origin\/main/);
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
