'use strict';

const test = require('ava');
const { ResourceOwnerPassword } = require('../index');
const AccessToken = require('../lib/access-token');
const { createModuleConfig } = require('./_module-config');
const {
  getAccessToken,
  createAuthorizationServer,
  getJSONEncodingScopeOptions,
  getFormEncodingScopeOptions,
  getHeaderCredentialsScopeOptions,
} = require('./_authorization-server-mock');

test('@createToken => creates a new access token instance from a JSON object', async (t) => {
  const oauth2 = new ResourceOwnerPassword(createModuleConfig());
  const accessToken = oauth2.createToken(getAccessToken());

  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scopeOptions = getJSONEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token (body credentials and form format)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scopeOptions = getFormEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'form',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token (header credentials)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    options: {
      authorizationMethod: 'header',
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (header credentials + loose encoding)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      Authorization: 'Basic dGhlICsgY2xpZW50ICsgaWQgJiBzeW1ib2xzOnRoZSArIGNsaWVudCArIHNlY3JldCAmIHN5bWJvbHM=',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    client: {
      id: 'the + client + id & symbols',
      secret: 'the + client + secret & symbols',
    },
    options: {
      authorizationMethod: 'header',
      credentialsEncodingMode: 'loose',
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (header credentials + strict encoding)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      Authorization: 'Basic dGhlKyUyQitjbGllbnQrJTJCK2lkKyUyNitzeW1ib2xzOnRoZSslMkIrY2xpZW50KyUyQitzZWNyZXQrJTI2K3N5bWJvbHM=',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    client: {
      id: 'the + client + id & symbols',
      secret: 'the + client + secret & symbols',
    },
    options: {
      authorizationMethod: 'header',
      credentialsEncodingMode: 'strict',
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/oauth/token', scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    auth: {
      tokenHost: 'https://authorization-server.org:443/root/',
      tokenPath: '/oauth/token',
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (http options)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-MYTHICAL-HEADER': 'mythical value',
      'USER-AGENT': 'hello agent',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    http: {
      headers: {
        'X-MYTHICAL-HEADER': 'mythical value',
        'USER-AGENT': 'hello agent',
      },
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (token separator)', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    scope: 'scope-a,scope-b',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const tokenParams = {
    username: 'alice',
    password: 'secret',
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig({
    options: {
      scopeSeparator: ',',
    },
  });

  const oauth2 = new ResourceOwnerPassword(config);

  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token while following redirections', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org');
  const originServer = createAuthorizationServer('https://origin-authorization-server.org');
  const redirectionsScope = server.tokenSuccessWithRedirections('https://origin-authorization-server.org', scopeOptions, tokenRequestParams);
  const originScope = originServer.tokenSuccess(scopeOptions, tokenRequestParams);

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const config = createModuleConfig();
  const oauth2 = new ResourceOwnerPassword(config);

  const accessToken = await oauth2.getToken(tokenParams);

  redirectionsScope.done();
  originScope.done();

  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token while requesting multiple scopes', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    scope: 'scope-a scope-b',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const tokenParams = {
    username: 'alice',
    password: 'secret',
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig();
  const oauth2 = new ResourceOwnerPassword(config);

  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with a custom grant type', async (t) => {
  const tokenRequestParams = {
    grant_type: 'my_grant',
    username: 'alice',
    password: 'secret',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const tokenParams = {
    grant_type: 'my_grant',
    username: 'alice',
    password: 'secret',
  };

  const config = createModuleConfig();
  const oauth2 = new ResourceOwnerPassword(config);

  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with no params', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig();
  const oauth2 = new ResourceOwnerPassword(config);

  const accessToken = await oauth2.getToken();

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom (inline) http options', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-REQUEST-ID': 123,
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig();
  const oauth2 = new ResourceOwnerPassword(config);

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = await oauth2.getToken(null, httpOptions);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom (inline) http options without overriding (required) http options', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, tokenRequestParams);

  const config = createModuleConfig();
  const oauth2 = new ResourceOwnerPassword(config);

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = await oauth2.getToken(null, httpOptions);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => rejects the operation when a non json response is received', async (t) => {
  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scopeOptions = getJSONEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithNonJSONContent(scopeOptions, tokenRequestParams);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const oauth2 = new ResourceOwnerPassword(config);
  const error = await t.throwsAsync(() => oauth2.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
});
