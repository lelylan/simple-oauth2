var exports = module.exports,
    crypto  = require('crypto'),
    util    = require('util'),
    Promise = require('bluebird'),
    request = Promise.promisify(require('request'));


module.exports = function(config) {

  var errors = require('./error')();


  // High level method to call API
  function api(method, path, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    if (process.env.DEBUG) console.log('OAuth2 Node Request');

    if (path.lastIndexOf('http://', 0) === 0 || path.lastIndexOf('https://', 0) === 0) {
      var url = path ;
    } else {
      var url = config.site + path ;
    }

    return call(method, url, params).spread(data).nodeify(callback);
  }


  // Make the HTTP request
  function call(method, url, params, callback) {

    var options = { uri: url, method: method }
    if (!config.clientID || !config.clientSecret || !config.site) {
      return Promise.reject(new Error('Configuration missing. You need to specify the client id, the client secret and the oauth2 server'));
    }

    if (url && url.indexOf('access_token=') !== -1)
      options.headers = {}
    else if (params.access_token && !params.client_id) {
      options.headers = { 'Authorization': 'Bearer ' + params.access_token }
      delete params.access_token;
    }
    else if (config.useBasicAuthorizationHeader && config.clientID && !params.client_id && (config.useBasicAuthorizationHeaderWhenRefreshingToken || params.grant_type !== 'refresh_token' ))
      options.headers = { 'Authorization': 'Basic ' + new Buffer(config.clientID + ':' + config.clientSecret).toString('base64') }
    else
      options.headers = {}

    if (config.headers instanceof Object)
      for(var header in config.headers)
        options.headers[header]=config.headers[header];

    if (config.ca)
      options.ca = config.ca;

    if (typeof (config.rejectUnauthorized) != 'undefined')
      options.rejectUnauthorized = config.rejectUnauthorized;

    if (config.agent)
      options.agent = config.agent;


    if (isEmpty(params)) params = null;
    if (method != 'GET') options.form = params;
    if (method == 'GET') options.qs   = params;

    // Enable the system to send authorization params in the body (for example github does not require to be in the header)
    if (method != 'GET' && options.form) {
      options.form.client_id = config.clientID;
      options.form[config.clientSecretParameterName] = config.clientSecret;
    }

    if (process.env.DEBUG) console.log('Simple OAuth2: Making the HTTP request', options)
    return request(options).nodeify(callback, { spread: true });
  }


  // Extract the data from the request response
  function data(response, body, callback) {
    if (process.env.DEBUG) console.log('Simple OAuth2: checking response body', body);

    try      { body = JSON.parse(body); }
    catch(e) { /* The OAuth2 server does not return a valid JSON'); */ }

    if (response.statusCode >= 400 && body) {
      return Promise.resolve(body).nodeify(callback);
    }else if(response.statusCode >= 400 && !body) {
      return Promise.reject(new errors.HTTPError(response.statusCode)).nodeify(callback);
    }

    return Promise.resolve(body).nodeify(callback);
  }


  function isEmpty(ob){
    for(var i in ob){ return false;}
    return true;
  }


  return {
    'call': call,
    'data': data,
    'api': api,
  }
};
