//
// Authorization Code flow implementation
//
module.exports = function(config) {

  var core   = require('./../core')(config),
	    qs     = require('querystring');

  // Returns the OAuth2 authorization URI where the user decides to
	// grant or deny the resources' access.
	//
  // * `params.redirectURI` - A String that represents the registered application URI where the
	// user is redirected after authorization.
  // * `params.scope` - A String that represents the application privileges.
  // * `params.state` - A String that represents an optional opaque value used by the client to
	// maintain state between the request and the callback.
	//
  function authorizeURL(params) {
		params.response_type = 'code';
		params.client_id = config.client.id;

		return config.client.site + config.authorizationPath + '?' + qs.stringify(params);
  }

	//
  // Returns the Access Token object.
	//
  // * `params.code` - Authorization code (from the authorization step).
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
