//
// ### Authorization Code flow implementation
//
module.exports = function(config) {

  var core   = require('./../core')(config),
      qs     = require('querystring');

  // ### Redirect the user to the authorization page
  //
  // * `params.redirectURI` - A String that represents the registered application URI where the
  // user is redirected after authorization.
  // * `params.scope` - A String that represents the application privileges.
  // * `params.state` - A String that represents an optional opaque value used by the client to
  // maintain state between the request and the callback.
  //
  function authorizeURL(params) {
    params.response_type = 'code';
    params.client_id = config.clientID;

    return config.site + config.authorizationPath + '?' + qs.stringify(params);
  }

  //
  // ### Returns the Access Token object.
  //
  // * `params.code` - Authorization code (from previous step).
  // * `params.redirectURI` - A String that represents the callback uri.
  // * `callback` - The callback function returning the results.
  // An error object is passed as first argument and the result as last.
  //
  function getToken(params, callback) {
    params.grant_type = 'authorization_code';
    core.api('POST', config.tokenPath, params, callback);
  }


  return {
    'authorizeURL' : authorizeURL,
    'getToken' : getToken
  }
};
