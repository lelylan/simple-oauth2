# Changelog

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
