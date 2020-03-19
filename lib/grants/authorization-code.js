'use strict';

const { URL } = require('url');
const querystring = require('querystring');
const GrantParams = require('../grant-params');

function generateState() {
  const length = 64;
  let state = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i += 1) {
    state += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return state;
}

function validateState(redirectResponseUrl, authorizeURL) {
  if (redirectResponseUrl && authorizeURL) {
    const redirectResponseParams = new URL(redirectResponseUrl);
    const authorizeParams = new URL(authorizeURL);

    if (redirectResponseParams.searchParams.get('state') !== authorizeParams.searchParams.get('state')) {
      throw new Error('State in refererURL does not match the original state from authorizeURL. '
        + 'This may be an indicator of a CSRF attack.');
    }
  }
}

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

    const configuredParams = this.config.options.generateState ? { ...params, state: generateState() } : params;

    const url = new URL(this.config.auth.authorizePath, this.config.auth.authorizeHost);
    const parameters = new GrantParams(this.config.options, baseParams, configuredParams);

    return `${url}?${querystring.stringify(parameters.toObject())}`;
  }

  /**
   * Requests and returns an access token from the authorization server
   *
   * @param {String} params.code Authorization code (from previous step)
   * @param {String} params.redirect_uri String representing the registered application URI where the user is redirected after authentication
   * @param {String} params.redirect_response_url Optional Used for `state` validation, URL returned from the Authorization server containing the provided `state` parameter.
   * @param {String} params.authorize_url Optional URL generated from the `authorizeURL` function. When combined with the `redirect_response_url` will validate that the `state` parameter matches between API calls.
   * @param {String|Array<String>} [params.scope] String or array of strings representing the application privileges
   * @param {Object} [httpOptions] Optional http options passed through the underlying http library
   * @return {Promise}
   */
  async getToken(params, httpOptions) {
    const { redirect_response_url: redirectResponseUrl, authorize_url: authorizeUrl, ...requestParams } = { ...params };
    validateState(redirectResponseUrl, authorizeUrl);

    const parameters = GrantParams.forGrant('authorization_code', this.config.options, requestParams);

    return this.client.request(this.config.auth.tokenPath, parameters.toObject(), httpOptions);
  }
};
