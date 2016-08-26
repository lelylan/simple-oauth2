'use strict';

const Promise = require('bluebird');
const debug = require('debug')('simple-oauth2:main');
const utils = require('./utils');
const HTTPError = require('./error');
const request = Promise.promisify(require('request'));

module.exports = function (config) {
  // Make the HTTP request
  function call(method, url, params, callback) {
    const options = { uri: url, method };

    // Token sent by querystring
    if (url && url.indexOf('access_token=') !== -1) {
      options.headers = {};

    // Api authenticated call sent using headers
    } else if (params.access_token && !params.client_id) {
      options.headers = {
        Authorization: `Bearer ${params.access_token}`,
      };

      delete params.access_token;

    // OAuth2 server call used to retrieve a valid token
    } else if (config.useBasicAuthorizationHeader && config.clientID && !params.client_id) {
      const basicHeader = utils.getAuthorizationHeaderToken(config.clientID, config.clientSecret);
      options.headers = {
        Authorization: `Basic ${basicHeader}`,
      };
    } else {
      options.headers = {};
    }

    // Copy provided headers
    if (config.headers instanceof Object) {
      Object
        .keys(config.headers)
        .forEach((headerName) => {
          options.headers[headerName] = config.headers[headerName];
        });
    }

    // Set options if provided
    if (config.ca) options.ca = config.ca;
    if (config.agent) options.agent = config.agent;
    if (config.rejectUnauthorized) options.rejectUnauthorized = config.rejectUnauthorized;

    if (utils.isEmpty(params)) params = null;
    if (method !== 'GET') options.form = params;
    if (method === 'GET') options.qs = params;

    // Enable the system to send authorization params in the body
    // For example github does not require to be in the header
    if (config.useBodyAuth && options.form) {
      options.form.client_id = config.clientID;
      options.form[config.clientSecretParameterName] = config.clientSecret;
    }

    // options.headers.Accept = 'application/json';

    debug('Making the HTTP request', options);

    return request(options)
      .nodeify(callback, { spread: true });
  }


  // Extract the data from the request response
  function parseReponse(response, body, callback) {
    debug('Checking response body', body);

    try {
      body = JSON.parse(body);
    } catch (e) {
      /* The OAuth2 server does not return a valid JSON */
    }

    if (response.statusCode >= 400) {
      return Promise
        .reject(new HTTPError(response.statusCode, body)).nodeify(callback);
    }

    return Promise
      .resolve(body)
      .nodeify(callback);
  }

  // High level method to call API
  function api(method, path, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    debug('OAuth2 Node Request');

    const isAbsoluteUrl = utils.isAbsoluteUrl(path);
    const url = isAbsoluteUrl ? path : config.site + path;

    return call(method, url, params)
      .spread(parseReponse)
      .nodeify(callback);
  }

  return {
    call,
    api,
  };
};
