'use strict';

const test = require('ava');
const { setupServer } = require('msw/node');
const { ClientCredentials } = require('../index');
const AccessToken = require('../lib/access-token');
const { createModuleConfig } = require('./_module-config');
const {
  createAuthorizationServer,
  getJSONEncodingScopeOptions,
  getFormEncodingScopeOptions,
  getHeaderCredentialsScopeOptions,
} = require('./_authorization-server-mock');

const mockServer = setupServer();

test.before(() => mockServer.listen());
test.after(() => mockServer.close());

test('@getToken => resolves to an access token (body credentials and JSON format)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
  };

  const scopeOptions = getJSONEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token (body credentials and form format)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scopeOptions = getFormEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'form',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token (header credentials)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig({
    options: {
      authorizationMethod: 'header',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with custom module configuration (header credentials + loose encoding)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      Authorization: 'Basic dGhlICsgY2xpZW50ICsgaWQgJiBzeW1ib2xzOnRoZSArIGNsaWVudCArIHNlY3JldCAmIHN5bWJvbHM=',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

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
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with custom module configuration (header credentials + strict encoding)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      Authorization: 'Basic dGhlKyUyQitjbGllbnQrJTJCK2lkKyUyNitzeW1ib2xzOnRoZSslMkIrY2xpZW50KyUyQitzZWNyZXQrJTI2K3N5bWJvbHM=',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

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
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with custom module configuration (header credentials with unescaped characters + strict encoding)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      Authorization: 'Basic SSUyN20rdGhlX2NsaWVudC1pZCUyMSslMjYrJTI4c3ltYm9scyUyQSUyOTpJJTI3bSt0aGVfY2xpZW50LXNlY3JldCUyMSslMjYrJTI4c3ltYm9scyUyQSUyOQ==',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig({
    client: {
      id: 'I\'m the_client-id! & (symbols*)',
      secret: 'I\'m the_client-secret! & (symbols*)',
    },
    options: {
      authorizationMethod: 'header',
      credentialsEncodingMode: 'strict',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with custom module configuration (access token host and path)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/oauth/token', scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig({
    auth: {
      tokenHost: 'https://authorization-server.org:443/root/',
      tokenPath: '/oauth/token',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with custom module configuration (http options)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-MYTHICAL-HEADER': 'mythical value',
      'USER-AGENT': 'hello agent',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig({
    http: {
      headers: {
        'X-MYTHICAL-HEADER': 'mythical value',
        'USER-AGENT': 'hello agent',
      },
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken = resolves to an access token with custom module configuration (scope separator)', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    scope: 'scope-a,scope-b',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const tokenParams = {
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig({
    options: {
      scopeSeparator: ',',
    },
  });

  const oauth2 = new ClientCredentials(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token while requesting multiple scopes', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    scope: 'scope-a scope-b',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const tokenParams = {
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig();
  const oauth2 = new ClientCredentials(config);

  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with a custom grant type', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'my_grant',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const tokenParams = {
    grant_type: 'my_grant',
  };

  const config = createModuleConfig();
  const oauth2 = new ClientCredentials(config);

  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with no params', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig();
  const oauth2 = new ClientCredentials(config);

  const accessToken = await oauth2.getToken();

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with custom (inline) http options', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-REQUEST-ID': 123,
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig();
  const oauth2 = new ClientCredentials(config);

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = await oauth2.getToken(null, httpOptions);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => resolves to an access token with custom (inline) http options without overriding (required) http options', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig();
  const oauth2 = new ClientCredentials(config);

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = await oauth2.getToken(null, httpOptions);

  scope.done();
  t.true(accessToken instanceof AccessToken);
}));

test('@getToken => rejects the operation when a non json response is received', mockServer.boundary(async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
  };

  const scopeOptions = getJSONEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithNonJSONContent(scopeOptions, expectedRequestParams);

  mockServer.use(...scope.handlers);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    random_param: 'random value',
  };

  const oauth2 = new ClientCredentials(config);
  const error = await t.throwsAsync(() => oauth2.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
}));
