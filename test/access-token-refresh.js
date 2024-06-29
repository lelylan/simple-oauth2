'use strict';

const test = require('ava');
const { setupServer } = require('msw/node');

const Chance = require('./_chance');
const AccessToken = require('../lib/access-token');
const { Client } = require('../lib/client');
const { has } = require('./_property');
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

test('@refresh => creates a new access token with default params', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshParams = {
    grant_type: 'refresh_token',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh();

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with a custom grant type', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshParams = {
    grant_type: 'my_grant',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    grant_type: 'my_grant',
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with multiple scopes', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshParams = {
    grant_type: 'refresh_token',
    scope: 'scope-a scope-b',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: ['scope-a', 'scope-b'],
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with custom params', mockServer.boundary(async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshParams = {
    grant_type: 'refresh_token',
    scope: 'TESTING_EXAMPLE_SCOPES',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: 'TESTING_EXAMPLE_SCOPES',
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with custom module configuration (scope separator)', mockServer.boundary(async (t) => {
  const config = createModuleConfig({
    options: {
      scopeSeparator: ',',
    },
  });

  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshParams = {
    grant_type: 'refresh_token',
    scope: 'scope-a,scope-b',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: ['scope-a', 'scope-b'],
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with a custom token path', mockServer.boundary(async (t) => {
  const config = createModuleConfig({
    auth: {
      tokenPath: '/the-custom/path',
    },
  });

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const client = new Client(config);

  const refreshParams = {
    grant_type: 'refresh_token',
    scope: 'TESTING_EXAMPLE_SCOPES',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/the-custom/path', scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with a custom refresh path', mockServer.boundary(async (t) => {
  const config = createModuleConfig({
    auth: {
      refreshPath: '/the-custom/refresh-path',
    },
  });

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const client = new Client(config);

  const refreshParams = {
    grant_type: 'refresh_token',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/the-custom/refresh-path', scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh();

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with custom (inline) http options', mockServer.boundary(async (t) => {
  const config = createModuleConfig();

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const client = new Client(config);

  const refreshParams = {
    grant_type: 'refresh_token',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const customScopeOptions = getHeaderCredentialsScopeOptions({
    reqheaders: {
      'X-REQUEST-ID': 123,
    },
  });

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(customScopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh(null, httpOptions);

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test('@refresh => creates a new access token with custom (inline) http options without overriding (required) http options', mockServer.boundary(async (t) => {
  const config = createModuleConfig();

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const client = new Client(config);

  const refreshParams = {
    grant_type: 'refresh_token',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh(null, httpOptions);

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
}));

test.serial('@refresh => creates a new access token with keeping the old refresh token if refresh did not provide a new refresh token', mockServer.boundary(async (t) => {
  const config = createModuleConfig();

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const client = new Client(config);

  const refreshParams = {
    grant_type: 'refresh_token',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithoutRefreshToken(scopeOptions, refreshParams);

  mockServer.use(...scope.handlers);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh();

  scope.done();
  t.true(has(refreshAccessToken.token, 'refresh_token'));
}));
