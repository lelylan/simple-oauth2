'use strict';

/**
 * Wrapper for the Access Token Object
 */
const addSeconds = require('date-fns/add_seconds');
const isAfter = require('date-fns/is_after');
const coreModule = require('./../core');

module.exports = function (config) {
  const core = coreModule(config);

  /**
   * Creates an OAuth2.AccessToken instance
   * @param  {Object} token An object containing the token object returned from the OAuth2 server.
   */
  function create(token) {
    this.token = token;
    this.token.expires_at = addSeconds((new Date), token.expires_in);

    return this;
  }

  /**
   * Check if the access token is expired or not
   */
  function expired() {
    return isAfter(new Date, this.token.expires_at);
  }

  /**
   * Refresh the access token
   * @param  {Object} An optional argument for additional API request params.
   * @param  {Function} callback The callback function returning the results
   * An error object is passed as first argument and the new OAuth2.AccessToken as last
   */
  function refresh(params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = undefined;
    }

    params = params || {};
    params.grant_type = 'refresh_token';
    params.refresh_token = this.token.refresh_token;

    return core
      .api('POST', config.tokenPath, params)
      .bind(this)
      .then(this.create)
      .nodeify(callback);
  }

  /**
   * Revoke access or refresh token
   * @param  {String}   tokenType A string containing the type of token to revoke.
   *                              Should be either "access_token" or "refresh_token"
   * @param  {Function} callback  The callback function returning the results.
   *                              An error object is passed as first argument
   */
  function revoke(tokenType, callback) {
    const token = tokenType === 'access_token' ? this.token.access_token : this.token.refresh_token;
    const params = { token, token_type_hint: tokenType };

    return core
      .api('POST', config.revocationPath, params)
      .nodeify(callback);
  }

  return {
    create,
    expired,
    refresh,
    revoke,
    token: null,
  };
};
