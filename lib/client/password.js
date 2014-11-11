//
// ### Password credentials flow implementation
//
module.exports = function(config) {

  var core   = require('./../core')(config);

  //
  // ### Returns the Access Token object.
  //
  // * `params.username` - A string that represents the registered username.
  // * `params.password` - A string that represents the registered password.
  // * `params.scope` - A String that represents the application privileges.
  // * `callback` - The callback function returning the results.
  // An error object is passed as first argument and the result as last.
  //
  function getToken(params, callback) {
    params.grant_type = 'password';
    core.api('POST', config.tokenPath, params, callback);
  }


  return {
    'getToken' : getToken
  }
};
