'use strict';

const test = require('ava');
const { setupServer } = require('msw/node');

const Chance = require('./_chance');
const AccessToken = require('../lib/access-token');
const { Client } = require('../lib/client');
const { createModuleConfigWithDefaults: createModuleConfig } = require('./_module-config');
const { createAuthorizationServer, getHeaderCredentialsScopeOptions } = require('./_authorization-server-mock');

const chance = new Chance();
const mockServer = setupServer();

const scopeOptions = {
  reqheaders: {
    Accept: 'application/json',
    Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
  },
};

test.before(() => mockServer.listen());
test.after(() => mockServer.close());

test('@revoke => performs the access token revoke', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.access_token,
    token_type_hint: 'access_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccess(scopeOptions, revokeParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('access_token'));

  scope.done();
}));

test('@revoke => performs the refresh token revoke', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccess(scopeOptions, revokeParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token'));

  scope.done();
}));

test('@revoke => performs a token revoke with a custom revoke path', mockServer.boundary(async (t) => {
  const config = createModuleConfig({
    auth: {
      revokePath: '/the-custom/revoke-path',
    },
  });

  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccessWithCustomPath('/the-custom/revoke-path', scopeOptions, revokeParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token'));

  scope.done();
}));

test('@revoke => performs a token revoke with custom (inline) http options', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const customScopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-REQUEST-ID': 123,
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccess(customScopeOptions, revokeParams);

  mockServer.use(...scope.handlers);

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token', httpOptions));

  scope.done();
}));

test('@revoke => performs a token revoke with custom (inline) http options without overriding (required) http options', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccess(scopeOptions, revokeParams);

  mockServer.use(...scope.handlers);

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token', httpOptions));

  scope.done();
}));

test('@revoke => throws an error with an invalid tokenType option', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken();
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.throwsAsync(() => accessToken.revoke('invalid_value'), {
    message: /Invalid token type. Only access_token or refresh_token are valid values/,
  });
}));

test('@revokeAll => revokes both the access and refresh tokens', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshTokenRevokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const accessTokenRevokeParams = {
    token: accessTokenResponse.access_token,
    token_type_hint: 'access_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeAllSuccess(scopeOptions, accessTokenRevokeParams, refreshTokenRevokeParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revokeAll());

  scope.done();
}));

test('@revokenAll => revokes both the access and refresh tokens with custom (inline) http options', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshTokenRevokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const accessTokenRevokeParams = {
    token: accessTokenResponse.access_token,
    token_type_hint: 'access_token',
  };

  const customScopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-REQUEST-ID': 123,
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeAllSuccess(customScopeOptions, accessTokenRevokeParams, refreshTokenRevokeParams);

  mockServer.use(...scope.handlers);

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revokeAll(httpOptions));

  scope.done();
}));

test('@revokeAll => revokes tboth the access and refresh tokens with custom (inline) http options without overriding (required) http options', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshTokenRevokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const accessTokenRevokeParams = {
    token: accessTokenResponse.access_token,
    token_type_hint: 'access_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeAllSuccess(scopeOptions, accessTokenRevokeParams, refreshTokenRevokeParams);

  mockServer.use(...scope.handlers);

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revokeAll(httpOptions));

  scope.done();
}));

test('@revokeAll => revokes the refresh token only if the access token is successfully revoked', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const accessTokenRevokeParams = {
    token: accessTokenResponse.access_token,
    token_type_hint: 'access_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeError(scopeOptions, accessTokenRevokeParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  const error = await t.throwsAsync(() => accessToken.revokeAll(), { instanceOf: Error });

  t.true(error.isBoom);
  t.is(error.output.statusCode, 500);

  scope.done();
}));
