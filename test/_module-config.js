'use strict';

const { merge } = require('lodash');

const baseConfig = {
  client: {
    id: 'the client id',
    secret: 'the client secret',
  },
  auth: {
    tokenHost: 'https://authorization-server.org',
  },
};

function createModuleConfig(config) {
  return merge({}, baseConfig, config);
}

module.exports = {
  createModuleConfig,
};
