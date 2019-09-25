'use strict';

const test = require('ava');

const oauth2Module = require('./../index.js');
const { createModuleConfig } = require('./_module-config');

test('@create => throws a validation error when no configuration is provided', (t) => {
  const createModule = () => oauth2Module.create();

  t.throws(createModule);
});

test('@create => creates a new instance', (t) => {
  const config = createModuleConfig();
  const createModule = () => oauth2Module.create(config);

  t.notThrows(createModule);
});
