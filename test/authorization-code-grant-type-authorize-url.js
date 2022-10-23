'use strict';

const test = require('ava');
const { AuthorizationCode } = require('../index');
const { createModuleConfig } = require('./_module-config');

test('@authorizeURL => returns the authorization URL with no options and default module configuration', (t) => {
  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/oauth/authorize?response_type=code&client_id=the+client+id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with options and default module configuration', (t) => {
  const authorizeParams = {
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'user',
    state: '02afe928b',
  };

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL(authorizeParams);
  const expected = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the+client+id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with an scope array and default module configuration', (t) => {
  const authorizeParams = {
    redirect_uri: 'http://localhost:3000/callback',
    state: '02afe928b',
    scope: ['user', 'account'],
  };

  const config = createModuleConfig();
  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL(authorizeParams);
  const expected = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the+client+id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&state=02afe928b&scope=user+account`;

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with an scope array and a custom module configuration (scope separator)', (t) => {
  const authorizeParams = {
    redirect_uri: 'http://localhost:3000/callback',
    state: '02afe928b',
    scope: ['user', 'account'],
  };

  const config = createModuleConfig({
    options: {
      scopeSeparator: ',',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL(authorizeParams);
  const expected = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the+client+id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&state=02afe928b&scope=user%2Caccount`;

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (client id param name)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
      idParamName: 'incredible-param-name',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/oauth/authorize?response_type=code&incredible-param-name=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host with trailing slashes)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com/root/',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize path)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizePath: '/authorize-now',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/authorize-now?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize path with query params)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizePath: '/authorize-now?unique=param',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/authorize-now?unique=param&response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize path with query params conflicting with mandatory params)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizePath: '/authorize-now?response_type=token',
    },
  });

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL();
  const expected = 'https://authorization-server.org/authorize-now?response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize path with query params conflicting with override params)', (t) => {
  const config = createModuleConfig({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizePath: '/authorize-now?custom=base',
    },
  });

  const authorizeParams = {
    custom: 'override',
  };

  const oauth2 = new AuthorizationCode(config);

  const actual = oauth2.authorizeURL(authorizeParams);
  const expected = 'https://authorization-server.org/authorize-now?custom=override&response_type=code&client_id=client-id';

  t.is(actual, expected);
});

test('@authorizeURL => returns the authorization URL with a custom module configuration (authorize host and path)', (t) => {
  const oauth2 = new AuthorizationCode({
    client: {
      id: 'client-id',
      secret: 'client-secret',
    },
    auth: {
      tokenHost: 'https://authorization-server.org',
      authorizeHost: 'https://other-authorization-server.com/api/',
      authorizePath: '/authorize-now',
    },
  });

  const actual = oauth2.authorizeURL();
  const expected = 'https://other-authorization-server.com/authorize-now?response_type=code&client_id=client-id';

  t.is(actual, expected);
});
