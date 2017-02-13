import path from 'path';

import shell from 'shelljs';
import tempfile from 'tempfile';
import childProcess from 'child-process-promise';

export default function tempRepo() {
  const repo = tempfile();
  const gitDir = path.join(repo, '.git');

  return {

    get root() {
      return repo;
    },

    get gitDir() {
      return gitDir;
    },

    async run(...cmd) {
      const ps = childProcess.spawn('git', ['--git-dir', gitDir, ...cmd], {
        capture: ['stdout', 'stderr'],
      });

      return ps.then(result => result.stdout.trim())
        .catch(err => Promise.reject(new Error(`Failed to run "git ${cmd.join(' ')}": ${err.stderr}`)));
    },

    async init(name = 'Alice Smith', email = 'alice@example.com') {
      shell.mkdir('-p', repo);
      await this.run('init', repo);
      await this.run('config', 'user.name', name);
      await this.run('config', 'user.email', email);
    },

    async commit(subject, lines = [], author = 'Bob Smith <bob@example.com>') {
      const msg = [subject].concat('', lines).join('\n').trim();

      await this.run('commit', '--allow-empty', `--author=${author}`, `--message=${msg}`);
    },

    async info({ grep }) {
      const line = await this.run('log', '--grep', grep, '--format=%H%x00%ci%x00%s', '-1');
      const [hash, isoDate] = line.split('\0');

      if (!hash) {
        throw new Error(`Cannot find commit with message "${grep}"`);
      }

      return { hash, date: new Date(isoDate) };
    },

    remove() {
      shell.rm('-rf', repo);
    },

  };
}
