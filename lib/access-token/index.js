'use strict';

const isAfter = require('date-fns/is_after');
const parseToken = require('./parse-token');
const coreModule = require('./../core');

/**
 * Wrapper for the Access Token Object
 */
module.exports = (config) => {
  const core = coreModule(config);

  class AccessToken {
    constructor(token) {
      this.token = parseToken(token);
    }

    /**
    * Check if the access token is expired or not
    */
    expired() {
      return isAfter(new Date(), this.token.expires_at);
    }

    /**
    * Refresh the access token
    * @param  {Object} params An optional argument for additional API request params.
    */
    async refresh(params) {
      const options = Object.assign({}, params, {
        grant_type: 'refresh_token',
        refresh_token: this.token.refresh_token,
      });

      const response = await core.request(config.auth.tokenPath, options);

      return new AccessToken(response);
    }

    /**
    * Revoke access or refresh token
    * @param  {String} tokenType A string containing the type of token to revoke.
    *                              Should be either "access_token" or "refresh_token"
    */
    async revoke(tokenType) {
      const token = tokenType === 'access_token' ? this.token.access_token : this.token.refresh_token;
      const options = {
        token,
        token_type_hint: tokenType,
      };

      return core.request(config.auth.revokePath, options);
    }

    /**
     * Revoke both the existing access and refresh tokens
    */
    async revokeAll() {
      await this.revoke('access_token');
      await this.revoke('refresh_token');
    }
  }

  /**
   * Creates an OAuth2.AccessToken instance
   * @param  {Object} token An object containing the token object returned from the OAuth2 server.
   * @returns {AccessToken}
   */
  function createAccessToken(token) {
    return new AccessToken(token);
  }

  return {
    create: createAccessToken,
  };
};
