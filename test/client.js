'use strict';

const test = require('ava');
const nock = require('nock');
const qs = require('querystring');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');

const tokenParams = {
  random_param: 'random value',
};

test('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token (body credentials and form format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const expectedRequestParams = {
    random_param: 'random value',
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', qs.stringify(expectedRequestParams))
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'form',
      authorizationMethod: 'body',
    },
  });

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token (header credentials)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token')
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      authorizationMethod: 'header',
    },
  });

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/root/oauth/token')
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    auth: {
      tokenHost: 'https://authorization-server.org:443/root/',
      tokenPath: '/oauth/token',
    },
  });

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with custom module configuration (http options)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
      'X-MYTHICAL-HEADER': 'mythical value',
      'USER-AGENT': 'hello agent',
    },
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token')
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    http: {
      headers: {
        'X-MYTHICAL-HEADER': 'mythical value',
        'USER-AGENT': 'hello agent',
      },
    },
  });

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.clientCredentials.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => rejects the operation when a non json response is received', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const expectedRequestParams = {
    grant_type: 'client_credentials',
    client_id: 'the client id',
    client_secret: 'the client secret',
    random_param: 'random value',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, '<html>Sorry for not responding with a json response</html>', {
      'Content-Type': 'application/html',
    });

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const oauth2 = oauth2Module.create(config);
  const error = await t.throwsAsync(() => oauth2.clientCredentials.getToken(tokenParams));

  scope.done();

  t.true(error.isBoom);
  t.is(error.output.statusCode, 406);
});
