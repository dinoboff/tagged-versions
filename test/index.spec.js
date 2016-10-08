'use strict';

const test = require('ava');
const sinon = require('sinon');
const childProcess = require('child-process-promise');
const taggedVersions = require('../src');

const gitLog = `
(HEAD -> master, tag: v1.2.0, origin/master, origin/HEAD);f6bf448b02c489c8676f2eeaaac72ef93980baf2;2016-10-08T11:47:01+01:00
(tag: v1.1.1);cd88316d6976ce8878a90a1a6d4eb326d16a4d68;2016-10-01T17:34:24+01:00
(tag: v1.1.0);61fca7630fbe863f8d890d7a33e9b45f786d79e8;2016-09-27T22:35:42+01:00
(tag: v1.0.0);9c5d6e1930831431c005bc74543f61a5cb36d617;2016-09-26T23:56:00+01:00
`;

const versions = {
  '1.2.0': {
    version: '1.2.0',
    tag: 'v1.2.0',
    hash: 'f6bf448b02c489c8676f2eeaaac72ef93980baf2',
    date: new Date('2016-10-08T11:47:01+01:00'),
  },
  '1.1.1': {
    version: '1.1.1',
    tag: 'v1.1.1',
    hash: 'cd88316d6976ce8878a90a1a6d4eb326d16a4d68',
    date: new Date('2016-10-01T17:34:24+01:00'),
  },
  '1.1.0': {
    version: '1.1.0',
    tag: 'v1.1.0',
    hash: '61fca7630fbe863f8d890d7a33e9b45f786d79e8',
    date: new Date('2016-09-27T22:35:42+01:00'),
  },
  '1.0.0': {
    version: '1.0.0',
    tag: 'v1.0.0',
    hash: '9c5d6e1930831431c005bc74543f61a5cb36d617',
    date: new Date('2016-09-26T23:56:00+01:00'),
  },
};

test.beforeEach(t => {
  t.context.exec = childProcess.exec;
  childProcess.exec = sinon.stub().returns(Promise.resolve({ stdout: gitLog }));
});

test.afterEach(t => {
  childProcess.exec = t.context.exec;
});

test('return all tagged versions', (t) => {
  return taggedVersions.getList()
    .then((list) => {
      t.deepEqual(list, [versions['1.2.0'], versions['1.1.1'], versions['1.1.0'], versions['1.0.0']]);
    });
});

test('return all tagged versions within a range', (t) => {
  return taggedVersions.getList('^1.1.0')
    .then((list) => {
      t.deepEqual(list, [versions['1.2.0'], versions['1.1.1'], versions['1.1.0']]);
    });
});

test('return last tagged version', (t) => {
  return taggedVersions.getLastVersion()
    .then((version) => {
      t.deepEqual(version, versions['1.2.0']);
    });
});

test('return last tagged version within a range', (t) => {
  return taggedVersions.getLastVersion('~1.1')
    .then((version) => {
      t.deepEqual(version, versions['1.1.1']);
    });
});
