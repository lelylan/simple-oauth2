'use strict';

const { startOfTomorrow, startOfYesterday } = require('date-fns');

const tokenDefaults = {
  expireMode: 'expires_in',
  parseDate: false,
  expired: false,
};

const getExpirationDate = expired => (expired ? startOfYesterday() : startOfTomorrow());

module.exports = {
  accessToken(options = {}) {
    const opts = Object.assign({}, tokenDefaults, options);

    const baseAccessToken = {
      access_token: this.guid(),
      refresh_token: this.guid(),
      token_type: 'bearer',
    };

    if (opts.expireMode === 'expires_in') {
      return Object.assign({}, baseAccessToken, {
        expires_in: this.second(),
      });
    }

    if (opts.expireMode === 'expires_at') {
      const expirationDate = getExpirationDate(opts.expired);

      return Object.assign({}, baseAccessToken, {
        expires_at: opts.parseDate ? expirationDate : expirationDate.toISOString(),
      });
    }

    return baseAccessToken;
  },
};
