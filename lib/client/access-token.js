//
// Access Token class
//
module.exports = function(config) {

  var core  = require('./../core')(config);
	require('date-utils');

  // Returns the OAuth2.AccessToken instance.
	//
  // * `token` - An object containing the token object returned from the OAuth2 server.
	// maintain state between the request and the callback.
	//
  function create(token) {
		this.token = token;
		this.token.expires_at = (new Date).addSeconds(7200);
		return this
  }

	function expired() {
		return (Date.compare(this.token.expires_at, new Date) == -1) ? false : true
	}

  return {
    'create' : create,
		'token': this.token,
		'expired': expired
  }
};
