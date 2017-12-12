'use strict';

const Wreck = require('wreck');
const querystring = require('querystring');
const debug = require('debug')('simple-oauth2:main');
const utils = require('./utils');

module.exports = (config) => {
  const wreck = Wreck.defaults(Object.assign({}, config.http, {
    baseUrl: config.auth.tokenHost,
  }));

  function request(method, uri, params) {
    const options = {
      json: true,
      headers: {},
    };

    // authorization server call used to retrieve a valid token
    if (config.options.useBasicAuthorizationHeader && !params[config.client.idParamName]) {
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

  async function api(method, url, params) {
    const result = await request(method, url, params);

    return result.payload;
  }

  return {
    api,
  };
};
