'use strict';

module.exports = {

  /**
   * Get the authorization header used to request a valid token
   * @param  {String} clientID
   * @param  {String} clientSecret
   * @return {String}              Authorization header string token
   */
  getAuthorizationHeaderToken(clientID, clientSecret) {
    return new Buffer(`${clientID}:${clientSecret}`).toString('base64');
  },
};
