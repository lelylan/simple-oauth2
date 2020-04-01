'use strict';

const Joi = require('@hapi/joi');
const Client = require('./lib/client');
const AuthorizationCode = require('./lib/grants/authorization-code');
const PasswordOwner = require('./lib/grants/password-owner');
const ClientCredentials = require('./lib/grants/client-credentials');
const AccessToken = require('./lib/access-token');
const ModuleSchema = require('./lib/module-schema');

function clientCredentialsFactory(opts) {
  const options = Joi.attempt(opts, ModuleSchema, 'Invalid options provided to simple-oauth2');

  const client = new Client(options);
  const module = new ClientCredentials(options, client);

  module.accessToken = {
    create: AccessToken.factory(options, client),
  };

  return module;
}

function passwordOwnerFactory(opts) {
  const options = Joi.attempt(opts, ModuleSchema, 'Invalid options provided to simple-oauth2');

  const client = new Client(options);
  const module = new PasswordOwner(options, client);

  module.accessToken = {
    create: AccessToken.factory(options, client),
  };

  return module;
}

function authorizationCodeFactory(opts) {
  const options = Joi.attempt(opts, ModuleSchema, 'Invalid options provided to simple-oauth2');
  const client = new Client(options);
  const module = new AuthorizationCode(options, client);

  module.accessToken = {
    create: AccessToken.factory(options, client),
  };

  return module;
}

module.exports = {
  passwordOwner: passwordOwnerFactory,
  clientCredentials: clientCredentialsFactory,
  authorizationCode: authorizationCodeFactory,
};
