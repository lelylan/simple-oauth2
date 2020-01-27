'use strict';

const test = require('ava');

const oauth2Module = require('./../index.js');
const { createModuleConfig } = require('./_module-config');

test('@create => throws a validation error when no configuration is provided', (t) => {
  t.throws(() => oauth2Module.create());
});

test('@create => creates a new instance with the minimal required configuration', (t) => {
  const config = createModuleConfig();

  t.notThrows(() => oauth2Module.create(config));
});

test('@create => creates a new instance with empty credentials', (t) => {
  const config = createModuleConfig({
    client: {
      id: '',
      secret: '',
    },
  });

  t.notThrows(() => oauth2Module.create(config));
});

test('@create => creates a new instance with visual non-control characters', (t) => {
  const config = createModuleConfig({
    client: {
      id: '\x20hello\x7E',
      secret: '\x20world\x7E',
    },
  });

  t.notThrows(() => oauth2Module.create(config));
});
