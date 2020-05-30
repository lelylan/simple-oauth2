'use strict';

const test = require('ava');
const { AuthorizationCode } = require('../index');
const { createModuleConfig } = require('./_module-config');
const { createAuthorizationServer, getHeaderCredentialsScopeOptions } = require('./_authorization-server-mock');

const tokenParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
};

const oauthParams = {
  grant_type: 'authorization_code',
  code: 'code',
  redirect_uri: 'http://callback.com',
};

test.serial('@errors => rejects operations on http error (401)', async (t) => {
  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenAuthorizationError(scopeOptions, oauthParams);

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const error = await t.throwsAsync(() => oauth2.getToken(tokenParams), { instanceOf: Error });

  scope.done();

  const authorizationError = {
    error: 'Unauthorized',
    message: 'Response Error: 401 null',
    statusCode: 401,
  };

  t.true(error.isBoom);
  t.deepEqual(error.output.payload, authorizationError);
});

test.serial('@errors => rejects operations on http error (500)', async (t) => {
  const scopeOptions = getHeaderCredentialsScopeOptions();
  const server = createAuthorizationServer('https://authorization-server.org:443');
  const scope = server.tokenError(scopeOptions, oauthParams);

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const error = await t.throwsAsync(() => oauth2.getToken(tokenParams), { instanceOf: Error });

  scope.done();

  const internalServerError = {
    error: 'Internal Server Error',
    message: 'An internal server error occurred',
    statusCode: 500,
  };

  t.true(error.isBoom);
  t.deepEqual(error.output.payload, internalServerError);
});
