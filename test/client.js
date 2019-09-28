'use strict';

const test = require('ava');
const oauth2Module = require('./../index');
const { createModuleConfig } = require('./_module-config');
const {
  getAccessToken,
  createAuthorizationServer,
  getJSONEncodingScopeOptions,
  getFormEncodingScopeOptions,
  getHeaderCredentialsScopeOptions,
} = require('./_authorization-server-mock');

test.serial('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
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
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => resolves to an access token (body credentials and form format)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
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
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => resolves to an access token (header credentials)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
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
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
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
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => resolves to an access token with custom module configuration (http options)', async (t) => {
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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => resolves to an access token while following redirections', async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    random_param: 'random value',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org');
  const originServer = createAuthorizationServer('https://origin-authorization-server.org');

  const redirectionsScope = server.tokenSuccessWithRedirections('https://origin-authorization-server.org', scopeOptions, expectedRequestParams);
  const originScope = originServer.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    random_param: 'random value',
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.clientCredentials.getToken(tokenParams);

  redirectionsScope.done();
  originScope.done();

  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => resolves to an access token while requesting multiple scopes', async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    scope: 'scope-a scope-b',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => resolves to an access token with a custom grant type', async (t) => {
  const expectedRequestParams = {
    grant_type: 'my_grant',
  };

  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, expectedRequestParams);

  const tokenParams = {
    grant_type: 'my_grant',
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
});

test.serial('@getToken => rejects the operation when a non json response is received', async (t) => {
  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
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
    random_param: 'random value',
  };

  const oauth2 = oauth2Module.create(config);
  const error = await t.throwsAsync(() => oauth2.clientCredentials.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
});
