/**
 * Query git for semantic version tag.
 *
 * @typedef {{tag: string, version: string, hash: string, date: Date}} Commit
 */

'use strict';

const getRepo = require('./repo');
const getTags = require('./tags');

function isString(v) {
  return typeof v === 'string';
}

/**
 * Get list of tag with a  semantic version name.
 *
 * @param  {object|string}   optionsOrRange     Options map or range string
 * @param  {string}          options.range      Semantic range to filter tags with
 * @param  {string|string[]} options.rev        Revision range to filter tags with
 * @return {Promise<Array<Commit>,Error>}
 */
function getList(optionsOrRange) {
  const options = isString(optionsOrRange) ? { range: optionsOrRange } : optionsOrRange;

  return getRepo(options)
    .then(repo => getTags(repo, options));
}

/**
 * Get most recent tag.
 *
 * @param  {object|string}   optionsOrRange     Options map or range string
 * @param  {string}          options.range      Semantic range to filter tag with
 * @param  {string|string[]} options.rev        Revision range to filter tag with
 * @return {Promise<Commit,Error>}
 */
function getLastVersion(optionsOrRange) {
  return getList(optionsOrRange).then(commits => commits[0]);
}

module.exports = {
  getList,
  getLastVersion,
};
