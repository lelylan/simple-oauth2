'use strict';

const Hoek = require('@hapi/hoek');
const Joi = require('@hapi/joi');
const { AuthorizationCodeSchema } = require('../lib/config');

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

function createModuleConfigWithDefaults(config = {}) {
  return Joi.attempt(createModuleConfig(config), AuthorizationCodeSchema); // any grant type schema works here
}

module.exports = {
  createModuleConfig,
  createModuleConfigWithDefaults,
};
