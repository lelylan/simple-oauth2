'use strict';

const HEADER_ENCODING_FORMAT = 'base64';

/**
 * Encode a single {value} using the application/x-www-form-urlencoded media type
 * while also applying some additional rules specified by the spec
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-B
 *
 * @param {String} value
 */
function useFormURLEncode(value) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

module.exports = {
  /**
   * Get the authorization header used to request a valid token
   * @param  {String} clientID
   * @param  {String} clientSecret
   * @return {String}              Authorization header string token
   */
  getAuthorizationHeaderToken(clientID, clientSecret) {
    const encodedCredentials = `${useFormURLEncode(clientID)}:${useFormURLEncode(clientSecret)}`;

    return Buffer.from(encodedCredentials).toString(HEADER_ENCODING_FORMAT);
  },
};
