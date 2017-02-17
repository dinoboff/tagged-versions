'use strict';

const git = require('nodegit');

function find(gitDir) {
  if (gitDir) {
    return Promise.resolve(gitDir);
  }

  return git.Repository.discover('.', 0, '');
}

/**
 * Initial a nodegit repository.
 *
 * Target the repository at the provided path or try to find the the repository
 * in the current working directory or its parents.
 *
 * @param  {object} [options.gitDir] Path to the repository.
 * @return {Promise<nodegit.Repository, Error>}
 */
module.exports = function openRepo({ gitDir } = {}) {
  return find(gitDir)
    .then(dir => git.Repository.open(dir));
};
