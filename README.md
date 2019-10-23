# Simple OAuth2

[![NPM Package Version](https://img.shields.io/npm/v/simple-oauth2.svg?style=flat-square)](https://www.npmjs.com/package/simple-oauth2)
[![Build Status](https://img.shields.io/travis/lelylan/simple-oauth2.svg?style=flat-square)](https://travis-ci.org/lelylan/simple-oauth2)
[![Dependency Status](https://img.shields.io/david/lelylan/simple-oauth2.svg?style=flat-square)](https://david-dm.org/lelylan/simple-oauth2)

Node.js client library for [OAuth2](http://oauth.net/2/).

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


- [Simple OAuth2](#simple-oauth2)
      - [Thanks to Open Source](#thanks-to-open-source)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Getting started](#getting-started)
    - [Installation](#installation)
    - [Options](#options)
    - [Example of Usage](#example-of-usage)
  - [OAuth2 Supported flows](#oauth2-supported-flows)
    - [Authorization Code flow](#authorization-code-flow)
    - [Password Credentials Flow](#password-credentials-flow)
    - [Client Credentials Flow](#client-credentials-flow)
  - [Helpers](#helpers)
    - [Access Token object](#access-token-object)
    - [Errors](#errors)
  - [Contributing](#contributing)
  - [Authors](#authors)
    - [Contributors](#contributors)
  - [Changelog](#changelog)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Requirements

The node client library is tested against Node 8 LTS and newer versions. Older node versions are unsupported.

## Getting started

### Installation

Install the client library using [npm](http://npmjs.org/):

```bash
npm install --save simple-oauth2
```

### Options

Simple OAuth2 accepts an object with the following valid params.

* `client` - required object with the following properties:
  * `id` - Service registered client id. When required by the [spec](https://tools.ietf.org/html/rfc6749#appendix-B) this value will be automatically encoded. Required.
  * `secret` - Service registered client secret. When required by the [spec](https://tools.ietf.org/html/rfc6749#appendix-B) this value will be automatically encoded. Required.
  * `secretParamName` - Parameter name used to send the client secret. Default to **client_secret**.
  * `idParamName` - Parameter name used to send the client id. Default to **client_id**.

* `auth` - required object with the following properties.
  * `tokenHost` - String used to set the host to request the tokens to. Required.
  * `tokenPath` - String path to request an access token. Default to **/oauth/token**.
  * `revokePath` - String path to revoke an access token. Default to **/oauth/revoke**.
  * `authorizeHost` - String used to set the host to request an "authorization code". Default to the value set on `auth.tokenHost`.
  * `authorizePath` - String path to request an authorization code. Default to **/oauth/authorize**.

* `http` optional object used to set global options to the internal http library ([wreck](https://github.com/hapijs/wreck)).
  * All options except **baseUrl** are allowed. `headers.authorization` will always be overriden by the library to properly send the required credentials on each scenario. Default to `headers.Accept = application/json`.

* `options` optional object to setup the module.
  * `bodyFormat` - Format of data sent in the request body. Valid options are `form` or `json`. Defaults to **form**.
  * `authorizationMethod` - Indicates the method used to send the client.id/client.secret authorization params at the token request. Valid options are `header` or `body`. If set to **body**, the **bodyFormat** option will be used to format the credentials. Defaults to **header**.

```javascript
// Set the configuration settings
const credentials = {
  client: {
    id: '<client-id>',
    secret: '<client-secret>'
  },
  auth: {
    tokenHost: 'https://api.oauth.com'
  }
};

// Initialize the OAuth2 Library
const oauth2 = require('simple-oauth2').create(credentials);
```

### Example of Usage

See the [example folder](./example).

## OAuth2 Supported flows

### Authorization Code flow

The Authorization Code flow is made up from two parts. At first your application asks to
the user the permission to access their data. If the user approves the OAuth2 server sends
to the client an authorization code. In the second part, the client POST the authorization code
along with its client secret to the oauth server in order to get the access token.

```javascript
const oauth2 = require('simple-oauth2').create(credentials);

// Authorization oauth2 URI
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: '<scope>', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
  state: '<state>'
});

// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
res.redirect(authorizationUri);

// Get the access token object (the authorization code is given from the previous step).
const tokenConfig = {
  code: '<code>',
  redirect_uri: 'http://localhost:3000/callback',
  scope: '<scope>', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
};

// Optional per-call http options
const httpOptions = {};

// Save the access token
try {
  const result = await oauth2.authorizationCode.getToken(tokenConfig, httpOptions);
  const accessToken = oauth2.accessToken.create(result);
} catch (error) {
  console.log('Access Token Error', error.message);
}

```

### Password Credentials Flow

This flow is suitable when the resource owner has a trust relationship with the
client, such as its computer operating system or a highly privileged application.
Use this flow only when other flows are not viable or when you need a fast way to
test your application.

```javascript
const oauth2 = require('simple-oauth2').create(credentials);

// Get the access token object.
const tokenConfig = {
  username: 'username',
  password: 'password',
  scope: '<scope>', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
};

// Optional per-call http options
const httpOptions = {};

// Save the access token
try {
  const result = await oauth2.ownerPassword.getToken(tokenConfig, httpOptions);
  const accessToken = oauth2.accessToken.create(result);
} catch (error) {
  console.log('Access Token Error', error.message);
}
```

### Client Credentials Flow

This flow is suitable when client is requesting access to the protected resources under its control.

```javascript
const oauth2 = require('simple-oauth2').create(credentials);
const tokenConfig = {
  scope: '<scope>', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
};

// Optional per-call http options
const httpOptions = {};

// Get the access token object for the client
try {
  const result = await oauth2.clientCredentials.getToken(tokenConfig, httpOptions);
  const accessToken = oauth2.accessToken.create(result);
} catch (error) {
  console.log('Access Token error', error.message);
}
```

## Helpers

### Access Token object

When a token expires we need to refresh it. Simple OAuth2 offers the
AccessToken class that add a couple of useful methods to refresh the
access token when it is expired.

```javascript
// Sample of a JSON access token (you got it through previous steps)
const tokenObject = {
  'access_token': '<access-token>',
  'refresh_token': '<refresh-token>',
  'expires_in': '7200'
};

// Create the access token wrapper
let accessToken = oauth2.accessToken.create(tokenObject);

// Check if the token is expired. If expired it is refreshed.
if (accessToken.expired()) {
  try {
    const params = {
      scope: '<scope>', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    };

    accessToken = await accessToken.refresh(params);
  } catch (error) {
    console.log('Error refreshing access token: ', error.message);
  }
}
```

The `expired` helper is useful for knowing when a token has definitively
expired. However, there is a common race condition when tokens are near
expiring. If an OAuth 2.0 token is issued with a `expires_in` property (as
opposed to an `expires_at` property), there can be discrepancies between the
time the OAuth 2.0 server issues the access token and when it is received.
These come down to factors such as network and processing latency. This can be
worked around by preemptively refreshing the access token:

```javascript
// Provide a window of time before the actual expiration to refresh the token
const EXPIRATION_WINDOW_IN_SECONDS = 300;

const { token } = accessToken;
const expirationTimeInSeconds = token.expires_at.getTime() / 1000;
const expirationWindowStart = expirationTimeInSeconds - EXPIRATION_WINDOW_IN_SECONDS;

// If the start of the window has passed, refresh the token
const nowInSeconds = (new Date()).getTime() / 1000;
const shouldRefresh = nowInSeconds >= expirationWindowStart;
if (shouldRefresh) {
  try {
    accessToken = await accessToken.refresh();
  } catch (error) {
    console.log('Error refreshing access token: ', error.message);
  }
}
```

When you've done with the token or you want to log out, you can
revoke the access token and refresh token.

```javascript
// Revoke both access and refresh tokens
try {
  // Revoke only the access token
  await accessToken.revoke('access_token');

  // Session ended. But the refresh_token is still valid.
  // Revoke the refresh token
  await accessToken.revoke('refresh_token');
} catch (error) {
  console.log('Error revoking token: ', error.message);
}
```

As a convenience method, you can also revoke both tokens in a single call:

```javascript
// Revoke both access and refresh tokens
try {
  // Revokes both tokens, refresh token is only revoked if the access_token is properly revoked
  await accessToken.revokeAll();
} catch (error) {
  console.log('Error revoking token: ', error.message);
}
```

### Errors

Errors are returned when a 4xx or 5xx status code is received.

    BoomError

As a standard [boom](https://github.com/hapijs/boom) error you can access any of the boom error properties. The total amount of information varies according to the generated status code.

```javascript

try {
  await oauth2.authorizationCode.getToken();
} catch(error) {
  console.log(error);
}

// => {
//     "statusCode": 401,
//     "error": "Unauthorized",
//     "message": "invalid password"
// }
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
