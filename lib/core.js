'use strict';

const Promise = require('bluebird');
const querystring = require('querystring');
const debug = require('debug')('simple-oauth2:main');
const utils = require('./utils');
const Wreck = require('wreck');

module.exports = (config) => {
  const wreck = Wreck.defaults(Object.assign({}, config.http));

  // makes an http request
  function request(method, uri, params) {
    const options = {
      json: true,
      headers: {},
    };

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
      let payload = params;

      // Enable the system to send authorization params in the body.
      if (config.options.useBodyAuth) {
        payload = Object.assign({}, payload, {
          [config.client.idParamName]: config.client.id,
          [config.client.secretParamName]: config.client.secret,
        });
      }

      if (config.options.bodyFormat === 'form') {
        // An example using `form` authorization params in the body is the
        // GitHub API.
        options.payload = querystring.stringify(payload);
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        // An example using `json` authorization params in the body is the
        // Amazon Developer Publishing API.
        options.payload = payload;
        options.headers['Content-Type'] = 'application/json';
      }
    } else if (method === 'GET' && params) {
      uri = `${uri}?${querystring.stringify(params)}`;
    }

    debug('Making the HTTP request', options);

    return wreck[method.toLowerCase()](uri, options);
  }

  // High level method to call API
  function api(method, url, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    return Promise.resolve(request(method, url, params))
      .then(({ payload }) => payload)
      .nodeify(callback);
  }

  return {
    api,
  };
};
