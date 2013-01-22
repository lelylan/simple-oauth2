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
		this.token.expires_at = (new Date).addSeconds(7200);
		return this
  }


	//
  // ### Check if the access token is expired or not.
	//
	function expired() {
		return (Date.compare(this.token.expires_at, new Date) == -1) ? false : true
	}


	//
  // ### Refresh the access token
	//
  // * `callback` - The callback function returning the results.
	// An error object is passed as first argument and the new access
	// token as last.
	//
	function refresh(callback) {
		var params = { grant_type: 'refresh_token', refresh_token: this.token.refresh_token };
		core.api('POST', config.tokenPath, params, callback);
  }


  return {
    'create' : create,
		'token': this.token,
		'expired': expired,
		'refresh': refresh
  }
};
