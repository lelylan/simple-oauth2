'use strict';

const Client = require('./lib/client');
const Config = require('./lib/config');
const AuthorizationCodeGrant = require('./lib/grants/authorization-code');
const PasswordOwnerGrant = require('./lib/grants/password-owner');
const ClientCredentialsGrant = require('./lib/grants/client-credentials');

class AuthorizationCode extends AuthorizationCodeGrant {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

class ClientCredentials extends ClientCredentialsGrant {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

class PasswordOwner extends PasswordOwnerGrant {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

module.exports = {
  PasswordOwner,
  ClientCredentials,
  AuthorizationCode,
};
