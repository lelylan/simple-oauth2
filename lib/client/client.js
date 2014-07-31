//
// ### Client credentials flow implementation
//
module.exports = function(config) {

  var core   = require('./../core')(config);

  //
  // ### Returns the Access Token object.
  //
  // * `params.scope` - A String that represents the application privileges.
  // * `callback` - The callback function returning the results.
  // An error object is passed as first argument and the result as last.
  //
  function getToken(params, callback) {
    params.grant_type = 'client_credentials';
    core.api('POST', config.tokenPath, params, callback);
  }


  return {
    'getToken' : getToken
  }
};
