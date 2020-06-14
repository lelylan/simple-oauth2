'use strict';

const test = require('ava');
const { AuthorizationCode } = require('../index');
const AccessToken = require('../lib/access-token');
const { createModuleConfig } = require('./_module-config');
const {
  getAccessToken,
  createAuthorizationServer,
  getJSONEncodingScopeOptions,
  getFormEncodingScopeOptions,
  getHeaderCredentialsScopeOptions,
} = require('./_authorization-server-mock');

test('@authorizeURL => returns the authorization URL with no options and default module configuration', (t) => {
  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with options and default module configuration', (t) => {
  const authorizeParams = {
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'user',
    state: '02afe928b',
  };

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL(authorizeParams);
  const expected = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with an scope array and default module configuration', (t) => {
  const authorizeParams = {
    redirect_uri: 'http://localhost:3000/callback',
    state: '02afe928b',
    scope: ['user', 'account'],
  };

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL(authorizeParams);
  const expected = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&state=02afe928b&scope=user%20account`;

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with an scope array and a custom module configuration (scope separator)', (t) => {
  const authorizeParams = {
    redirect_uri: 'http://localhost:3000/callback',
    state: '02afe928b',
    scope: ['user', 'account'],
  };

  const config = createModuleConfig({
    options: {
      scopeSeparator: ',',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL(authorizeParams);
  const expected = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&state=02afe928b&scope=user%2Caccount`;

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (client id param name)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
      idParamName: 'incredible-param-name',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/oauth/authorize?response_type=code&incredible-param-name=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host with trailing slashes)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com/root/',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize path)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizePath: '/authorize-now',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/authorize-now?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host and path)', (t) => {
  const oauth2 = new AuthorizationCode({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com/api/',
      authorizePath: '/authorize-now',
    },
  });

  const actual = oauth2.authorizeURL();
  const expected = 'https://other-authorization-server.com/authorize-now?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@createToken => creates a new access token instance from a JSON object', async (t) => {
  const oauth2 = new AuthorizationCode(createModuleConfig());
  const accessToken = oauth2.createToken(getAccessToken());

  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scopeOptions = getJSONEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token (body credentials and form format)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scopeOptions = getFormEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'form',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token (header credentials)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig({
    options: {
      authorizationMethod: 'header',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (header credentials + loose encoding)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      Authorization: 'Basic dGhlICsgY2xpZW50ICsgaWQgJiBzeW1ib2xzOnRoZSArIGNsaWVudCArIHNlY3JldCAmIHN5bWJvbHM=',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

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
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (header credentials + strict encoding)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      Authorization: 'Basic dGhlKyUyQitjbGllbnQrJTJCK2lkKyUyNitzeW1ib2xzOnRoZSslMkIrY2xpZW50KyUyQitzZWNyZXQrJTI2K3N5bWJvbHM=',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

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
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/oauth/token', scopeOptions, expectedRequestParams);

  const config = createModuleConfig({
    auth: {
      tokenHost: 'https://authorization-server.org:443/root/',
      tokenPath: '/oauth/token',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (http options)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-MYTHICAL-HEADER': 'mythical value',
      'USER-AGENT': 'hello agent',
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig({
    http: {
      headers: {
        'X-MYTHICAL-HEADER': 'mythical value',
        'USER-AGENT': 'hello agent',
      },
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom module configuration (scope separator)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    scope: 'scope-a,scope-b',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig({
    options: {
      scopeSeparator: ',',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    scope: ['scope-a', 'scope-b'],
  };

  const oauth2 = new AuthorizationCode(config);
  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token while following redirections', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org');
  const redirectionsScope = server.tokenSuccessWithRedirections('https://origin-authorization-server.org', scopeOptions, expectedRequestParams);

  const originServer = createAuthorizationServer('https://origin-authorization-server.org');
  const originScope = originServer.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const accessToken = await oauth2.getToken(tokenParams);

  redirectionsScope.done();
  originScope.done();

  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token while requesting multiple scopes', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    scope: 'scope-a scope-b',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with a custom grant type', async (t) => {
  const expectedRequestParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'my_grant',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'my_grant',
  };

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const accessToken = await oauth2.getToken(tokenParams);

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with no params', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const accessToken = await oauth2.getToken();

  scope.done();
  t.true(accessToken instanceof AccessToken);
});

test.serial('@getToken => resolves to an access token with custom (inline) http options', async (t) => {
  const expectedRequestParams = {
    grant_type: 'authorization_code',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-REQUEST-ID': 123,
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

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
  const expectedRequestParams = {
    grant_type: 'authorization_code',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

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
  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scopeOptions = getJSONEncodingScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithNonJSONContent(scopeOptions, expectedRequestParams);

  const config = createModuleConfig({
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = new AuthorizationCode(config);
  const error = await t.throwsAsync(() => oauth2.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
});
