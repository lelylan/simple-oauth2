'use strict';

const { URL } = require('url');
const querystring = require('querystring');
const GrantParams = require('../grant-params');

module.exports = class AuthorizationCode {
  constructor(config, client) {
    this.config = config;
    this.client = client;
  }

  /**
   * Get a valid redirect URL used to redirect users to an authorization page
   *
   * @param {Object} params
   * @param {String} params.redirectURI String representing the registered application URI where the user is redirected after authentication
   * @param {String|Array<String>} params.scope String or array of strings representing the application privileges
   * @param {String} params.state String representing an opaque value used by the client to main the state between the request and the callback
   *
   * @return {String} the absolute authorization url
   */
  authorizeURL(params = {}) {
    const baseParams = {
      response_type: 'code',
      [this.config.client.idParamName]: this.config.client.id,
    };

    const url = new URL(this.config.auth.authorizePath, this.config.auth.authorizeHost);
    const parameters = new GrantParams(this.config.options, baseParams, params);

    return `${url}?${querystring.stringify(parameters.toObject())}`;
  }

  /**
   * Requests and returns an access token from the authorization server
   *
   * @param {String} params.code Authorization code (from previous step)
   * @param {String} params.redirecURI String representing the registered application URI where the user is redirected after authentication
   * @param {String|Array<String>} [params.scope] String or array of strings representing the application privileges
   * @param {Object} [httpOptions] Optional http options passed through the underlying http library
   * @return {Promise}
   */
  async getToken(params, httpOptions) {
    const parameters = GrantParams.forGrant('authorization_code', this.config.options, params);

    return this.client.request(this.config.auth.tokenPath, parameters.toObject(), httpOptions);
  }
};
