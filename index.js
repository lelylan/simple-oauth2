'use strict';

const Joi = require('joi');
const authCodeModule = require('./lib/client/auth-code');
const passwordModule = require('./lib/client/password');
const accessTokenModule = require('./lib/client/access-token');
const clientCredentialsModule = require('./lib/client/client');

// https://tools.ietf.org/html/draft-ietf-oauth-v2-31#appendix-A.1
const vsCharRegEx = /^[\x20-\x7E]*$/;

const optionsSchema = Joi
  .object()
  .keys({
    client: Joi.object().keys({
      id: Joi.string().regex(vsCharRegEx).allow(''),
      secret: Joi.string().regex(vsCharRegEx).allow(''),
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
      bodyFormat: Joi.any().valid('form', 'json').default('form'),
      useBasicAuthorizationHeader: Joi.boolean().default(true),
      useBodyAuth: Joi.boolean().default(true),
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
    const moduleOptions = Joi.attempt(
      options || {},
      optionsSchema,
      'Invalid options provided to simple-oauth2'
    );

    return {
      authorizationCode: authCodeModule(moduleOptions),
      ownerPassword: passwordModule(moduleOptions),
      clientCredentials: clientCredentialsModule(moduleOptions),
      accessToken: accessTokenModule(moduleOptions),
    };
  },
};
