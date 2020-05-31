'use strict';

const test = require('ava');

const { ResourceOwnerPassword, ClientCredentials, AuthorizationCode } = require('../index');
const { createModuleConfig } = require('./_module-config');

test('@create => throws a validation error when no configuration is provided', (t) => {
  t.throws(() => new ResourceOwnerPassword());
  t.throws(() => new ClientCredentials());
  t.throws(() => new AuthorizationCode());
});

test('@create => creates a new instance with the minimal required configuration', (t) => {
  const config = createModuleConfig();

  t.notThrows(() => new ResourceOwnerPassword(config));
  t.notThrows(() => new ClientCredentials(config));
  t.notThrows(() => new AuthorizationCode(config));
});

test('@create => creates a new instance with empty credentials', (t) => {
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

test('@create => creates a new instance with visual non-control characters', (t) => {
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
