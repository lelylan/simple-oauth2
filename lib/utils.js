'use strict';

module.exports = {

  /**
   * Get the authorization header used to request a valid token
   * @param  {String} clientID
   * @param  {String} clientSecret
   * @return {String}              Authorization header string token
   */
  getAuthorizationHeaderToken(clientID, clientSecret) {
    return Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
  },
};
