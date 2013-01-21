//
// A class to implement the Authorization Code flow.
//
module.exports = function(config) {

  var core   = require('./../core')(config),
	    qs     = require('querystring');

  // Returns the OAuth2 authorization URI where the user decides to
	// grant or deny the resources' access.
	//
  // * `redirectURI` - A String that represents the callback uri.
  // * `scope` - A String that represents the application privileges.
  // * `state` - A String that represents an optional opaque value used by the client to
	// maintain state between the request and the callback.
  // * `callback` - The callback function returning the results.
	// An error object is passed as first argument and the result as last.
	//
  function authorizeURL(params) {
		params.response_type = 'code';
		params.client_id = config.client.id;

		return config.client.site + config.authorizationPath + '?' + qs.stringify(params);
  }

    //core.api('GET', '/devices/' + id, {}, callback);

  return {
    'authorizeURL' : authorizeURL,
  }
};
