'use strict';

const test = require('ava');
const Chance = require('chance');
const accessTokenMixin = require('chance-access-token');
const { has, hasIn } = require('lodash');
const { isValid, isDate, differenceInSeconds } = require('date-fns');

const oauth2Module = require('./../index.js');
const { createModuleConfig } = require('./_module-config');
const { createAuthorizationServer } = require('./_authorization-server-mock');

const chance = new Chance();
chance.mixin({ accessToken: accessTokenMixin });

const scopeOptions = {
  reqheaders: {
    Accept: 'application/json',
    Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
  },
};

test('@create => creates a new access token instance', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken();
  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.truthy(accessToken);
  t.true(has(accessToken, 'token'));
  t.true(hasIn(accessToken, 'refresh'));
  t.true(hasIn(accessToken, 'revoke'));
  t.true(hasIn(accessToken, 'expired'));
});

test('@create => do not reassigns the expires at property when is already a date', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    parseDate: true,
    expireMode: 'expires_at',
  });

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => parses the expires at property when is not a date', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    parseDate: false,
    expireMode: 'expires_at',
  });

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => computes the expires at property when only expires in is present', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const today = new Date();
  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));

  const diffInSeconds = differenceInSeconds(accessToken.token.expires_at, today);

  t.is(diffInSeconds, accessTokenResponse.expires_in);
});

test('@create => ignores the expiration parsing when no expiration property is present', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'no_expiration',
  });

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.not(has(accessToken.token, 'expires_in'));
  t.not(has(accessToken.token, 'expires_at'));
});

test('@expired => returns true when expired', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    expireMode: 'expires_at',
  });

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.true(accessToken.expired());
});

test('@expired => returns false when not expired', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expired: false,
    expireMode: 'expires_at',
  });

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.false(accessToken.expired());
});

test('@expired => returns false when no expiration property is present', (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'no_expiration',
  });

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  t.false(accessToken.expired());
});

test.serial('@refresh => creates a new access token with default params', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshParams = {
    grant_type: 'refresh_token',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  const accessToken = oauth2.accessToken.create(accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh();

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with a custom grant type', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const refreshParams = {
    grant_type: 'my_grant',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccess(scopeOptions, refreshParams);

  const accessToken = oauth2.accessToken.create(accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    grant_type: 'my_grant',
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with multiple scopes', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

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

  const accessToken = oauth2.accessToken.create(accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: ['scope-a', 'scope-b'],
  });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with custom params', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

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

  const accessToken = oauth2.accessToken.create(accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({
    scope: 'TESTING_EXAMPLE_SCOPES',
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

  const oauth2 = oauth2Module.create(config);

  const refreshParams = {
    grant_type: 'refresh_token',
    scope: 'TESTING_EXAMPLE_SCOPES',
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/the-custom/path', scopeOptions, refreshParams);

  const accessToken = oauth2.accessToken.create(accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' });

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@revoke => performs the access token revoke', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.access_token,
    token_type_hint: 'access_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccess(scopeOptions, revokeParams);

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('access_token'));

  scope.done();
});

test.serial('@revoke => performs the refresh token revoke', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccess(scopeOptions, revokeParams);

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token'));

  scope.done();
});

test.serial('@revoke => performs a token revoke with a custom revoke path', async (t) => {
  const config = createModuleConfig({
    auth: {
      revokePath: '/the-custom/revoke-path',
    },
  });

  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const revokeParams = {
    token: accessTokenResponse.refresh_token,
    token_type_hint: 'refresh_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeSuccessWithCustomPath('/the-custom/revoke-path', scopeOptions, revokeParams);

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token'));

  scope.done();
});

test.serial('@revokeAll => revokes both the access and refresh tokens', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

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

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revokeAll());

  scope.done();
});

test.serial('@revokeAll => revokes the refresh token only if the access token is successfully revoked', async (t) => {
  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const accessTokenRevokeParams = {
    token: accessTokenResponse.access_token,
    token_type_hint: 'access_token',
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenRevokeError(scopeOptions, accessTokenRevokeParams);

  const accessToken = oauth2.accessToken.create(accessTokenResponse);

  const error = await t.throwsAsync(() => accessToken.revokeAll(), Error);

  t.true(error.isBoom);
  t.is(error.output.statusCode, 500);

  scope.done();
});
