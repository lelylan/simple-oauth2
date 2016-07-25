'use strict';

const qs = require('querystring');
const utils = require('./../utils');
const coreModule = require('./../core');

/**
 * Authorization Code flow implementation
 */
module.exports = function (config) {
  const core = coreModule(config);

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

    const isAbsolute = utils.isAbsoluteUrl(config.authorizationPath);
    const authorizationUrl = isAbsolute ?
      config.authorizationPath :
      `${config.site}${config.authorizationPath}`;

    return `${authorizationUrl}?${qs.stringify(params)}`;
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
    authorizeURL,
    getToken,
  };
};
