'use strict';

const utils = require('./lib/utils');
const defaults = require('./lib/config');
const authCodeModule = require('./lib/client/auth-code');
const passwordModule = require('./lib/client/password');
const clienteCredentialsModule = require('./lib/client/client');
const accessTokenModule = require('./lib/client/access-token');

module.exports = function (options) {
  const config = utils.configure(options, defaults);

  return {
    authCode: authCodeModule(config),
    password: passwordModule(config),
    client: clienteCredentialsModule(config),
    accessToken: accessTokenModule(config),
  };
};
