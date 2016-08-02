'use strict';

const Promise = require('bluebird');
const debug = require('debug')('simple-oauth2:main');
const utils = require('./utils');
const errorModule = require('./error');
const request = Promise.promisify(require('request'));

module.exports = function (config) {
  const errors = errorModule();

  // Make the HTTP request
  // programar mas todavía
  function call(method, url, params, callback) {
    const options = { uri: url, method };

    // todavía, no hay información sobre la configuración
    if (!config.clientID || !config.clientSecret || !config.site) {
      const error = new Error('Configuration missing. You need to specify the client id, the client secret and the oauth2 server'); // eslint-disable-line max-len

      return Promise.reject(error);
    }

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

    debug('Making the HTTP request', options);

    return request(options).nodeify(callback, { spread: true });
  }


  // Extract the data from the request response
  function data(response, body, callback) {
    debug('Checking response body', body);

    try {
      body = JSON.parse(body);
    } catch (e) {
      /* The OAuth2 server does not return a valid JSON */
    }

    if (response.statusCode >= 400) {
      return Promise.reject(new errors.HTTPError(response.statusCode, body)).nodeify(callback);
    }

    return Promise.resolve(body).nodeify(callback);
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
      .spread(data)
      .nodeify(callback);
  }

  return {
    call,
    data,
    api,
  };
};
