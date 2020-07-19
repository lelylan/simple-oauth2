'use strict';

const Joi = require('@hapi/joi');
const { Client } = require('./lib/client');
const AuthorizationCodeGrantType = require('./lib/authorization-code-grant-type');
const ResourceOwnerPasswordGrantType = require('./lib/resource-owner-password-grant-type');
const ClientCredentialsGrantType = require('./lib/client-credentials-grant-type');
const { AuthorizationCodeSchema, ClientCredentialsSchema, ResourceOwnerPasswordSchema } = require('./lib/config');

class AuthorizationCode extends AuthorizationCodeGrantType {
  constructor(options) {
    const config = Joi.attempt(options, AuthorizationCodeSchema, 'grant type configuration not supported');
    const client = new Client(config);

    super(config, client);
  }
}

class ClientCredentials extends ClientCredentialsGrantType {
  constructor(options) {
    const config = Joi.attempt(options, ClientCredentialsSchema, 'grant type configuration not supported');
    const client = new Client(config);

    super(config, client);
  }
}

class ResourceOwnerPassword extends ResourceOwnerPasswordGrantType {
  constructor(options) {
    const config = Joi.attempt(options, ResourceOwnerPasswordSchema, 'grant type configuration not supported');
    const client = new Client(config);

    super(config, client);
  }
}

module.exports = {
  ResourceOwnerPassword,
  ClientCredentials,
  AuthorizationCode,
};
