'use strict';

const HEADER_ENCODING_FORMAT = 'base64';

module.exports = {
  /**
   * Get the authorization header used to request a valid token
   * @param  {String} clientID
   * @param  {String} clientSecret
   * @return {String}              Authorization header string token
   */
  getAuthorizationHeaderToken(clientID, clientSecret) {
    const credentials = `${clientID}:${clientSecret}`;

    return Buffer.from(credentials).toString(HEADER_ENCODING_FORMAT);
  },
};
