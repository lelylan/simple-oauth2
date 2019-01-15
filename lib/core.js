'use strict';

const Wreck = require('wreck');
const querystring = require('querystring');
const debug = require('debug')('simple-oauth2:index');
const encoding = require('./encoding');
const proxy = require('proxy-agent');

const defaultHeaders = {
  Accept: 'application/json',
};

module.exports = (config) => {
  let agent = proxy(proxyUrl);
  const httpOptions = Object.assign({}, config.http, {
    baseUrl: config.auth.tokenHost,
    headers: Object.assign({}, defaultHeaders, (config.http && config.http.headers))
  });

  if (process.env.HTTP_PROXY || process.env.HTTP_PROXY) {
    httpOptions.agent = proxy(proxyUrl);
  }
  
  const wreck = Wreck.defaults(httpOptions);

  async function request(url, params) {
    let payload = params;
    const options = {
      json: true,
      headers: {},
    };

    if (config.options.authorizationMethod === 'header') {
      const basicHeader = encoding.getAuthorizationHeaderToken(
        config.client.id,
        config.client.secret
      );

      debug('Using header authentication. Authorization header set to %s', basicHeader);

      options.headers.Authorization = `Basic ${basicHeader}`;
    } else {
      debug('Using body authentication');

      payload = Object.assign({}, payload, {
        [config.client.idParamName]: config.client.id,
        [config.client.secretParamName]: config.client.secret,
      });
    }

    if (config.options.bodyFormat === 'form') {
      debug('Using form request format');

      // An example using `form` authorization params in the body is the
      // GitHub API.
      options.payload = querystring.stringify(payload);
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      debug('Using json request format');

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

