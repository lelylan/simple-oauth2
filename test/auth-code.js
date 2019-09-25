'use strict';

const test = require('ava');
const oauth2Module = require('./../index');
const { createModuleConfig } = require('./_module-config');
const createAuthorizationServer = require('./_authorization-server-mock');

test('@authorizeURL => returns the authorization URL with no options and default module configuration', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const actual = oauth2.authorizationCode.authorizeURL();
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
  const oauth2 = oauth2Module.create(config);

  const actual = oauth2.authorizationCode.authorizeURL(authorizeParams);
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
  const oauth2 = oauth2Module.create(config);

  const actual = oauth2.authorizationCode.authorizeURL(authorizeParams);
  const expected = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&state=02afe928b&scope=user%20account`;

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

  const oauth2 = oauth2Module.create(config);

  const actual = oauth2.authorizationCode.authorizeURL();
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

  const oauth2 = oauth2Module.create(config);

  const actual = oauth2.authorizationCode.authorizeURL();
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

  const oauth2 = oauth2Module.create(config);

  const actual = oauth2.authorizationCode.authorizeURL();
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

  const oauth2 = oauth2Module.create(config);

  const actual = oauth2.authorizationCode.authorizeURL();
  const expected = 'https://authorization-server.org/authorize-now?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host and path)', (t) => {
  const oauth2 = oauth2Module.create({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com',
      authorizePath: '/authorize-now',
    },
  });

  const actual = oauth2.authorizationCode.authorizeURL();
  const expected = 'https://other-authorization-server.com/authorize-now?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, server.getAccessToken());
});

test('@getToken => resolves to an access token (body credentials and form format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, server.getAccessToken());
});

test('@getToken => resolves to an access token (header credentials)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, server.getAccessToken());
});

test('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/root/oauth/token', scopeOptions, expectedRequestParams);

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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, server.getAccessToken());
});

test('@getToken => resolves to an access token with custom module configuration (http options)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
      'X-MYTHICAL-HEADER': 'mythical value',
      'USER-AGENT': 'hello agent',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, server.getAccessToken());
});

test('@getToken => resolves to an access token while following redirections', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const server = createAuthorizationServer('https://authorization-server.org');
  const originServer = createAuthorizationServer('https://origin-authorization-server.org');
  const redirectionsScope = server.tokenSuccessWithRedirections('https://origin-authorization-server.org', scopeOptions, expectedRequestParams);
  const originScope = originServer.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.authorizationCode.getToken(tokenParams);

  redirectionsScope.done();
  originScope.done();

  t.deepEqual(token, originServer.getAccessToken());
});

test('@getToken => resolves to an access token while requesting multiple scopes', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    scope: 'scope-a scope-b',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, server.getAccessToken());
});

test('@getToken => resolves to an access token with a custom grant type', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const expectedRequestParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'my_grant',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'my_grant',
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, server.getAccessToken());
});


test('@getToken => rejects the operation when a non json response is received', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const expectedRequestParams = {
    grant_type: 'authorization_code',
    code: 'code',
    redirect_uri: 'http://callback.com',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

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

  const oauth2 = oauth2Module.create(config);
  const error = await t.throwsAsync(() => oauth2.authorizationCode.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
});
