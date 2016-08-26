'use strict';

const addSeconds = require('date-fns/add_seconds');
const isAfter = require('date-fns/is_after');
const coreModule = require('./../core');

/**
 * Wrapper for the Access Token Object
 */
module.exports = function (config) {
  const core = coreModule(config);

  function AccessToken(token) {
    this.token = token;
    this.token.expires_at = addSeconds(new Date(), token.expires_in);
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
  AccessToken.prototype.expired = function () {
    return isAfter(new Date(), this.token.expires_at);
  };

  /**
  * Refresh the access token
  * @param  {Object} An optional argument for additional API request params.
  * @param  {Function} callback
  */
  AccessToken.prototype.refresh = function (params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = undefined;
    }

    const options = Object.assign({}, params || {});
    options.grant_type = 'refresh_token';
    options.refresh_token = this.token.refresh_token;

    return core
      .api('POST', config.tokenPath, options)
      .then((response) => createAccessToken(response))
      .nodeify(callback);
  };

  /**
  * Revoke access or refresh token
  * @param  {String}   tokenType A string containing the type of token to revoke.
  *                              Should be either "access_token" or "refresh_token"
  * @param  {Function} callback
  */
  AccessToken.prototype.revoke = function (tokenType, callback) {
    const token = tokenType === 'access_token' ? this.token.access_token : this.token.refresh_token;
    const options = {
      token,
      token_type_hint: tokenType,
    };

    return core
      .api('POST', config.revocationPath, options)
      .nodeify(callback);
  };

  return {
    create: createAccessToken,
  };
};
