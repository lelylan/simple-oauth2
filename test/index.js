'use strict';

const { expect } = require('chai');

const oauth2Module = require('./../index.js');
const moduleConfig = require('./fixtures/module-config');

describe('when module is initialized', () => {
  describe('with no configuration', () => {
    it('throws a validation error', () => {
      const createModule = () => oauth2Module.create();

      expect(createModule).to.throw();
    });
  });

  describe('with minimal configuration', () => {
    const createModule = () => oauth2Module.create(moduleConfig);

    expect(createModule).to.not.throw();
  });
});
