'use strict';

const test = require('ava');
const nock = require('nock');
const oauth2Module = require('./../index');
const { createModuleConfig } = require('./_module-config');
const expectedAccessToken = require('./fixtures/access_token');

test('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

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
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token (body credentials and form format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

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
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token (header credentials)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

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
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/root/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

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

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

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
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token while following redirections', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
  };

  const redirectionsScope = nock('https://authorization-server.org', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .times(19)
    .reply(301, null, {
      Location: 'https://authorization-server.org/oauth/token',
    })
    .post('/oauth/token', tokenRequestParams)
    .reply(301, null, {
      Location: 'https://origin-authorization-server.org/oauth/token',
    });

  const originScope = nock('https://origin-authorization-server.org', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

  const tokenParams = {
    username: 'alice',
    password: 'secret',
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.ownerPassword.getToken(tokenParams);

  redirectionsScope.done();
  originScope.done();

  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token while requesting multiple scopes', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    scope: 'scope-a scope-b',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

  const tokenParams = {
    username: 'alice',
    password: 'secret',
    scope: ['scope-a', 'scope-b'],
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.ownerPassword.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with a custom grant type', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  };

  const tokenRequestParams = {
    grant_type: 'my_grant',
    username: 'alice',
    password: 'secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, expectedAccessToken);

  const tokenParams = {
    grant_type: 'my_grant',
    username: 'alice',
    password: 'secret',
  };

  const config = createModuleConfig();
  const oauth2 = oauth2Module.create(config);

  const token = await oauth2.ownerPassword.getToken(tokenParams);

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

  const tokenRequestParams = {
    grant_type: 'password',
    username: 'alice',
    password: 'secret',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scope = nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', tokenRequestParams)
    .reply(200, '<html>Sorry for not responding with a json response</html>', {
      'Content-Type': 'application/html',
    });

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
