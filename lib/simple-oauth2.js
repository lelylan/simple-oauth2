//
// A NodeJS module for interfacing with OAuth2. It accepts
// an object with the following valid params.
//
// * `client.id` - Required registered Client ID.
// * `client.secret` - Required registered Client secret.
// * `client.site` - Required registered Client site.
// * `authorizationPath` - Authorization path for the OAuth2 server.
// Simple Oauth2 uses `/oauth/authorization` as default
// * `tokenPath` - Access token path for the OAuth2 server.
// Simple Oauth2 uses `/oauth/token` as default.
//
var appConfig = require('./config');


// Configuration merge
function mergeDefaults(o1, o2) {
  for (var p in o2) {
    try { if (typeof o2[p] == 'object') { o1[p] = mergeDefaults(o1[p], o2[p]); } else if (typeof o1[p] == 'undefined') { o1[p] = o2[p]; } }
    catch(e) { o1[p] = o2[p]; }
  }
  return o1;
}


// Export the client we'll use to make requests
module.exports = function(config) {

  // Base configuration
  function configure(config) {
    config = config || {};
    mergeDefaults(config, appConfig);

    return config;
  }

  config = configure(config);
  var core = require('./core')(config);

  return {
    'AuthCode': require('./client/auth-code')(config),
  }
};
