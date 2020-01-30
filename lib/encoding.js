'use strict';

const HEADER_ENCODING_FORMAT = 'base64';

/**
 * Encode a single {value} using the application/x-www-form-urlencoded media type
 * while also applying some additional rules specified by the spec
 *
 * @see https://tools.ietf.org/html/rfc6749#appendix-B
 * @see https://tools.ietf.org/html/rfc6749#section-2.3.1
 *
 * @param {String} value
 */
function useFormURLEncode(value) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

/**
 * Get a string representation for the client credentials
 *
 * @param {String} clientID
 * @param {String} clientSecret
 * @returns {String} credentials
 */
function getCredentialsString(clientID, clientSecret) {
  return `${clientID}:${clientSecret}`;
}

module.exports = class Encoding {
  constructor(encodingMode) {
    this.encodingMode = encodingMode;
  }

  /**
   * Get the authorization header used to request a valid token
   * @param  {String} clientID
   * @param  {String} clientSecret
   * @return {String}              Authorization header string token
   */
  getAuthorizationHeaderToken(clientID, clientSecret) {
    let encodedCredentials;

    if (this.encodingMode === 'strict') {
      encodedCredentials = getCredentialsString(useFormURLEncode(clientID), useFormURLEncode(clientSecret));
    } else {
      encodedCredentials = getCredentialsString(clientID, clientSecret);
    }

    return Buffer.from(encodedCredentials).toString(HEADER_ENCODING_FORMAT);
  }
};
