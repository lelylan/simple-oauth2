'use strict';

const HEADER_ENCODING_FORMAT = 'base64';

module.exports = {
  useFormURLEncode(value) {
    return encodeURIComponent(value).replace(/%20/g, '+');
  },

  /**
   * Get the authorization header used to request a valid token
   * @param  {String} clientID
   * @param  {String} clientSecret
   * @return {String}              Authorization header string token
   */
  getAuthorizationHeaderToken(clientID, clientSecret) {
    const encodedCredentials = `${this.useFormURLEncode(clientID)}:${this.useFormURLEncode(clientSecret)}`;

    return Buffer.from(encodedCredentials).toString(HEADER_ENCODING_FORMAT);
  },
};
