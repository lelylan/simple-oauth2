'use strict';

const Hoek = require('@hapi/hoek');

const baseConfig = {
  client: {
    id: 'the client id',
    secret: 'the client secret',
  },
  auth: {
    tokenHost: 'https://authorization-server.org',
  },
};

function createModuleConfig(config = {}) {
  return Hoek.applyToDefaults(baseConfig, config);
}

module.exports = {
  createModuleConfig,
};
