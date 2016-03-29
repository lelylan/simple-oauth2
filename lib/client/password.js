/**
 * Password credentials flow implementation
 */
module.exports = function (config) {
  var core = require('./../core')(config);

  /**
   * Returns the Access Token Object
   * @param  {Object}   params
   *         params.username - A string that represents the registered username
   *         params.password - A string that represents the registered password.
   *         params.scope - A string that represents the application privileges
   * @param  {Function} callback The callback function returning the results
   *                             An error object is passed as first argument and the result as last.
   */
  function getToken(params, callback) {
    params.grant_type = 'password';
    return core
      .api('POST', config.tokenPath, params)
      .nodeify(callback);
  }

  return {
    getToken: getToken
  };
};
