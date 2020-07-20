'use strict';

const BaseChance = require('chance');
const accessTokenMixin = require('chance-access-token');

class Chance extends BaseChance {
  constructor(...args) {
    super(...args);

    this.mixin({ accessToken: accessTokenMixin });
  }
}

module.exports = Chance;
