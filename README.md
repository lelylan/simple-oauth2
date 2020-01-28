# Simple OAuth2

[![NPM Package Version](https://img.shields.io/npm/v/simple-oauth2.svg?style=flat-square)](https://www.npmjs.com/package/simple-oauth2)
[![Build Status](https://img.shields.io/travis/lelylan/simple-oauth2.svg?style=flat-square)](https://travis-ci.org/lelylan/simple-oauth2)
[![Dependency Status](https://img.shields.io/david/lelylan/simple-oauth2.svg?style=flat-square)](https://david-dm.org/lelylan/simple-oauth2)

Node.js client library for [OAuth2](http://oauth.net/2/). OAuth2 allows users to grant access to restricted resources by third party applications.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Simple OAuth2](#simple-oauth2)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Usage](#usage)
    - [OAuth2 Supported grants](#oauth2-supported-grants)
      - [Authorization Code](#authorization-code)
      - [Password Credentials Flow](#password-credentials-flow)
      - [Client Credentials Flow](#client-credentials-flow)
    - [Access Token object](#access-token-object)
    - [Errors](#errors)
  - [Debugging the module](#debugging-the-module)
  - [API](#api)
  - [Usage examples](#usage-examples)
  - [Contributing](#contributing)
  - [Authors](#authors)
    - [Contributors](#contributors)
  - [Changelog](#changelog)
  - [License](#license)
  - [Thanks to Open Source](#thanks-to-open-source)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Requirements

The node client library is tested against Node 8 LTS and newer versions. Older node versions are unsupported.

## Usage

Install the client library using [npm](http://npmjs.org/):

```bash
npm install --save simple-oauth2
```

Create a new instance by specifying the minimal configuration

```javascript
const credentials = {
  client: {
    id: '<client-id>',
    secret: '<client-secret>'
  },
  auth: {
    tokenHost: 'https://api.oauth.com'
  }
};

const oauth2 = require('simple-oauth2').create(credentials);
```

### OAuth2 Supported grants

Depending on your use case, any of the following supported grant types may be useful:

#### Authorization Code

The [Authorization Code](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.1) grant type is made up from two parts. At first your application asks to the user the permission to access their data. If the user approves the OAuth2 server sends to the client an authorization code. In the second part, the client POST the authorization code along with its client secret to the oauth server in order to get the access token.

```javascript
async function run() {
  const oauth2 = require('simple-oauth2').create(credentials);

  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: 'http://localhost:3000/callback',
    scope: '<scope>',
    state: '<state>'
  });

  // Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
  res.redirect(authorizationUri);

  const tokenConfig = {
    code: '<code>',
    redirect_uri: 'http://localhost:3000/callback',
    scope: '<scope>',
  };

  try {
    const result = await oauth2.authorizationCode.getToken(tokenConfig);
    const accessToken = oauth2.accessToken.create(result);
  } catch (error) {
    console.log('Access Token Error', error.message);
  }
}

run();
```

#### Password Credentials Flow

The [Password Owner](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.3) grant type is suitable when the resource owner has a trust relationship with the client, such as its computer operating system or a highly privileged application. Use this flow only when other flows are not viable or when you need a fast way to test your application.

```javascript
async function run() {
  const oauth2 = require('simple-oauth2').create(credentials);

  const tokenConfig = {
    username: 'username',
    password: 'password',
    scope: '<scope>',
  };

  try {
    const result = await oauth2.ownerPassword.getToken(tokenConfig);
    const accessToken = oauth2.accessToken.create(result);
  } catch (error) {
    console.log('Access Token Error', error.message);
  }
}

run();
```

#### Client Credentials Flow

The [Client Credentials](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.4) grant type is suitable when client is requesting access to the protected resources under its control.

```javascript
async function run() {
  const oauth2 = require('simple-oauth2').create(credentials);

  const tokenConfig = {
    scope: '<scope>',
  };

  try {
    const result = await oauth2.clientCredentials.getToken(tokenConfig);
    const accessToken = oauth2.accessToken.create(result);
  } catch (error) {
    console.log('Access Token error', error.message);
  }
}

run();
```

### Access Token object

When a token expires we need to refresh it. Simple OAuth2 offers the AccessToken class that add a couple of useful methods to refresh the access token when it is expired.

```javascript
async function run() {
  const tokenObject = {
    'access_token': '<access-token>',
    'refresh_token': '<refresh-token>',
    'expires_in': '7200'
  };

  let accessToken = oauth2.accessToken.create(tokenObject);

  if (accessToken.expired()) {
    try {
      const params = {
        scope: '<scope>',
      };

      accessToken = await accessToken.refresh(params);
    } catch (error) {
      console.log('Error refreshing access token: ', error.message);
    }
  }
}

run();
```

The `expired` helper is useful for knowing when a token has definitively expired. However, there is a common race condition when tokens are near expiring. If an OAuth 2.0 token is issued with a `expires_in` property (as opposed to an `expires_at` property), there can be discrepancies between the time the OAuth 2.0 server issues the access token and when it is received.

These come down to factors such as network and processing latency and can be worked around by preemptively refreshing the access token:

```javascript
async function run() {
  const EXPIRATION_WINDOW_IN_SECONDS = 300; // Window of time before the actual expiration to refresh the token

  if (token.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
    try {
      accessToken = await accessToken.refresh();
    } catch (error) {
      console.log('Error refreshing access token: ', error.message);
    }
  }
}

run();
```

When you've done with the token or you want to log out, you can revoke the access and refresh tokens.

```javascript
async function run() {
  try {
    await accessToken.revoke('access_token');
    await accessToken.revoke('refresh_token');
  } catch (error) {
    console.log('Error revoking token: ', error.message);
  }
}

run();
```

As a convenience method, you can also revoke both tokens in a single call:

```javascript
async function run() {
  // Revoke both access and refresh tokens
  try {
    // Revokes both tokens, refresh token is only revoked if the access_token is properly revoked
    await accessToken.revokeAll();
  } catch (error) {
    console.log('Error revoking token: ', error.message);
  }
}

run();
```

### Errors

Errors are returned when a 4xx or 5xx status code is received.

    BoomError

As a standard [boom](https://github.com/hapijs/boom) error you can access any of the boom error properties. The total amount of information varies according to the generated status code.

```javascript
async function run() {
  try {
    await oauth2.authorizationCode.getToken();
  } catch(error) {
    console.log(error);
  }
}

run();
// => {
//     "statusCode": 401,
//     "error": "Unauthorized",
//     "message": "invalid password"
// }
```

## Debugging the module
This module uses the [debug](https://github.com/visionmedia/debug) module to help on error diagnosis. Use the following environment variable to help in your debug journey:

```
DEBUG=*simple-oauth2*
```

## API
For a complete reference, see the module [API](./API.md).

## Usage examples

For complete reference examples, see the [example folder](./example).

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md)

## Authors

[Andrea Reginato](http://twitter.com/lelylan)

### Contributors

Special thanks to the following people for submitting patches.

* [Jonathan Samines](https://github.com/jonathansamines)

## Changelog

See [CHANGELOG](./CHANGELOG.md)

## License

Simple OAuth 2.0 is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## Thanks to Open Source

Simple OAuth 2.0 come to life thanks to the work I've made in Lelylan, an open source microservices architecture for the Internet of Things. If this project helped you in any way, think about giving us a <a href="https://github.com/lelylan/lelylan">star on Github</a>.

<a href="https://github.com/lelylan/lelylan">
<img src="https://raw.githubusercontent.com/lelylan/lelylan/master/public/logo-lelylan.png" data-canonical-src="https://raw.githubusercontent.com/lelylan/lelylan/master/public/logo-lelylan.png" width="300"/></a>
