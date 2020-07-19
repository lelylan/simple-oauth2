'use strict';

const test = require('ava');

const { ResourceOwnerPassword, ClientCredentials, AuthorizationCode } = require('../index');
const { createModuleConfig } = require('./_module-config');

test('@constructor => throws a validation error when no configuration is provided', (t) => {
  t.throws(() => new ResourceOwnerPassword());
  t.throws(() => new ClientCredentials());
  t.throws(() => new AuthorizationCode());
});

test('@constructor => throws a validation error when http.baseUrl is provided', (t) => {
  const options = createModuleConfig({
    http: {
      baseUrl: '',
    },
  });

  const expected = {
    message: /not allowed/,
  };

  t.throws(() => new ResourceOwnerPassword(options), expected);
  t.throws(() => new ClientCredentials(options), expected);
  t.throws(() => new AuthorizationCode(options), expected);
});

test('@constructor => creates a new instance with the minimal required configuration', (t) => {
  const config = createModuleConfig();

  t.notThrows(() => new ResourceOwnerPassword(config));
  t.notThrows(() => new ClientCredentials(config));
  t.notThrows(() => new AuthorizationCode(config));
});

test('@constructor => creates a new instance with empty credentials', (t) => {
  const config = createModuleConfig({
    client: {
      id: '',
      secret: '',
    },
  });

  t.notThrows(() => new ResourceOwnerPassword(config));
  t.notThrows(() => new ClientCredentials(config));
  t.notThrows(() => new AuthorizationCode(config));
});

test('@constructor => creates a new instance with visual non-control characters', (t) => {
  const config = createModuleConfig({
    client: {
      id: '\x20hello\x7E',
      secret: '\x20world\x7E',
    },
  });

  t.notThrows(() => new ResourceOwnerPassword(config));
  t.notThrows(() => new ClientCredentials(config));
  t.notThrows(() => new AuthorizationCode(config));
});
