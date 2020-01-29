'use strict';

const Joi = require('@hapi/joi');
const Client = require('./lib/client');
const AuthorizationCode = require('./lib/grants/authorization-code');
const PasswordOwner = require('./lib/grants/password-owner');
const ClientCredentials = require('./lib/grants/client-credentials');
const AccessToken = require('./lib/access-token');

// https://tools.ietf.org/html/draft-ietf-oauth-v2-31#appendix-A.1
const vsCharRegEx = /^[\x20-\x7E]*$/;

const optionsSchema = Joi
  .object()
  .keys({
    client: Joi.object().keys({
      id: Joi.string().pattern(vsCharRegEx).allow(''),
      secret: Joi.string().pattern(vsCharRegEx).allow(''),
      secretParamName: Joi.string().default('client_secret'),
      idParamName: Joi.string().default('client_id'),
    }).required(),
    auth: Joi.object().keys({
      tokenHost: Joi.string().required().uri({ scheme: ['http', 'https'] }),
      tokenPath: Joi.string().default('/oauth/token'),
      revokePath: Joi.string().default('/oauth/revoke'),
      authorizeHost: Joi.string().uri({ scheme: ['http', 'https'] }).default(Joi.ref('tokenHost')),
      authorizePath: Joi.string().default('/oauth/authorize'),
    }).required(),
    http: Joi.object().unknown(true),
    options: Joi.object().keys({
      scopeSeparator: Joi.string().default(' '),
      credentialsEncodingMode: Joi.string().valid('strict', 'loose').default('strict'),
      bodyFormat: Joi.string().valid('form', 'json').default('form'),
      authorizationMethod: Joi.any().valid('header', 'body').default('header'),
    }).default(),
  });

module.exports = {

  /**
   * Creates a new simple-oauth2 client with the provided configuration
   * @param  {Object}  opts Module options as defined in schema
   * @returns {Object} The simple-oauth2 client
   */
  create(opts = {}) {
    const options = Joi.attempt(opts, optionsSchema, 'Invalid options provided to simple-oauth2');
    const client = new Client(options);

    return {
      accessToken: {
        create: AccessToken.factory(options, client),
      },
      ownerPassword: new PasswordOwner(options, client),
      authorizationCode: new AuthorizationCode(options, client),
      clientCredentials: new ClientCredentials(options, client),
    };
  },
};
