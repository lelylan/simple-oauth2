'use strict';

const url = require('url');

module.exports = {

  /**
   * Indicates wether or not a given url is absolute
   * @param  {String}  urlToTest
   * @return {Boolean}
   */
  isAbsoluteUrl(urlToTest) {
    return String(url.parse(urlToTest).protocol).match(/https?/);
  },

  /**
   * Verify if a given object actually have valid properties
   * @param  {Object}  object
   * @return {Boolean}    Indicates if the object has valid properties
   */
  isEmpty(object) {
    return Object.keys(object).length === 0;
  },

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
