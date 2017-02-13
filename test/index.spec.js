import test from 'ava';

import semver from 'semver';
import taggedVersions from '../';
import tempRepo from './helpers/index';

const repo = tempRepo();

test.before(async () => {
  await repo.init();
  await repo.commit('chore: chore1');
  await repo.run('tag', '-m', 'named', 'init');
  await repo.commit('chore: chore2');
  await repo.run('tag', '-m', '1.0.0', 'v1.0.0');
  await repo.commit('feat: feat1');
  await repo.commit('feat: feat2');
  await repo.run('tag', '-m', '1.1.0-0', 'v1.1.0-0');
  await repo.commit('fix: fix1');
  await repo.commit('fix: fix2');
  await repo.run('tag', 'v1.1.0-1'); // lightweight tag
  await repo.run('tag', '-m', '1.1.0', 'v1.1.0'); // annotated tag
  await repo.run('tag', '-m', 'named', 'stable');
  await repo.commit('fix: fix3');
  await repo.commit('fix: fix4');
  await repo.run('tag', '-m', '1.1.1', 'v1.1.1');
  await repo.commit('fix: fix5');
});

test.beforeEach((t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.pwd = process.cwd();
});

test.afterEach.always((t) => {
  process.chdir(t.context.pwd);
});

test.after.always(async () => {
  await repo.remove();
});

async function getTags() {
  return Promise.all([{
    tag: 'v1.1.1',
    commit: 'fix: fix4',
  }, {
    tag: 'v1.1.0',
    commit: 'fix: fix2',
  }, {
    tag: 'v1.1.0-1',
    commit: 'fix: fix2',
  }, {
    tag: 'v1.1.0-0',
    commit: 'feat: feat2',
  }, {
    tag: 'v1.0.0',
    commit: 'chore: chore2',
  }].map(async ({ tag, commit }) => {
    const { hash, date } = await repo.info({ grep: commit });

    return { hash, date, tag, version: semver.valid(tag) };
  }));
}

test.serial('return all tagged versions', async (t) => {
  process.chdir(repo.root);

  const tags = await taggedVersions.getList();
  const expected = await getTags();

  t.deepEqual(tags, expected);
});

test.serial('return all tagged versions within a range', async (t) => {
  process.chdir(repo.root);

  const tags = await taggedVersions.getList('^1.1.0');
  const expected = await getTags();

  t.deepEqual(tags, expected.slice(0, 2));
});

test('Query tags in a dotted revision range', async (t) => {
  const tags = await taggedVersions.getList({ gitDir: repo.gitDir, rev: 'v1.0.0..v1.1.0' });
  const expected = await getTags();

  t.deepEqual(tags, expected.slice(1, -1));
});

test('Query tags in a revision range', async (t) => {
  const tags = await taggedVersions.getList({ gitDir: repo.gitDir, rev: '^v1.0.0 v1.1.0' });
  const expected = await getTags();

  t.deepEqual(tags, expected.slice(1, -1));
});

test('return last tagged version', async (t) => {
  const tags = await taggedVersions.getLastVersion({ gitDir: repo.gitDir });
  const expected = await getTags();

  t.deepEqual(tags, expected[0]);
});

test('return last tagged version within a range', async (t) => {
  const tags = await taggedVersions.getLastVersion({ gitDir: repo.gitDir, range: '~1.0' });
  const expected = await getTags();

  t.deepEqual(tags, expected.pop());
});
