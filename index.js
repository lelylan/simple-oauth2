'use strict';

const joi = require('joi');
const authCodeModule = require('./lib/client/auth-code');
const passwordModule = require('./lib/client/password');
const clienteCredentialsModule = require('./lib/client/client');
const accessTokenModule = require('./lib/client/access-token');

const optionsSchema = joi
  .object()
  .keys({
    clientID: joi.string().required(),
    clientSecret: joi.string().required(),
    site: joi.string().required(),
    tokenPath: joi.string().default('/oauth/token'),
    authorizationPath: joi.string().default('/oauth/authorize'),
    revocationPath: joi.string().default('/oauth/revoke'),
    useBasicAuthorizationHeader: joi.boolean().default(true),
    clientSecretParameterName: joi.string().default('client_secret'),
    useBodyAuth: joi.string().default(true),
    headers: joi.object(),
  });

module.exports = function (options) {
  const opts = Object.assign({}, options || {});
  const validOptions = joi
    .attempt(opts, optionsSchema, 'Invalid options provided to simple-oauth2.');

  return {
    authCode: authCodeModule(validOptions),
    password: passwordModule(validOptions),
    client: clienteCredentialsModule(validOptions),
    accessToken: accessTokenModule(validOptions),
  };
};
