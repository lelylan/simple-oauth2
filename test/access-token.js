'use strict';

const test = require('ava');
const Chance = require('chance');
const accessTokenMixin = require('chance-access-token');
const {
  isValid,
  isDate,
  differenceInSeconds,
  isEqual,
} = require('date-fns');

const AccessToken = require('../lib/access-token');
const { Client } = require('../lib/client');
const { has, hasIn } = require('./_property');
const { createModuleConfigWithDefaults: createModuleConfig } = require('./_module-config');
const { createAuthorizationServer, getHeaderCredentialsScopeOptions } = require('./_authorization-server-mock');

const chance = new Chance();
chance.mixin({ accessToken: accessTokenMixin });

const scopeOptions = getHeaderCredentialsScopeOptions();

test('@create => throws an error when no token payload is provided', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  t.throws(() => new AccessToken(config, client), {
    message: /Cannot create access token without a token to parse/,
  });
});

test('@create => creates a new access token instance', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken();
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.truthy(accessToken);
  t.true(has(accessToken, 'token'));
  t.true(hasIn(accessToken, 'refresh'));
  t.true(hasIn(accessToken, 'revoke'));
  t.true(hasIn(accessToken, 'expired'));
});

test('@create => do not reassigns the expires at property when is already a date', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    dateFormat: 'date',
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => parses the expires at property when is UNIX timestamp in seconds', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    dateFormat: 'unix',
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => parses the expires at property when is ISO time', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    dateFormat: 'iso',
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => computes the expires at property when only expires in is present', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const today = new Date();
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));

  const diffInSeconds = differenceInSeconds(accessToken.token.expires_at, today);

  t.is(diffInSeconds, accessTokenResponse.expires_in);
});

test('@create => ignores the expiration parsing when no expiration property is present', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'no_expiration',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.not(has(accessToken.token, 'expires_in'));
  t.not(has(accessToken.token, 'expires_at'));
});

test('@toJSON => serializes the access token information in an equivalent format', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken();

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const restoredAccessToken = new AccessToken(config, client, JSON.parse(JSON.stringify(accessToken)));

  t.deepEqual(restoredAccessToken.token, accessToken.token);
  t.true(isEqual(restoredAccessToken.token.expires_at, accessToken.token.expires_at));
});

test('@expired => returns true when expired', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(accessToken.expired());
});

test('@expired => returns true if the token is expiring within the expiration window', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = {
    ...chance.accessToken({
      expireMode: 'expires_in',
    }),
    expires_in: 10,
  };

  const expirationWindowSeconds = 11;
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(accessToken.expired(expirationWindowSeconds));
});

test('@expired => returns false when not expired', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: false,
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.false(accessToken.expired());
});

test('@expired => returns false when no expiration property is present', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'no_expiration',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.false(accessToken.expired());
});

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
    refresh_token: accessTokenResponse.refresh_token,
  };

  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenSuccessWithCustomPath('/the-custom/path', scopeOptions, refreshParams);

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh();

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with custom (inline) http options', async (t) => {
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

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh(null, httpOptions);

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

test.serial('@refresh => creates a new access token with custom (inline) http options without overriding (required) http options', async (t) => {
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

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const refreshAccessToken = await accessToken.refresh(null, httpOptions);

  scope.done();
  t.true(has(refreshAccessToken.token, 'access_token'));
});

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

test.serial('@revoke => performs a token revoke with custom (inline) http options', async (t) => {
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

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token', httpOptions));

  scope.done();
});

test.serial('@revoke => performs a token revoke with custom (inline) http options without overriding (required) http options', async (t) => {
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

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revoke('refresh_token', httpOptions));

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

test.serial('@revokenAll => revokes both the access and refresh tokens with custom (inline) http options', async (t) => {
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

  const httpOptions = {
    headers: {
      'X-REQUEST-ID': 123,
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revokeAll(httpOptions));

  scope.done();
});

test.serial('@revokeAll => revokes tboth the access and refresh tokens with custom (inline) http options without overriding (required) http options', async (t) => {
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

  const httpOptions = {
    headers: {
      Authorization: 'Basic credentials',
    },
  };

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  await t.notThrowsAsync(() => accessToken.revokeAll(httpOptions));

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
