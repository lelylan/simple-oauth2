//
// ### Wrapper for the Access Token object
//
module.exports = function(config) {

  var core  = require('./../core')(config);
  require('date-utils');

  //
  // ### Creates an OAuth2.AccessToken instance.
  //
  // * `token` - An object containing the token object returned from the OAuth2 server.
  //
  function create(token) {
    this.token = token;
    this.token.expires_at = (new Date).addSeconds(token.expires_in);
    return this;
  }

  //
  // ### Check if the access token is expired or not.
  //
  function expired() {
    return (Date.compare(this.token.expires_at, new Date) == -1) ? true : false
  }

  //
  // ### Refresh the access token
  //
  // * `params` - An optional argument for additional API request params.
  // * `callback` - The callback function returning the results.
  // An error object is passed as first argument and the new OAuth2.AccessToken
  // as last.
  //
  function refresh(params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = undefined;
    }
    params = params || {};
    params.grant_type = 'refresh_token';
    params.refresh_token = this.token.refresh_token;

    return core.api('POST', config.tokenPath, params).then(this.create).nodeify(callback);
  }

  //
  // ### Revoke access or refresh token
  //
  // * `token_type` - A String containing the type of token to revoke.
  // Should be either "access_token" or "refresh_token".
  // * `callback` - The callback function returning the results.
  // An error object is passed as first argument.
  //
  function revoke(token_type, callback) {
    var token = token_type === 'access_token' ? this.token.access_token : this.token.refresh_token;
    var params = { token: token, token_type_hint: token_type };

    return core.api('POST', config.revocationPath, params).nodeify(callback);
  }

  return {
    'create' : create,
    'token'  : this.token,
    'expired': expired,
    'refresh': refresh,
    'revoke' : revoke
  }
};
