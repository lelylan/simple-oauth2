var exports = module.exports,
    request = require('request'),
    crypto  = require('crypto'),
    util    = require("util");


module.exports = function(config) {

  var errors = require("./error.js")();


  // High level method to call API
  function api(method, path, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    if(!callback || typeof(callback) !== 'function') {
      throw new Error('Callback not provided on API call');
    }

    if (process.env.DEBUG) console.log('OAuth2 Node Request');
    var url = config.site + path;

    call(method, url, params, function(error, response, body) {
      data(error, response, body, callback);
    });
  }


  // Make the HTTP request
  function call(method, url, params, callback) {

    var options = { uri: url, method: method }
    if (!config.clientID || !config.clientSecret || !config.site)
      throw new Error('Configuration missing. You need to specify the client id, the client secret and the oauth2 server');

    if (url && url.indexOf('access_token=') !== -1)
      options.headers = {}
    else if (params.access_token && !params.client_id) {
      options.headers = { 'Authorization': 'Bearer ' + params.access_token }
      delete params.access_token;
    }
    else if (config.useBasicAuthorizationHeader && config.clientID && !params.client_id)
      options.headers = { 'Authorization': 'Basic ' + new Buffer(config.clientID + ':' + config.clientSecret).toString('base64') }
    else
      options.headers = {}

    if (config.ca)
      options.ca = config.ca;

    if (typeof (config.rejectUnauthorized) != "undefined")
      options.rejectUnauthorized = config.rejectUnauthorized;

    if (config.agent)
      options.agent = config.agent;


    if (isEmpty(params)) params = null;
    if (method != 'GET') options.form = params;
    if (method == 'GET') options.qs   = params;

    // Enable the system to send authorization params in the body (for example github does not require to be in the header)
    if (method != 'GET' && options.form && !params.password) {
      options.form.client_id = config.clientID;
      options.form[config.clientSecretParameterName] = config.clientSecret;
    }

    if (process.env.DEBUG) console.log('Simple OAuth2: Making the HTTP request', options)
    request(options, callback)
  }


  // Extract the data from the request response
  function data(error, response, body, callback) {

    if (error) {
      return callback(error);
    }

    if (process.env.DEBUG) console.log('Simple OAuth2: checking response body', body);

    try      { body = JSON.parse(body); }
    catch(e) { /* The OAuth2 server does not return a valid JSON'); */ }

    if (response.statusCode >= 400) return callback(body || new errors.HTTPError(response.statusCode), null)
    callback(error, body);
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
