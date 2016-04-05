[![NPM Package Version](https://img.shields.io/npm/v/simple-oauth2.svg?style=flat-square)](https://www.npmjs.com/package/simple-oauth2)
[![Build Status](https://img.shields.io/travis/lelylan/simple-oauth2.svg?style=flat-square)](https://travis-ci.org/lelylan/simple-oauth2)
[![Dependency Status](https://img.shields.io/david/lelylan/simple-oauth2.svg?style=flat-square)](https://david-dm.org/lelylan/simple-oauth2)

# Simple OAuth2

Node.js client library for [OAuth2](http://oauth.net/2/) (this library supports both callbacks or promises for async flow).

OAuth2 lets users grant the access to the desired resources to third party applications,
giving them the possibility to enable and disable those accesses whenever they want.

Simple OAuth2 supports the following flows.

* [Authorization Code Flow](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.1) (for apps with servers that can store persistent information).
* [Password Credentials](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.3) (when previous flow can't be used or during development).
* [Client Credentials Flow](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.4) (the client can request an access token using only its client credentials)

#### Thanks to Open Source

Simple OAuth 2.0 come to life thanks to the work I've made in Lelylan, an open source microservices architecture for the Internet of Things. If this project helped you in any way, think about giving us a <a href="https://github.com/lelylan/lelylan">star on Github</a>.

<a href="https://github.com/lelylan/lelylan">
<img src="https://raw.githubusercontent.com/lelylan/lelylan/master/public/logo-lelylan.png" data-canonical-src="https://raw.githubusercontent.com/lelylan/lelylan/master/public/logo-lelylan.png" width="300"/></a>


## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
  - [Express and Github example](#express-and-github-example)
- [OAuth2 Supported flows](#oauth2-supported-flows)
  - [Authorization Code flow](#authorization-code-flow)
  - [Password Credentials Flow](#password-credentials-flow)
  - [Client Credentials Flow](#client-credentials-flow)
- [Helpers](#helpers)
  - [Access Token object](#access-token-object)
  - [Errors](#errors)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Authors](#authors)
  - [Contributors](#contributors)
- [Changelog](#changelog)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Requirements
Node client library is tested against the latest minor Node versions: 0.10.x, 0.11.x, 0.12.x and 4.2.x.


## Installation
Install the client library using [npm](http://npmjs.org/):

    $ npm install --save simple-oauth2

Install the client library using git:

    $ git clone git://github.com/lelylan/simple-oauth2.git
    $ cd simple-oauth2
    $ npm install


## Getting started
### Express and Github example

```javascript
var express = require('express'),
    app = express();

var oauth2 = require('simple-oauth2')({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  site: 'https://github.com/login',
  tokenPath: '/oauth/access_token',
  authorizationPath: '/oauth/authorize'
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: 'notifications',
  state: '3(#0/!~'
});

// Initial page redirecting to Github
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code;

  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveToken);

  function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = oauth2.accessToken.create(result);
  }
});

app.get('/', function (req, res) {
  res.send('Hello<br><a href="/auth">Log in with Github</a>');
});

app.listen(3000);

console.log('Express server started on port 3000');
```

Credits to [@lazybean](https://github.com/lazybean)

## OAuth2 Supported flows
### Authorization Code flow

The Authorization Code flow is made up from two parts. At first your application asks to
the user the permission to access their data. If the user approves the OAuth2 server sends
to the client an authorization code. In the second part, the client POST the authorization code
along with its client secret to the Lelylan in order to get the access token.

```javascript
// Set the client credentials and the OAuth2 server
var credentials = {
  clientID: '<client-id>',
  clientSecret: '<client-secret>',
  site: 'https://api.oauth.com'
};

// Initialize the OAuth2 Library
var oauth2 = require('simple-oauth2')(credentials);

// Authorization oauth2 URI
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: '<scope>',
  state: '<state>'
});

// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
res.redirect(authorization_uri);

// Get the access token object (the authorization code is given from the previous step).
var token;
var tokenConfig = {
  code: '<code>',
  redirect_uri: 'http://localhost:3000/callback'
};

// Callbacks
// Save the access token
oauth2.authCode.getToken(tokenConfig, function saveToken(error, result) {
  if (error) { console.log('Access Token Error', error.message); }

  token = oauth2.accessToken.create(result);
});

// Promises
// Save the access token
oauth2.authCode.getToken(tokenConfig)
.then(function saveToken(result) {
  token = oauth2.accessToken.create(result);
})
.catch(function logError(error) {
  console.log('Access Token Error', error.message);
});
```

### Password Credentials Flow

This flow is suitable when the resource owner has a trust relationship with the
client, such as its computer operating system or a highly privileged application.
Use this flow only when other flows are not viable or when you need a fast way to
test your application.

```javascript
// Get the access token object.
var token;
var tokenConfig = {
  username: 'username',
  password: 'password' 
};

// Callbacks
// Save the access token
oauth2.password.getToken(tokenConfig, function saveToken(error, result) {
  if (error) { console.log('Access Token Error', error.message); }
  token = oauth2.accessToken.create(result);

  oauth2.api('GET', '/users', {
    access_token: token.token.access_token
  }, function (err, data) {
    console.log(data);
  });
});

// Promises
// Save the access token
oauth2.password
  .getToken(tokenConfig)
  .then(function saveToken(result) {
    token = oauth2.accessToken.create(result);
    return oauth2.api('GET', '/users', { access_token: token.token.access_token });
  })
  .then(function evalResource(data) {
    console.log(data);
  });
```

### Client Credentials Flow

This flow is suitable when client is requesting access to the protected resources under its control.

```javascript
// Get the access token object.
var credentials = {
  clientID: '<client-id>',
  clientSecret: '<client-secret>',
  site: 'https://api.oauth.com'
};

// Initialize the OAuth2 Library
var oauth2 = require('simple-oauth2')(credentials);
var token;
var tokenConfig = {};

// Callbacks
// Get the access token object for the client
oauth2.client.getToken(tokenConfig, function saveToken(error, result) {
  if (error) { console.log('Access Token Error', error.message); }
  token = oauth2.accessToken.create(result);
});


// Promises
// Get the access token object for the client
oauth2.client
  .getToken(tokenConfig)
  .then(function saveToken(result) {
    token = oauth2.accessToken.create(result);
  })
  .catch(function logError(error) {
    console.log('Access Token error', error.message);
  });
```

## Helpers
### Access Token object

When a token expires we need to refresh it. Simple OAuth2 offers the
AccessToken class that add a couple of useful methods to refresh the
access token when it is expired.

```javascript
// Sample of a JSON access token (you got it through previous steps)
var token = {
  'access_token': '<access-token>',
  'refresh_token': '<refresh-token>',
  'expires_in': '7200'
};

// Create the access token wrapper
var token = oauth2.accessToken.create(token);

// Check if the token is expired. If expired it is refreshed.
if (token.expired()) {
  // Callbacks
  token.refresh(function(error, result) {
    token = result;
  })

  // Promises
  token.refresh().then(function saveToken(result) {
    token = result;
  });
}
```

When you've done with the token or you want to log out, you can
revoke the access token and refresh token.

```javascript

// Callbacks
// Revoke only the access token
token.revoke('access_token', function(error) {
  // Session ended. But the refresh_token is still valid.

  // Revoke the refresh_token
  token.revoke('refresh_token', function(error) {
    console.log('token revoked.');
  });
});

// Promises
// Revoke only the access token
token.revoke('access_token')
  .then(function revokeRefresh() {
    // Revoke the refresh token
    return token.revoke('refresh_token');
  })
  .then(function tokenRevoked() {
    console.log('Token revoked');
  })
  .catch(function logError(error) {
    console.log('Error revoking token.', error.message);
  });
```

### Errors

Exceptions are raised when a 4xx or 5xx status code is returned.

    HTTPError

Through the error message attribute you can access the JSON representation
based on HTTP `status` and error `message`.

```javascript
// Callbacks
oauth2.authCode.getToken(function(error, token) {
  if (error) { console.log(error.message); }
});

// Promises
oauth2.authCode.getToken().catch(function evalError(error) {
  console.log(error.message);
});

// => { "status": "401", "message": "Unauthorized" }
```


## Configuration
Simple OAuth2 accepts an object with the following valid params.

* `clientID` - Required registered Client ID.
* `clientSecret` - Required registered Client secret.
* `site` - Required OAuth2 server site.
* `authorizationPath` - Authorization path for the OAuth2 server. Defaults to `/oauth/authorize`.
* `tokenPath` - Access token path for the OAuth2 server. Defaults to `/oauth/token`.
* `revocationPath` - Revocation token path for the OAuth2 server. Defaults to `/oauth/revoke`.
* `useBasicAuthorizationHeader` - Whether or not the `Authorization: Basic ...` header is set on the request.
Defaults to `true`.
* `clientSecretParameterName` - Parameter name for the client secret. Defaults to `client_secret`.
* `useBodyAuth` - Wheather or not the clientID/clientSecret params are sent in the request body. Defaults to `true`.

```javascript
// Set the configuration settings
var credentials = {
  clientID: '<client-id>',
  clientSecret: '<client-secret>',
  site: 'https://www.oauth2.com',
  authorizationPath: '/oauth2/authorization',
  tokenPath: '/oauth2/access_token',
  revocationPath: '/oauth2/revoke'
};

// Initialize the OAuth2 Library
var oauth2 = require('simple-oauth2')(credentials);
```

## Contributing
See [CONTRIBUTING](https://github.com/lelylan/simple-oauth2/blob/master/CONTRIBUTING.md)


## Authors
[Andrea Reginato](http://twitter.com/lelylan)


### Contributors
Special thanks to the following people for submitting patches.

* [Jonathan Samines](http://twitter.com/jonathansamines)


## Changelog
See [CHANGELOG](https://github.com/lelylan/simple-oauth2/blob/master/CHANGELOG.md)


## License

Simple OAuth 2.0 is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
