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
   * @param  {String} params.redirectURI A string that represents the registered application URI
   *                                     where the user is redirected after authentication
   * @param {String} params.scope A String that represents the application privileges
   * @param {String} params.state A String that represents an option opaque value used by the client
   *                              to main the state between the request and the callback
   * @return {String} the absolute authorization url
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
   * @param  {String} params.code Authorization code (from previous step)
   * @param  {String} params.redirecURI A string that represents the callback uri
   * @param  {Function} callback
   * @return {Promise}
   */
  function getToken(params, callback) {
    const options = Object.assign({}, params);
    options.grant_type = 'authorization_code';

    return core
      .api('POST', config.tokenPath, options)
      .nodeify(callback);
  }

  return {
    authorizeURL,
    getToken,
  };
};
