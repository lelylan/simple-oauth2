'use strict';

const url = require('url');
const addSeconds = require('date-fns/add_seconds');
const isAfter = require('date-fns/is_after');
const isDate = require('date-fns/is_date');
const parse = require('date-fns/parse');
const coreModule = require('./../core');

/**
 * Wrapper for the Access Token Object
 */
module.exports = (config) => {
  const core = coreModule(config);
  const tokenUrl = url.resolve(config.auth.tokenHost, config.auth.tokenPath);
  const revokeUrl = url.resolve(config.auth.tokenHost, config.auth.revokePath);

  function AccessToken(token) {
    this.token = token;
    if ('expires_at' in this.token) {
      if (!isDate(this.token.expires_at)) {
        this.token.expires_at = parse(this.token.expires_at);
      }
    } else {
      this.token.expires_at = addSeconds(
        new Date(),
        Number.parseInt(token.expires_in, 10)
      );
    }
  }

  /**
   * Creates an OAuth2.AccessToken instance
   * @param  {Object} token An object containing the token object returned from the OAuth2 server.
   */
  function createAccessToken(tokenToUse) {
    return new AccessToken(tokenToUse);
  }

  /**
  * Check if the access token is expired or not
  */
  AccessToken.prototype.expired = function expired() {
    return isAfter(new Date(), this.token.expires_at);
  };

  /**
  * Refresh the access token
  * @param  {Object} An optional argument for additional API request params.
  * @param  {Function} callback
  */
  AccessToken.prototype.refresh = function refresh(params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = undefined;
    }

    const options = Object.assign({}, params || {}, {
      grant_type: 'refresh_token',
      refresh_token: this.token.refresh_token,
    });

    return core
      .api('POST', tokenUrl, options)
      .then((response) => createAccessToken(response))
      .nodeify(callback);
  };

  /**
  * Revoke access or refresh token
  * @param  {String}   tokenType A string containing the type of token to revoke.
  *                              Should be either "access_token" or "refresh_token"
  * @param  {Function} callback
  */
  AccessToken.prototype.revoke = function revoke(tokenType, callback) {
    const token = tokenType === 'access_token' ? this.token.access_token : this.token.refresh_token;
    const options = {
      token,
      token_type_hint: tokenType,
    };

    return core
      .api('POST', revokeUrl, options)
      .nodeify(callback);
  };

  return {
    create: createAccessToken,
  };
};
