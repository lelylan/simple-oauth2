//
// **Node.js client library for [OAuth2](http://oauth.net/2/)**
//
// **[Github repository](https://github.com/andreareginato/simple-oauth2)**
//
// OAuth2 lets users grant the access to the desired resources to third party applications,
// giving them the possibility to enable and disable those accesses whenever they want.
//
// Simple OAuth2 supports the following flows.
//
// * Authorization Code Flow (for apps with servers that can store persistent information).
// * Password Credentials (when previous flow can't be used or during development).
//
// ### Installation
//
//     npm install simple-oauth2
//
//
// ### Authorization Code flow
//
// The Authorization Code flow is made up from two parts. At first your application asks to
// the user the permission to access their data. If the user approves Lelylan sends to the
// client an authorization code. In the second part, the client POST the authorization code
// along with its client secret to the Lelylan in order to get the access token.
// [Learn more about](auth-code.html).
//
//
//     // Set the client credentials
//     var credentials = { client: {
//       id: '<client-id>',
//       secret: '<client-secret>',
//       site: 'https://api.oauth2.com'
//     }};
//
//     // Initialize the OAuth2 Library
//     var OAuth2 = require('simple-oauth2')(credentials);
//
//     // Authorization OAuth2 URI
//     var authorization_uri = OAuth2.AuthCode.authorizeURL({
//       redirect_uri: 'http://localhost:3000/callback',
//       scope: scope,
//       state: state
//     });
//
//     // Redirect example using Express
//     // See http://expressjs.com/api.html#res.redirect
//     res.redirect(authorization_uri);
//
//     // Get the access token object.
//     // The authorization code is given from the previous step.
//     var token;
//     OAuth2.AuthCode.getToken({
//       code: 'authorization-code',
//       redirect_uri: 'http://localhost:3000/callback'
//     }, function(error, result) { token = result });
//
//     // Create the access token wrapper
//     var token = OAuth2.AccessToken.create(json_token);
//
//     // Check if the token is expired. If expired it is refreshed.
//     if (token.expired()) {
//       token.refresh(function(error, result) {
//         token = result;
//       })
//     }
//
//
// ### Password Credentials Flow
//
// This flow is suitable when the resource owner has a trust relationship with the
// client, such as its computer operating system or a highly privileged application.
// Use this flow only when other flows are not viable or when you need a fast way to
// test your application. [Learn more about](password.html).
//
//
//     // Get the access token object.
//     var token;
//     OAuth2.Password.getToken({
//       username: 'username',
//       password: 'password' 
//     }, function(error, result) { token = result });
//
//
// ### Access Token object
//
// When a token expires we need to refresh it. Simple OAuth2 offers the
// AccessToken class that add a couple of useful methods to refresh the
// access token when it is expired. [Learn more about](access-token.html).
//
//
//     // Get the access token object.
//     var token;
//     OAuth2.AuthCode.getToken({
//       code: 'authorization-code',
//       redirectURI: 'http://localhost:3000/callback'
//     }, function(error, result) { token = result });
//
//     // Create the access token wrapper
//     var token = OAuth2.AccessToken.create(json_token);
//
//     // Check if the token is expired. If expired it is refreshed.
//     if (token.expired()) {
//       token.refresh(function(error, result) {
//         token = result;
//       })
//     }
//
//
// ### Errors
//
// Exceptions are raised when a 4xx or 5xx status code is returned.
//
//     OAtuh2.HTTPError
//
// Through the error message attribute you can access the JSON representation
// based on HTTP `status` and error `message`.
//
//     OAuth2.AuthCode.getToken(function(error, token) {
//       if (error) { console.log(error.message); }
//     });
//     // => { "status": "401", "message": "Unauthorized" }
//

//
// ### Configurations
//
// Simple OAuth2 accepts an object with the following valid params.
//
// * `client.id` - Required registered Client ID.
// * `client.secret` - Required registered Client secret.
// * `client.site` - Required registered Client site.
// * `authorizationPath` - Authorization path for the OAuth2 server.
// Simple Oauth2 uses `/oauth/authorization` as default
// * `tokenPath` - Access token path for the OAuth2 server.
// Simple Oauth2 uses `/oauth/token` as default.
//
//
var appConfig = require('./config');

module.exports = function(config) {

  function configure(config) {
    config = config || {};
    mergeDefaults(config, appConfig);
    return config;
  }

  config = configure(config);
  var core = require('./core')(config);

	function mergeDefaults(o1, o2) {
		for (var p in o2) {
			try { if (typeof o2[p] == 'object') { o1[p] = mergeDefaults(o1[p], o2[p]); } else if (typeof o1[p] == 'undefined') { o1[p] = o2[p]; } }
			catch(e) { o1[p] = o2[p]; }
		}
		return o1;
	}

  return {
    'AuthCode': require('./client/auth-code')(config),
    'Password': require('./client/password')(config),
    'AccessToken': require('./client/access-token')(config)
  }
};

