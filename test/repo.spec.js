import test from 'ava';
import shell from 'shelljs';

import getRepo from '../src/repo';
import tempRepo from './helpers/index';

const tmp = tempRepo();

test.before(async () => {
  await tmp.init();
  await tmp.commit('chore: chore1');
});

test.beforeEach((t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.pwd = process.cwd();
});

test.afterEach.always((t) => {
  process.chdir(t.context.pwd);
});

test.after.always(async () => {
  await tmp.remove();
});

test('should open the repository', async (t) => {
  const repo = await getRepo(tmp);
  const commit = await repo.getHeadCommit();

  t.deepEqual(commit.message().trim(), 'chore: chore1');
});

test.serial('should find the repository', async (t) => {
  shell.cd(tmp.root);
  shell.mkdir('-p', 'foo/bar');
  shell.cd('foo/bar');

  const repo = await getRepo();
  const commit = await repo.getHeadCommit();

  t.deepEqual(commit.message().trim(), 'chore: chore1');
});
