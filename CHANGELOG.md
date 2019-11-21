# Changelog

## 3.1.0
### New features
* [#277](https://github.com/lelylan/simple-oauth2/pull/277) Add support to parse expire at property on access tokens as UNIX timestamps

## 3.0.1
### Publishing changes
* [#273](https://github.com/lelylan/simple-oauth2/pull/273) Deprecate unsupported library versions

## 3.0.0
### Breaking changes
* [#260](https://github.com/lelylan/simple-oauth2/pull/260) Use @hapi/wreck v15. This version changes how a **baseUrl** is resolved against a **path**, affecting how `auth.tokenHost`, `auth.tokenPath`, `auth.authorizeHost` and `auth.authorizePath` are resolved when using the `.getToken` methods. See [@hapi/wreck](https://github.com/hapijs/wreck/issues/244) breaking changes to better understand potential issues that may arise.

* [#260](https://github.com/lelylan/simple-oauth2/pull/260) Use new Node.js WHATWG URL api instead of the legacy url module. This change affects how `auth.authorizeHost` and `auth.authorizePath` are resolved when using the `authorizationCode.authorizeURL` method.

* [#256](https://github.com/lelylan/simple-oauth2/pull/256) Users can override the `grant_type` parameter when performing a token exchange throught the `.getToken` method. Useful in cases where the auth server uses a value different from the standard.

* [#256](https://github.com/lelylan/simple-oauth2/pull/256) Token exchange methods no longer mutate provided arguments
* [#255](https://github.com/lelylan/simple-oauth2/pull/255) Follow up to 20 redirects by default
* [#200](https://github.com/lelylan/simple-oauth2/pull/200) [#256](https://github.com/lelylan/simple-oauth2/pull/256) Change default multiple scope encoding from using comma to spaces on all token exchange methods
* [#88](https://github.com/lelylan/simple-oauth2/pull/88) Change JSON response parsing mode from `smart` to `strict`. Since the OAuth2 specification indicates only JSON responses are valid, any non-JSON response throws an error instead of resolving into a Buffer. Use `http.json = true` to restore the previous behavior.

### New features

* [#270](https://github.com/lelylan/simple-oauth2/pull/270) All token exchange methods now accept an optional argument to override non-essential [http options](https://github.com/hapijs/wreck/blob/master/API.md#requestmethod-uri-options) or [read parsing options](https://github.com/hapijs/wreck/blob/master/API.md#readresponse-options).

* [#268](https://github.com/lelylan/simple-oauth2/pull/268) All token exchange methods can be called without arguments
* [#263](https://github.com/lelylan/simple-oauth2/pull/263) Use @hapi/joi v16. No breaking changes are expected.

## 2.5.2

### Publishing changes

* [#262](https://github.com/lelylan/simple-oauth2/pull/262) Use files package option instead of .npmignore

### Documentation improvements

* [#267](https://github.com/lelylan/simple-oauth2/pull/267) Better document encoding of values for the token exchange process

## 2.5.1
### New examples

 * [#249](https://github.com/lelylan/simple-oauth2/pull/249) Add dropbox usage example

### Development dependencies upgradess

 * [#254](https://github.com/lelylan/simple-oauth2/pull/254) Upgrade codebase to eslint v6 and airbnb-base-eslint configuration v14
 * [#253](https://github.com/lelylan/simple-oauth2/pull/253) Upgrade nock to v11
 * [#252](https://github.com/lelylan/simple-oauth2/pull/252) Use ava instead of mocha as test runner
 * [#252](https://github.com/lelylan/simple-oauth2/pull/252) Use ava built-in assertions library instead of chai

## 2.5.0
### Dependencies upgrades

 * [#250](https://github.com/lelylan/simple-oauth2/pull/250) Upgrade date-fns library to v2

## 2.4.0
### Dependencies upgrades

 * [#235](https://github.com/lelylan/simple-oauth2/pull/235) Upgrade Joi version to v15 (@hapi/joi)

### Development dependencies updates

 * [#244](https://github.com/lelylan/simple-oauth2/pull/244) Upgrade mocha test runner to v6
 * [#244](https://github.com/lelylan/simple-oauth2/pull/244) Upgrade nyc to v14
 * [#244](https://github.com/lelylan/simple-oauth2/pull/244) Upgrade development dependencies to latest version available

## 2.3.0
### Dependencies upgrades

 * [#242](https://github.com/lelylan/simple-oauth2/pull/242) Upgrade debug dependency to v4

## 2.2.1

* Fix Joi schema missusage

## 2.2.0

* Fix access token expiration properties omission

## 2.1.0 (Not published)

* Ignore access token date properties when not available

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
