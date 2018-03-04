# Changelog

## v2.0.1

* Add support to revoke accessToken and refreshToken in a single call with `revokeAll`

## v2.0.0

* Replace internal request library to wreck
* Replace bluebird with native promise implementation
* Replace callback interface with async/await
* Improve integration tests coverage

## v1.5.1

* Add support to specify scopes as array in `getToken` method
* Add support to empty strings and visual ASCII characters on `clientId`/`clientSecret` options

## v1.5.0

* Update debug dependency
* Add support to encode the authorization headers

## v1.4.0

* Update dependencies
* Add Node 8 to test matrix

## v1.3.0

* Add support for custom idParamName in authCode.authorizeURL() method

## v1.2.0

* Upgrade dependencies, to avoid using outdated/vulnerable versions

## v1.1.0

* Add support to body encoding format in library requests

## v1.0.3

* Add missing documentation for module options

## v1.0.2

* Parse token payload response `expires_in` property as integer

## v1.0.1

* Fixed documentation for **client** option.

## v1.0.0

* Refactored test to use fixtures.
* Update code to comply with more linter rules.
* Fixed examples in README to return on error.
* Added a working example example.
* Clone params and configuration passed
* Changed public api to, to make it consistent. Changed shortcut names to full names.
* Changed public api to allow different sites for /authorize and /tokens
* Added strict schema validation to module options.
* Does not override expires_at property if passed into accessToken.create.

## v0.8.0 (1 August 2016)

* Upgraded code to strict mode.
* Upgraded all the code base to es6.
* Updated linter settings to meet the new es6 code requirements.
* Fixed shared value for access token, causing tokens to be overriding.

## v0.7.0 (22 April 2016)

* Replaced internal logger by the debug module logger.
* Fixed some project metadata.

## v0.6.0 (04 April 2016)

* Added optional sending support to the body auth params.
* Updated license information.
* Updated main dependencies version.
* Fixed leaked token when a refresh token was used.

## v0.5.1 (25 January 2016)

* Fixed error class prototype inheritance. Now inherits correctly from Error.

## v0.5.0 (22 January 2016)

* Now all error states returned from the server, are rejected as HTTPError instances. (This allow to know what httpStatusCode was returned)

## v0.4.0 (18 January 2016)

* Updated project dependencies.
* Added support for passing arguments to the refresh token action.
* Added project badges.
* Code general cleanup and applied code styleguide.
* Created CONTRIBUTING guides! (Separated from README)
* Fixed bug, which resolved promises even if the token wasn´t retrieved. #64

## v0.3.0 (29 November 2015)

* Better documentation!
* Added support for promise based API

## v0.2.1 (17 October 2014)

* Adds revocation token method
* Not using headers if access_token is defined as a part of the URL.
* Changes from Pascal Case to Camel Case in the API.
* Adds Bearer Header for requests.

## v0.1.7 (16 May 2013)

* Now compatible with Github

## v0.1.6 (24 Jan 2013)

* Updated name convention on using simple oauth2 configuration block.

## v0.1.5 (24 Jan 2013)

* Token expiration is now dinamically defined through the expires_in
  field returned with the access token from the OAuth2 server

## v0.1.4 (22 Jan 2013)

* Fixed missing Basic Auth that somehow is not created from the request library

## v0.1.3 (22 Jan 2013)

* Fixed bug on AccessToken#expired() as it had the inverse logic
* AccessToken#refresh() now returns an AccessToken object

## v0.1.2 (22 Jan 2013)

* Updated documentation

## v0.1.1 (21 Jan 2013)

* Added Password credentials flow

## v0.1.0 (21 Jan 2013)

* First version Node client for OAuth2
