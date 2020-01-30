'use strict';

const Hoek = require('@hapi/hoek');
const debug = require('debug')('simple-oauth2:access-token');
const isDate = require('date-fns/isDate');
const parseISO = require('date-fns/parseISO');
const addSeconds = require('date-fns/addSeconds');
const isBefore = require('date-fns/isBefore');

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

const ACCESS_TOKEN_PROPERTY_NAME = 'access_token';
const REFRESH_TOKEN_PROPERTY_NAME = 'refresh_token';

module.exports = class AccessToken {
  static factory(config, client) {
    return (token) => new AccessToken(config, client, token);
  }

  constructor(config, client, token) {
    Hoek.assert(config, 'Cannot create access token without client configuration');
    Hoek.assert(client, 'Cannot create access token without client instance');
    Hoek.assert(token, 'Cannot create access token without a token to parse');

    this.config = config;
    this.client = client;
    this.token = parseToken(token);
  }

  /**
  * Determines if the current access token has already expired or if it is about to expire
  *
  * @param {Number} expirationWindowSeconds Window of time before the actual expiration to refresh the token
  * @returns {Boolean}
  */
  expired(expirationWindowSeconds = 0) {
    return isBefore(this.token.expires_at, Date.now() + expirationWindowSeconds * 1000);
  }

  /**
  * Refreshes the current access token
  *
  * @param {Object} params Optional argument for additional API request params.
  * @param {String|Array<String>} [params.scope] String or array of strings representing the application privileges
  * @returns {Promise<AccessToken>}
  */
  async refresh(params = {}) {
    const refreshParams = Object.assign({}, params, {
      refresh_token: this.token.refresh_token,
    });

    const parameters = GrantParams.forGrant(REFRESH_TOKEN_PROPERTY_NAME, this.config.options, refreshParams);
    const response = await this.client.request(this.config.auth.tokenPath, parameters.toObject());

    return new AccessToken(this.config, this.client, response);
  }

  /**
  * Revokes either the access or refresh token depending on the {tokenType} value
  *
  * @param  {String} tokenType A string containing the type of token to revoke (access_token or refresh_token)
  * @returns {Promise}
  */
  async revoke(tokenType) {
    Hoek.assert(
      tokenType === ACCESS_TOKEN_PROPERTY_NAME || tokenType === REFRESH_TOKEN_PROPERTY_NAME,
      `Invalid token type. Only ${ACCESS_TOKEN_PROPERTY_NAME} or ${REFRESH_TOKEN_PROPERTY_NAME} are valid values`
    );

    const options = {
      token: this.token[tokenType],
      token_type_hint: tokenType,
    };

    return this.client.request(this.config.auth.revokePath, options);
  }

  /**
   * Revokes both the current access and refresh tokens
   * @returns {Promise}
  */
  async revokeAll() {
    await this.revoke(ACCESS_TOKEN_PROPERTY_NAME);
    await this.revoke(REFRESH_TOKEN_PROPERTY_NAME);
  }
};
