# Simple OAuth2

Node.js client library for [Oauth2](http://oauth.net/2/).

OAuth2 lets users grant the access to the desired resources to third party applications,
giving them the possibility to enable and disable those accesses whenever they want.

Simple OAuth2 supports the following flows.

* Authorization Code Flow (for apps with servers that can store persistent information).
* Password Credentials (when previous flow can't be used or during development).

## Requirements

Node client library is tested against Node ~0.8.x


## Installation

Install the client library using [npm](http://npmjs.org/):

    $ npm install simple-oauth2

Install the client library using git:

    $ git clone git://github.com/andrearegianto/simple-oauth2.git
    $ cd simple-oauth2
    $ npm install


## Getting started

### Express and Github example

```javascript
var express = require('express'),
    app = express();
    
var OAuth2 = require('simple-oauth2')({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  site: 'https://github.com/login',
  tokenPath: '/oauth/access_token'
});

// Authorization uri definition
var authorization_uri = OAuth2.AuthCode.authorizeURL({
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
  console.log('/callback');
  OAuth2.AuthCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveToken);

  function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = OAuth2.AccessToken.create(result);
  }
});

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);

console.log('Express server started on port 3000');
```

Credits to [@lazybean](https://github.com/lazybean)

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
var OAuth2 = require('simple-oauth2')(credentials);

// Authorization OAuth2 URI
var authorization_uri = OAuth2.AuthCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: '<scope>',
  state: '<state>'
});

// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
res.redirect(authorization_uri);

// Get the access token object (the authorization code is given from the previous step).
var token;
OAuth2.AuthCode.getToken({
  code: '<code>',
  redirect_uri: 'http://localhost:3000/callback'
}, saveToken);

// Save the access token
function saveToken(error, result) {
  if (error) { console.log('Access Token Error', error.message); }
  token = OAuth2.AccessToken.create(result);
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
OAuth2.Password.getToken({
  username: 'username',
  password: 'password' 
}, saveToken);

// Save the access token
function saveToken(error, result) {
  if (error) { console.log('Access Token Error', error.message); }
  token = OAuth2.AccessToken.create(result);
});
```

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
var token = OAuth2.AccessToken.create(token);

// Check if the token is expired. If expired it is refreshed.
if (token.expired()) {
  token.refresh(function(error, result) {
    token = result;
  })
}
```


### Errors

Exceptions are raised when a 4xx or 5xx status code is returned.

    HTTPError

Through the error message attribute you can access the JSON representation
based on HTTP `status` and error `message`.

```javascript
OAuth2.AuthCode.getToken(function(error, token) {
  if (error) { console.log(error.message); }
});
// => { "status": "401", "message": "Unauthorized" }
```


### Configurations

Simple OAuth2 accepts an object with the following valid params.

* `clientID` - Required registered Client ID.
* `clientSecret` - Required registered Client secret.
* `site` - Required OAuth2 server site.
* `authorizationPath` - Authorization path for the OAuth2 server.
Simple OAuth2 uses `/oauth/authorize` as default
* `tokenPath` - Access token path for the OAuth2 server.
Simple OAuth2 uses `/oauth/token` as default.

```javascript
// Set the configuration settings
var credentials = {
  clientID: '<client-id>',
  clientSecret: '<client-secret>',
  site: 'https://www.oauth2.com',
  authorizationPath: '/oauth2/authorization',
  tokenPath: '/oauth2/access_token'
};

// Initialize the OAuth2 Library
var OAuth2 = require('simple-oauth2')(credentials);
```


## Contributing

Fork the repo on github and send a pull requests with topic branches. Do not forget to
provide specs to your contribution.


### Running specs

* Fork and clone the repository (`dev` branch).
* Run `npm install` for dependencies.
* Run `make test` to execute all specs.
* Run `make test-watch` to auto execute all specs when a file change.


## Coding guidelines

Follow [github](https://github.com/styleguide/) guidelines.


## Feedback

Use the [issue tracker](http://github.com/andreareginato/simple-oauth2/issues) for bugs.
[Mail](mailto:andrea.reginato@.gmail.com) or [Tweet](http://twitter.com/andreareginato) us
for any idea that can improve the project.


## Links

* [GIT Repository](http://github.com/andreareginato/simple-oauth2)
* [Documentation](http://andreareginato.github.com/simple-oauth2)


## Authors

[Andrea Reginato](http://twitter.com/andreareginato)


## Contributors

Special thanks to the following people for submitting patches.


## Changelog

See [CHANGELOG](https://github.com/andreareginato/simple-oauth2/blob/master/CHANGELOG.md)


## Copyright

Copyright (c) 2013 [Lelylan](http://lelylan.com).
See [LICENSE](https://github.com/andreareginato/simple-oauth2/blob/master/LICENSE.md) for details.