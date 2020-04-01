'use strict';

const Joi = require('@hapi/joi');
const Client = require('./lib/client');
const AuthorizationCode = require('./lib/grants/authorization-code');
const PasswordOwner = require('./lib/grants/password-owner');
const ClientCredentials = require('./lib/grants/client-credentials');
const AccessToken = require('./lib/access-token');
const ModuleSchema = require('./lib/module-schema');

module.exports = {

  /**
   * Creates a new simple-oauth2 client with the provided configuration
   * @param  {Object}  opts Module options as defined in schema
   * @returns {Object} The simple-oauth2 client
   */
  create(opts = {}) {
    const options = Joi.attempt(opts, ModuleSchema, 'Invalid options provided to simple-oauth2');
    const client = new Client(options);

    return Object.freeze({
      accessToken: {
        create: AccessToken.factory(options, client),
      },
      ownerPassword: new PasswordOwner(options, client),
      authorizationCode: new AuthorizationCode(options, client),
      clientCredentials: new ClientCredentials(options, client),
    });
  },
};
