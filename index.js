'use strict';

const Config = require('./lib/config');
const { Client } = require('./lib/client');
const AuthorizationCodeGrantType = require('./lib/authorization-code-grant-type');
const ResourceOwnerPasswordGrantType = require('./lib/resource-owner-password-grant-type');
const ClientCredentialsGrantType = require('./lib/client-credentials-grant-type');

class AuthorizationCode extends AuthorizationCodeGrantType {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

class ClientCredentials extends ClientCredentialsGrantType {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

class ResourceOwnerPassword extends ResourceOwnerPasswordGrantType {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

module.exports = {
  ResourceOwnerPassword,
  ClientCredentials,
  AuthorizationCode,
};
