'use strict';

const Joi = require('joi');
const { authorizationMethodEnum, bodyFormatEnum, credentialsEncodingModeEnum } = require('./client');

// https://tools.ietf.org/html/draft-ietf-oauth-v2-31#appendix-A.1
const vsCharRegEx = /^[\x20-\x7E]*$/;

const clientSchema = Joi.object().keys({
  id: Joi.string().pattern(vsCharRegEx).allow(''),
  secret: Joi.string().pattern(vsCharRegEx).allow(''),
  secretParamName: Joi.string().default('client_secret'),
  idParamName: Joi.string().default('client_id'),
}).required();

const authSchema = Joi.object().keys({
  tokenHost: Joi.string().required().uri({ scheme: ['http', 'https'] }),
  tokenPath: Joi.string().default('/oauth/token'),
  refreshPath: Joi.string().default(Joi.ref('tokenPath')),
  revokePath: Joi.string().default('/oauth/revoke'),
  authorizeHost: Joi.string().uri({ scheme: ['http', 'https'] }).default(Joi.ref('tokenHost')),
  authorizePath: Joi.string().default('/oauth/authorize'),
}).required();

const optionsSchema = Joi.object().keys({
  scopeSeparator: Joi.string().default(' '),
  credentialsEncodingMode: Joi
    .string()
    .valid(...Object.values(credentialsEncodingModeEnum))
    .default(credentialsEncodingModeEnum.STRICT),
  bodyFormat: Joi
    .string()
    .valid(...Object.values(bodyFormatEnum))
    .default(bodyFormatEnum.FORM),
  authorizationMethod: Joi
    .string()
    .valid(...Object.values(authorizationMethodEnum))
    .default(authorizationMethodEnum.HEADER),
}).default();

const ModuleSchema = Joi.object().keys({
  client: clientSchema,
  auth: authSchema,
  http: Joi.object().unknown(true),
  options: optionsSchema,
});

const Config = {
  apply(options) {
    return Joi.attempt(options, ModuleSchema, 'Invalid options provided to simple-oauth2');
  },
};

module.exports = Config;
