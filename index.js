'use strict';

const appConfig = require('./lib/config');
const utils = require('./lib/utils');
const authCodeModule = require('./lib/client/auth-code');
const passwordModule = require('./lib/client/password');
const clienteCredentialsModule = require('./lib/client/client');
const accessTokenModule = require('./lib/client/access-token');
const coreModule = require('./lib/core');

module.exports = function (config) {
  config = utils.configure(config, appConfig);

  return {
    authCode: authCodeModule(config),
    password: passwordModule(config),
    client: clienteCredentialsModule(config),
    accessToken: accessTokenModule(config),
    api: coreModule(config).api,
  };
};
