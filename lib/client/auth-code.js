'use strict';

const { URL } = require('url');
const qs = require('querystring');
const coreModule = require('./../core');
const encoding = require('./../encoding');

/**
 * Authorization Code flow implementation
 */
module.exports = (config) => {
  const core = coreModule(config);
  const authorizeUrl = new URL(config.auth.authorizePath, config.auth.authorizeHost);

  /**
   * Redirect the user to the autorization page
   * @param {String} params.redirectURI A string that represents the registered application URI
   *                                     where the user is redirected after authentication
   * @param {String|Array<String>} params.scope A String or array of strings
   *                                     that represents the application privileges
   * @param {String} params.state A String that represents an option opaque value used by the client
   *                              to main the state between the request and the callback
   * @return {String} the absolute authorization url
   */
  function authorizeURL(params = {}) {
    const baseParams = {
      response_type: 'code',
      [config.client.idParamName]: config.client.id,
    };

    const scopeParams = encoding.getScopeParam(params.scope);
    const options = Object.assign(baseParams, params, scopeParams);

    return `${authorizeUrl}?${qs.stringify(options)}`;
  }

  /**
   * Returns the Access Token Object
   * @param {String} params.code Authorization code (from previous step)
   * @param {String} params.redirecURI A string that represents the callback uri
   * @param {String|Array<String>} params.scope A String or array of strings
   *                                     that represents the application privileges
   * @return {Promise}
   */
  async function getToken(params = {}) {
    const baseParams = {
      grant_type: 'authorization_code',
    };

    const scopeParams = encoding.getScopeParam(params.scope);
    const options = Object.assign(baseParams, params, scopeParams);

    return core.request(config.auth.tokenPath, options);
  }

  return {
    authorizeURL,
    getToken,
  };
};
