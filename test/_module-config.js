'use strict';

const Hoek = require('@hapi/hoek');
const Config = require('../lib/config');

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

function createModuleConfigWithDefaults(config) {
  return Config.apply(createModuleConfig(config));
}

module.exports = {
  createModuleConfig,
  createModuleConfigWithDefaults,
};
