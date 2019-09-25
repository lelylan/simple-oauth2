'use strict';

const test = require('ava');
const nock = require('nock');
const { createModuleConfig } = require('./_module-config');
const oauth2Module = require('./../index');

const tokenParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
};

const oauthParams = {
  grant_type: 'authorization_code',
  code: 'code',
  redirect_uri: 'http://callback.com',
};

test('@errors => rejects operations on http error (401)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token')
    .reply(401);

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const error = await t.throwsAsync(() => oauth2.authorizationCode.getToken(tokenParams), Error);

  scope.done();

  const authorizationError = {
    error: 'Unauthorized',
    message: 'Response Error: 401 null',
    statusCode: 401,
  };

  t.true(error.isBoom);
  t.deepEqual(error.output.payload, authorizationError);
});

test('@errors => rejects operations on http error (500)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', oauthParams)
    .reply(500, {
      customError: 'An amazing error has occured',
    });

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const error = await t.throwsAsync(() => oauth2.authorizationCode.getToken(tokenParams), Error);

  scope.done();

  const internalServerError = {
    error: 'Internal Server Error',
    message: 'An internal server error occurred',
    statusCode: 500,
  };

  t.true(error.isBoom);
  t.deepEqual(error.output.payload, internalServerError);
});
