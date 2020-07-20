'use strict';

const test = require('ava');

const Chance = require('./_chance');
const AccessToken = require('../lib/access-token');
const { Client } = require('../lib/client');
const { has } = require('./_property');
const { createModuleConfigWithDefaults: createModuleConfig } = require('./_module-config');
const { createAuthorizationServer } = require('./_authorization-server-mock');

const chance = new Chance();

const scopeOptions = {
  reqheaders: {
    Accept: 'application/json',
    Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
  },
};

test.serial('@refresh => creates a new access token with default params', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh();

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with a custom grant type', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    grant_type: 'my_grant',
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with multiple scopes', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: ['scope-a', 'scope-b'],
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with custom params', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: 'TESTING_EXAMPLE_SCOPES',
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with custom module configuration (scope separator)', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: ['scope-a', 'scope-b'],
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with a custom token path', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});
