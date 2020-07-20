'use strict';

const test = require('ava');

const Chance = require('./_chance');
const AccessToken = require('../lib/access-token');
const { Client } = require('../lib/client');
const { createModuleConfigWithDefaults: createModuleConfig } = require('./_module-config');
const { createAuthorizationServer } = require('./_authorization-server-mock');

const chance = new Chance();

const scopeOptions = {
  reqheaders: {
    Accept: 'application/json',
    Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
  },
};

test.serial('@revoke => performs the access token revoke', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('access_token'));

  scope.done();
});

test.serial('@revoke => performs the refresh token revoke', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token'));

  scope.done();
});

test.serial('@revoke => performs a token revoke with a custom revoke path', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token'));

  scope.done();
});

test.serial('@revoke => throws an error with an invalid tokenType option', async (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken();
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.throwsAsync(() => accessToken.revoke('invalid_value'), {
    message: /Invalid token type. Only access_token or refresh_token are valid values/,
  });
});

test.serial('@revokeAll => revokes both the access and refresh tokens', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revokeAll());

  scope.done();
});

test.serial('@revokeAll => revokes the refresh token only if the access token is successfully revoked', async (t) => {
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

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  const error = await t.throwsAsync(() => accessToken.revokeAll(), { instanceOf: Error });

  t.true(error.isBoom);
  t.is(error.output.statusCode, 500);

  scope.done();
});
