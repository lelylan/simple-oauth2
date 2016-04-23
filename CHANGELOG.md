# Changelog

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
