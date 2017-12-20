'use strict';

const Joi = require('joi');
const authCodeModule = require('./lib/client/auth-code');
const passwordModule = require('./lib/client/password');
const accessTokenModule = require('./lib/client/access-token');
const clientCredentialsModule = require('./lib/client/client');

const optionsSchema = Joi
  .object()
  .keys({
    client: Joi.object().keys({
      id: Joi.string().required(),
      secret: Joi.string().required(),
      secretParamName: Joi.string().default('client_secret'),
      idParamName: Joi.string().default('client_id'),
    }).required(),
    auth: Joi.object().keys({
      tokenHost: Joi.string().required().uri(['http', 'https']),
      tokenPath: Joi.string().default('/oauth/token'),
      revokePath: Joi.string().default('/oauth/revoke'),
      authorizeHost: Joi.string().default(Joi.ref('tokenHost')),
      authorizePath: Joi.string().default('/oauth/authorize'),
    }).required(),
    http: Joi.object().keys({
      headers: Joi.object().default({
        Accept: 'application/json',
      }),
    }).default().unknown(true),
    options: Joi.object().keys({
      bodyFormat: Joi.any().only('form', 'json').default('form'),
      authorizationMode: Joi.any().only('header', 'body').default('header'),
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

    return {
      accessToken: accessTokenModule(options),
      ownerPassword: passwordModule(options),
      authorizationCode: authCodeModule(options),
      clientCredentials: clientCredentialsModule(options),
    };
  },
};
