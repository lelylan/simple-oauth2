'use strict';

const test = require('ava');
const nock = require('nock');
const qs = require('querystring');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');

test('@authorizeURL => returns the authorization URL with no options and default module configuration', (t) => {
  const oauth2 = oauth2Module.create(baseConfig);
  const authorizationURL = oauth2.authorizationCode.authorizeURL();
  const expectedAuthorizationURL = 'https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id';

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@authorizeURL => returns the authorization URL with options and default module configuration', (t) => {
  const authorizeConfig = {
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'user',
    state: '02afe928b',
  };

  const oauth2 = oauth2Module.create(baseConfig);
  const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
  const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@authorizeURL => returns the authorization URL with an scope array and default module configuration', (t) => {
  const authorizeConfig = {
    redirect_uri: 'http://localhost:3000/callback',
    state: '02afe928b',
    scope: ['user', 'account'],
  };

  const oauth2 = oauth2Module.create(baseConfig);
  const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
  const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&state=02afe928b&scope=user%2Caccount`;

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (client id param name)', (t) => {
  const oauth2 = oauth2Module.create({
    client: {
      id: 'client-id',
      secret: 'client-secret',
      idParamName: 'incredible-param-name',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
    },
  });

  const authorizationURL = oauth2.authorizationCode.authorizeURL();
  const expectedAuthorizationURL = 'https://authorization-server.org/oauth/authorize?response_type=code&incredible-param-name=client-id';

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host)', (t) => {
  const oauth2 = oauth2Module.create({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com',
    },
  });

  const authorizationURL = oauth2.authorizationCode.authorizeURL();
  const expectedAuthorizationURL = 'https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id';

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host with trailing slashes)', (t) => {
  const oauth2 = oauth2Module.create({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com/root/',
    },
  });

  const authorizationURL = oauth2.authorizationCode.authorizeURL();
  const expectedAuthorizationURL = 'https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id';

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize path)', (t) => {
  const oauth2 = oauth2Module.create({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizePath: '/authorize-now',
    },
  });

  const authorizationURL = oauth2.authorizationCode.authorizeURL();
  const expectedAuthorizationURL = 'https://authorization-server.org/authorize-now?response_type=code&client_id=client-id';

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host and path)', (t) => {
  const oauth2 = oauth2Module.create({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com',
      authorizePath: '/authorize-now',
    },
  });

  const authorizationURL = oauth2.authorizationCode.authorizeURL();
  const expectedAuthorizationURL = 'https://other-authorization-server.com/authorize-now?response_type=code&client_id=client-id';

  t.is(authorizationURL, expectedAuthorizationURL);
});

test('@getToken => resolves to an access token (body credentials and JSON format)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const expectedRequestParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'authorization_code',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scope = nock('https://authorization-server.org', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'json',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

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
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'authorization_code',
    client_id: 'the client id',
    client_secret: 'the client secret',
  };

  const scope = nock('https://authorization-server.org', scopeOptions)
    .post('/oauth/token', qs.stringify(expectedRequestParams))
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      bodyFormat: 'form',
      authorizationMethod: 'body',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

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

  const expectedRequestParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'authorization_code',
  };

  const scope = nock('https://authorization-server.org', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    options: {
      authorizationMethod: 'header',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});

test('@getToken => resolves to an access token with custom module configuration (access token host and path)', async (t) => {
  const scopeOptions = {
    reqheaders: {
      Accept: 'application/json',
    },
  };

  const expectedRequestParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'authorization_code',
  };

  const scope = nock('https://authorization-server.org', scopeOptions)
    .post('/root/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    auth: {
      tokenHost: 'https://authorization-server.org:443/root/',
      tokenPath: '/oauth/token',
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

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

  const expectedRequestParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
    grant_type: 'authorization_code',
  };

  const scope = nock('https://authorization-server.org', scopeOptions)
    .post('/oauth/token', expectedRequestParams)
    .reply(200, expectedAccessToken);

  const config = Object.assign({}, baseConfig, {
    http: {
      headers: {
        'X-MYTHICAL-HEADER': 'mythical value',
        'USER-AGENT': 'hello agent',
      },
    },
  });

  const tokenParams = {
    code: 'code',
    redirect_uri: 'http://callback.com',
  };

  const oauth2 = oauth2Module.create(config);
  const token = await oauth2.authorizationCode.getToken(tokenParams);

  scope.done();
  t.deepEqual(token, expectedAccessToken);
});
