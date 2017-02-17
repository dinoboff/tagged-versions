import test from 'ava';

import getRepo from '../src/repo';
import getTags from '../src/tags';
import tempRepo from './helpers/index';

const tmp = tempRepo();

test.before(async () => {
  await tmp.init();
  await tmp.commit('chore: chore1');
  await tmp.run('tag', '-m', 'named', 'init');
  await tmp.commit('chore: chore2');
  await tmp.run('tag', '-m', '1.0.0', 'v1.0.0');
  await tmp.commit('feat: feat1');
  await tmp.commit('feat: feat2');
  await tmp.run('tag', '-m', '1.1.0-0', 'v1.1.0-0');
  await tmp.commit('fix: fix1');
  await tmp.commit('fix: fix2');
  await tmp.run('tag', 'v1.1.0-1'); // lightweight tag
  await tmp.run('tag', '-m', '1.1.0', 'v1.1.0'); // annotated tag
  await tmp.run('tag', '-m', 'named', 'stable');
  await tmp.commit('fix: fix3');
  await tmp.commit('fix: fix4');
  await tmp.run('tag', '-m', '1.1.1', 'v1.1.1');
  await tmp.commit('fix: fix5');
  await tmp.run('checkout', '-b', 'next', 'v1.1.0');
  await tmp.commit('feat: feat3');
  await tmp.run('tag', '-m', '2.0.0-0', 'v2.0.0-0');
  await tmp.run('checkout', 'master');
});

test.after.always(async () => {
  await tmp.remove();
});


test('should list all tags', async (t) => {
  const repo = await getRepo(tmp);
  const tags = await getTags(repo);

  t.deepEqual(tags.map(tag => tag.tag), [
    'v2.0.0-0',
    'v1.1.1',
    'v1.1.0',
    'v1.1.0-1',
    'v1.1.0-0',
    'v1.0.0',
  ]);
});

test('should include version (no prefix)', async (t) => {
  const repo = await getRepo(tmp);
  const tags = await getTags(repo);

  t.deepEqual(tags.map(tag => tag.version), [
    '2.0.0-0',
    '1.1.1',
    '1.1.0',
    '1.1.0-1',
    '1.1.0-0',
    '1.0.0',
  ]);
});

test('should include commit hash', async (t) => {
  const repo = await getRepo(tmp);
  const tags = await getTags(repo);
  const expected = await Promise.all([
    'feat: feat3',
    'fix: fix4',
    'fix: fix2',
    'fix: fix2',
    'feat: feat2',
    'chore: chore2',
  ].map(msg => tmp.info({ grep: msg }).then(info => info.hash)));

  t.deepEqual(tags.map(tag => tag.hash), expected);
});

test('should filter tags by range', async (t) => {
  const repo = await getRepo(tmp);
  const tags = await getTags(repo, { range: 'x.x.x' });

  t.deepEqual(tags.map(tag => tag.tag), [
    'v1.1.1',
    'v1.1.0',
    'v1.0.0',
  ]);
});

test('should filter by branch', async (t) => {
  const repo = await getRepo(tmp);
  const tags = await getTags(repo, { rev: 'master' });

  t.deepEqual(tags.map(tag => tag.tag), [
    'v1.1.1',
    'v1.1.0',
    'v1.1.0-1',
    'v1.1.0-0',
    'v1.0.0',
  ]);
});

test('should filter by previous tag', async (t) => {
  const repo = await getRepo(tmp);
  const tags = await getTags(repo, { rev: 'v1.1.0-0' });

  t.deepEqual(tags.map(tag => tag.tag), [
    'v1.1.0-0',
    'v1.0.0',
  ]);
});

test('should filter by initial tag', async (t) => {
  const repo = await getRepo(tmp);
  const tags = await getTags(repo, { rev: ['next', 'master', '^v1.1.0-0~1'] });

  t.deepEqual(tags.map(tag => tag.tag), [
    'v2.0.0-0',
    'v1.1.1',
    'v1.1.0',
    'v1.1.0-1',
    'v1.1.0-0',
  ]);
});
