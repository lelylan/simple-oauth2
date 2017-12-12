'use strict';

const Promise = require('bluebird');
const debug = require('debug')('simple-oauth2:main');
const utils = require('./utils');
const HTTPError = require('./error');

const request = Promise.promisify(require('request'), {
  multiArgs: true,
});

/**
 * Parse the oauth server response
 * Decides wether or not the response is accepted
 * @param  {response} response raw response object
 * @param  {Object} body
 * @param  {Function} callback
 * @return {Promise}
 */
function parseReponse(response, body) {
  debug('Checking response body', body);

  try {
    body = JSON.parse(body);
  } catch (e) {
    /* The OAuth2 server does not return a valid JSON */
  }

  if (response.statusCode >= 400) {
    return Promise.reject(new HTTPError(response.statusCode, body));
  }

  return Promise.resolve(body);
}

module.exports = (config) => {
  // makes an http request
  function call(method, uri, params) {
    const options = Object.assign({}, { method, uri }, config.http);

    // api authenticated call sent using headers
    if (params.access_token && !params[config.client.idParamName]) {
      options.headers.Authorization = `Bearer ${params.access_token}`;

      delete params.access_token;

    // oauth2 server call used to retrieve a valid token
    } else if (config.options.useBasicAuthorizationHeader &&
      config.client.id &&
      !params[config.client.idParamName]) {
      const basicHeader = utils.getAuthorizationHeaderToken(config.client.id, config.client.secret);
      options.headers.Authorization = `Basic ${basicHeader}`;
    }

    if (Object.keys(params).length === 0) params = null;

    if (method !== 'GET') {
      if (config.options.bodyFormat === 'form') {
        options.form = params;
      } else {
        // if the bodyFormat is not form, is assummed to be json
        options.json = true;
        options.body = params;
      }
    } else {
      options.qs = params;
    }

    // Enable the system to send authorization params in the body.
    if (config.options.useBodyAuth) {
      if (options.form) {
        // An example using `form` authorization params in the body is the
        // GitHub API.
        options.form[config.client.idParamName] = config.client.id;
        options.form[config.client.secretParamName] = config.client.secret;
      } else {
        // An example using `json` authorization params in the body is the
        // Amazon Developer Publishing API.
        options.body[config.client.idParamName] = config.client.id;
        options.body[config.client.secretParamName] = config.client.secret;
      }
    }

    debug('Making the HTTP request', options);

    return request(options);
  }

  // High level method to call API
  function api(method, url, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    debug('OAuth2 Node Request');

    return call(method, url, params)
      .spread(parseReponse)
      .nodeify(callback);
  }

  return {
    call,
    api,
  };
};
