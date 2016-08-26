'use strict';

const joi = require('joi');
const authCodeModule = require('./lib/client/auth-code');
const passwordModule = require('./lib/client/password');
const accessTokenModule = require('./lib/client/access-token');
const clientCredentialsModule = require('./lib/client/client');

const optionsSchema = joi
  .object()
  .keys({
    client: joi.object().keys({
      id: joi.string().required(),
      secret: joi.string().required(),
      secretParamName: joi.string().default('client_secret'),
      idParamName: joi.string().default('client_id'),
    }).required(),
    auth: joi.object().keys({
      tokenHost: joi.string().required().uri(['http', 'https']),
      tokenPath: joi.string().default('/oauth/token'),
      revokePath: joi.string().default('/oauth/revoke'),
      authorizeHost: joi.string().default(joi.ref('tokenHost')),
      authorizePath: joi.string().default('/oauth/authorize'),
    }).required(),
    http: joi.object().keys({
      headers: joi.object().default({
        Accept: 'application/json',
      }),
    }).default().unknown(true),
    options: joi.object().keys({
      useBasicAuthorizationHeader: joi.boolean().default(true),
      useBodyAuth: joi.boolean().default(true),
    }).default(),
  });

module.exports = {

  /**
   * Creates a new simple-oauth2 client
   * with the passed configuration
   *
   * @param  {Object}  options Module options as defined in schema
   */
  create(options) {
    let moduleOptions = Object.assign({}, options || {});
    moduleOptions = joi.attempt(
      moduleOptions,
      optionsSchema,
      'Invalid options provided to simple-oauth2.'
    );

    return {
      authorizationCode: authCodeModule(moduleOptions),
      ownerPassword: passwordModule(moduleOptions),
      clientCredentials: clientCredentialsModule(moduleOptions),
      accessToken: accessTokenModule(moduleOptions),
    };
  },
};
