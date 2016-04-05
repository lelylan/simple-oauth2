/**
 * Authorization Code flow implementation
 */
module.exports = function (config) {
  var core = require('./../core')(config);
  var qs = require('querystring');
  var Url = require('url');

  /**
   * Redirect the user to the autorization page
   * @param  {Object} params
   *         params.redirectURI - A string that represents the registered application URI
   *         											where the user is redirected after authentication
   *         params.scope - A String that represents the application privileges
   *         params.state - A String that represents an option opaque value used by the client
   *         								to main the state between the request and the callback
   */
  function authorizeURL(params) {
    params.response_type = 'code';
    params.client_id = config.clientID;

    var isAbsolute = String(Url.parse(config.authorizationPath).protocol)
      .match(/https?/);

    return (isAbsolute ?
      config.authorizationPath :
      config.site + config.authorizationPath
    ) + '?' + qs.stringify(params);
  }

  /**
   * Returns the Access Token Object
   * @param  {Object}   params
   *         params.code - Authorization code (from previous step)
   *         params.redirecURI - A string that represents the callback uri
   * @param  {Function} callback the callback function returning the results
   *                             An error object is passed as first argument and the result as last.
   */
  function getToken(params, callback) {
    params.grant_type = 'authorization_code';
    return core
      .api('POST', config.tokenPath, params)
      .nodeify(callback);
  }

  return {
    authorizeURL: authorizeURL,
    getToken: getToken
  };
};
