'use strict';

const debug = require('debug')('access-token');
const isDate = require('date-fns/isDate');
const parseISO = require('date-fns/parseISO');
const addSeconds = require('date-fns/addSeconds');
const isAfter = require('date-fns/isAfter');

const GrantParams = require('./grant-params');

function getExpirationDate(expiresIn) {
  return addSeconds(new Date(), Number.parseInt(expiresIn, 10));
}

function parseToken(token) {
  const tokenProperties = {};

  if ('expires_at' in token) {
    if (!isDate(token.expires_at)) {
      if (typeof token.expires_at === 'number') {
        tokenProperties.expires_at = new Date(token.expires_at * 1000);
      } else {
        tokenProperties.expires_at = parseISO(token.expires_at);
      }
    }
  } else if ('expires_in' in token) {
    tokenProperties.expires_at = getExpirationDate(token.expires_in);
  } else {
    debug('No token expiration property was found. Ignoring date parsing');
  }

  return Object.assign({}, token, tokenProperties);
}

module.exports = class AccessToken {
  static factory(config, client) {
    return (token) => new AccessToken(config, client, token);
  }

  constructor(config, client, token) {
    this.config = config;
    this.client = client;
    this.token = parseToken(token);
  }

  /**
  * Check if the access token is expired or not
  */
  expired() {
    return isAfter(new Date(), this.token.expires_at);
  }

  /**
  * Refresh the access token
  * @param  {Object} params An optional argument for additional API request params.
  * @param {String|Array<String>} params.scope A String or array of strings representing the application privileges
  */
  async refresh(params = {}) {
    const refreshParams = Object.assign({}, params, {
      refresh_token: this.token.refresh_token,
    });

    const parameters = GrantParams.forGrant('refresh_token', refreshParams);
    const response = await this.client.request(this.config.auth.tokenPath, parameters.toObject());

    return new AccessToken(this.config, this.client, response);
  }

  /**
  * Revoke access or refresh token
  * @param  {String} tokenType A string containing the type of token to revoke.
  *                              Should be either "access_token" or "refresh_token"
  */
  async revoke(tokenType) {
    const token = tokenType === 'access_token' ? this.token.access_token : this.token.refresh_token;
    const options = {
      token,
      token_type_hint: tokenType,
    };

    return this.client.request(this.config.auth.revokePath, options);
  }

  /**
   * Revoke both the existing access and refresh tokens
  */
  async revokeAll() {
    await this.revoke('access_token');
    await this.revoke('refresh_token');
  }
};
