'use strict';

const Hoek = require('@hapi/hoek');
const querystring = require('querystring');
const debug = require('debug')('simple-oauth2:request-options');
const encoding = require('./encoding');

const JSON_CONTENT_TYPE = 'application/json';
const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

function getDefaultRequestOptions() {
  return {
    headers: {},
  };
}

module.exports = class RequestOptions {
  constructor(config, params) {
    this.config = config;
    this.requestOptions = this.createOptions(params);
  }

  createOptions(params) {
    const parameters = Object.assign({}, params);
    const requestOptions = getDefaultRequestOptions();

    if (this.config.options.authorizationMethod === 'header') {
      const credentials = encoding.getAuthorizationHeaderToken(this.config.client.id, this.config.client.secret);

      debug('Using header authentication. Authorization header set to %s', credentials);

      requestOptions.headers.Authorization = `Basic ${credentials}`;
    } else {
      debug('Using body authentication');

      parameters[this.config.client.idParamName] = this.config.client.id;
      parameters[this.config.client.secretParamName] = this.config.client.secret;
    }

    if (this.config.options.bodyFormat === 'form') {
      debug('Using form request format');

      // An example using `form` authorization params in the body is the GitHub API
      requestOptions.payload = querystring.stringify(parameters);
      requestOptions.headers['Content-Type'] = FORM_CONTENT_TYPE;
    } else {
      debug('Using json request format');

      // An example using `json` authorization params in the body is the Amazon Developer Publishing API
      requestOptions.payload = parameters;
      requestOptions.headers['Content-Type'] = JSON_CONTENT_TYPE;
    }

    return requestOptions;
  }

  toObject(requestOptions = {}) {
    return Hoek.applyToDefaults(requestOptions, this.requestOptions);
  }
};
