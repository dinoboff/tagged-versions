'use strict';

const git = require('nodegit');
const gitRange = require('git-range');
const omit = require('lodash.omit');
const Promise = require('bluebird');
const semver = require('semver');

function satisfies(range) {
  return tagName => semver.valid(tagName) && semver.satisfies(tagName, range);
}

function filterTagNames(names, range) {
  const test = range == null ? semver.valid : satisfies(range);

  return names.filter(test);
}

function lookupHash(repo, name) {
  return git.AnnotatedCommit.fromRevspec(repo, name)
    .then(tag => ({
      oid: tag.id(),
      hash: tag.id().toString(),
      tag: name,
      version: semver.valid(name),
    }));
}

function semverTags(repo, range) {
  return git.Tag.list(repo)
    .then((names) => {
      const semverNames = filterTagNames(names, range);

      return Promise.all(semverNames.map(lookupHash.bind(null, repo)));
    });
}

function filterTags(repo, tags, range) {
  const walker = range.walker();
  const tagsMap = tags.reduce(
    (map, tag) => {
      const list = map.get(tag.hash);

      if (!list) {
        map.set(tag.hash, [tag]);
      } else {
        list.push(tag);
      }

      return map;
    },
    new Map([])
  );
  const result = [];
  const iterCommits = () => walker.next()
    .then((oid) => {
      const list = tagsMap.get(oid.toString());

      if (list) {
        result.push(...list);
      }

      return iterCommits();
    })
    .catch((err) => {
      /* istanbul ignore next */
      if (err.errno !== git.Error.CODE.ITEROVER) {
        return Promise.reject(err);
      }

      return result;
    });

  return iterCommits();
}

function lookupDate(repo, tag) {
  return repo.getCommit(tag.oid)
    .then(commit => Object.assign(tag, { date: commit.date() }));
}

function compareTags(a, b) {
  return semver.rcompare(a.version, b.version);
}

function processResult(repo, tags) {
  const addDate = lookupDate.bind(null, repo);

  return Promise.all(tags.map(addDate))
    .then(commits => commits.map(c => omit(c, 'oid')).sort(compareTags));
}

/**
 * Retrieve the list of tag with semver name.
 *
 * @param  {nodegit.Repository} repo          Repository to list the tag of
 * @param  {string}             options.range Semantic range to filter tag with
 * @param  {string}             options.rev   Rev range the tags should be part of
 * @return {Promise<{hash: string, tag: string, version: string, date: Date},Error>
 */
module.exports = function getTags(repo, { range, rev } = {}) {
  const tagsPromise = semverTags(repo, range);
  const finish = processResult.bind(null, repo);

  if (rev == null) {
    return tagsPromise.then(finish);
  }

  return Promise.all([tagsPromise, gitRange.parse(repo, rev)])
    .spread(filterTags.bind(null, repo))
    .then(finish);
};
