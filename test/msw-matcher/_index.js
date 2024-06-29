'use strict';

const { Scope } = require('./_scope');

function scope(baseURL) {
  return new Scope(baseURL);
}

module.exports = { scope };
