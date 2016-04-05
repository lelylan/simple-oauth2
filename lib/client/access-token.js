/**
 * Wrapper for the Access Token Object
 */
module.exports = function (config) {
  var core = require('./../core')(config);
  require('date-utils');

  /**
   * Creates an OAuth2.AccessToken instance
   * @param  {Object} token An object containing the token object returned from the OAuth2 server.
   */
  function create(token) {
    this.token = token;
    this.token.expires_at = (new Date).addSeconds(token.expires_in);

    return this;
  }

  /**
   * Check if the access token is expired or not
   */
  function expired() {
    return (Date.compare(this.token.expires_at, new Date) === -1) ? true : false;
  }

  /**
   * Refresh the access token
   * @param  {Object} An optional argument for additional API request params.
   * @param  {Function} callback The callback function returning the results
   *                             An error object is passed as first argument and the new OAuth2.AccessToken as last
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
    var token = tokenType === 'access_token' ? this.token.access_token : this.token.refresh_token;
    var params = { token: token, token_type_hint: tokenType };

    return core
      .api('POST', config.revocationPath, params)
      .nodeify(callback);
  }

  return {
    create: create,
    token: null,
    expired: expired,
    refresh: refresh,
    revoke: revoke
  };
};
