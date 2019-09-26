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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
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

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
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
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.ownerPassword.getToken(tokenParams);

  redirectionsScope.done();
  originScope.done();

  t.deepEqual(token, getAccessToken());
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
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
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
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, getAccessToken());
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

  const oauth2 = oauth2Module.create(config);
  const error = await t.throwsAsync(() => oauth2.ownerPassword.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
});
