import Config from './lib/config.js';
import { Client } from './lib/client/index.js';
import AuthorizationCodeGrantType from './lib/authorization-code-grant-type.js';
import ResourceOwnerPasswordGrantType from './lib/resource-owner-password-grant-type.js';
import ClientCredentialsGrantType from './lib/client-credentials-grant-type.js';

export class AuthorizationCode extends AuthorizationCodeGrantType {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

export class ClientCredentials extends ClientCredentialsGrantType {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}

export class ResourceOwnerPassword extends ResourceOwnerPasswordGrantType {
  constructor(options) {
    const config = Config.apply(options);
    const client = new Client(config);

    super(config, client);
  }
}
