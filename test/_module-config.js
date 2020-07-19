'use strict';

const Hoek = require('@hapi/hoek');
const Joi = require('@hapi/joi');
const { AuthorizationCodeSchema, ClientCredentialsSchema, ResourceOwnerPasswordSchema } = require('../lib/config');

const schemas = {
  'authorization-code': AuthorizationCodeSchema,
  'client-credentials': ClientCredentialsSchema,
  'resource-owner-password': ResourceOwnerPasswordSchema,
};

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

function createModuleConfigWithDefaults(grantType, config) {
  Hoek.assert(schemas[grantType], 'grant type configuration not supported');

  return Joi.attempt(createModuleConfig(config), schemas[grantType]);
}

module.exports = {
  createModuleConfig,
  createModuleConfigWithDefaults,
};
