'use strict';

const Wreck = require('wreck');
const querystring = require('querystring');
const debug = require('debug')('simple-oauth2:index');
const encoding = require('./encoding');

module.exports = (config) => {
  const httpOptions = Object.assign({}, config.http, {
    baseUrl: config.auth.tokenHost,
  });

  const wreck = Wreck.defaults(httpOptions);

  async function request(url, params) {
    const options = {
      json: true,
      headers: {},
    };

    // authorization server call used to retrieve a valid token
    if (config.options.useBasicAuthorizationHeader) {
      const basicHeader = encoding.getAuthorizationHeaderToken(
        config.client.id,
        config.client.secret
      );

      options.headers.Authorization = `Basic ${basicHeader}`;
    }

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

    debug('Creating request to: (POST) %s', url);
    debug('Using options: %j', options);

    const result = await wreck.post(url, options);

    return result.payload;
  }

  return {
    request,
  };
};
