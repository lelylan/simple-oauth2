# Simple OAuth2

Node.js client library for [Oauth2](http://oauth.net/2/).
Currently it supports Authorization Code and Resource Owner Password Credentials grant types.


## Requirements

Node client library is tested against Node ~0.8.x


## Installation

Install the client library using [npm](http://npmjs.org/):

    $ npm install simple-oath2

Install the client library using git:

    $ git clone git://github.com/andrearegianto/simple-oauth2.git
    $ cd simple-oauth2
    $ npm install


## Getting started

```javascript
// Set the client credentials
var credentials = { client: {
  id: '<client-id>',
  secret: '<client-secret>',
  site: 'https://auth.service.com'
}};

// Initialize the OAuth2 Library
var OAuth2 = require('simple-oauth2')(credentials);

// Authorization OAuth2 URI
var authorization_uri = OAuth2.AuthCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback'
});

// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
res.redirect(authorization_uri);

// Get the access token object (authorization code is given from previous step)
var token;
OAuth2.AuthCode.getToken({
  code: code,
  redirect_uri: 'http://localhost:3000/callback'
}, function(error, result) { token = result });

// Create the access token wrapper
var token = OAuth2.AccessToken.create(json_token);
```

## Documentation

Check out the complete [Simple OAuth2 website](http://andreareginato.github.com/simple-oauth2)


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

See [CHANGELOG](simple-oauth2/blob/master/CHANGELOG.md)


## Copyright

Copyright (c) 2013 [Lelylan](http://lelylan.com). See [LICENSE](simple-oauth2/blob/master/LICENSE.md) for details.
