# API

Node.js client library for [OAuth2](http://oauth.net/2/). OAuth2 allows users to grant access to restricted resources by third party applications, giving them the possibility to enable and disable those accesses whenever they want.

## .create(options) => Module

Simple OAuth2 accepts an object with the following params.

* `client` - required object with the following properties:
  * `id` - Service registered client id. When required by the [spec](https://tools.ietf.org/html/rfc6749#appendix-B) this value will be automatically encoded. Required
  * `secret` - Service registered client secret. When required by the [spec](https://tools.ietf.org/html/rfc6749#appendix-B) this value will be automatically encoded. Required
  * `idParamName` - Parameter name used to send the client id. Default to **client_id**
  * `secretParamName` - Parameter name used to send the client secret. Default to **client_secret**

* `auth` - required object with the following properties:
  * `tokenHost` - URL used to obtain access tokens. Required
  * `tokenPath` - URL path to obtain access tokens. Default to **/oauth/token**
  * `revokePath` - URL path to revoke access tokens. Default to **/oauth/revoke**
  * `authorizeHost` - URL used to request an *authorization code*. Default to the value set on `auth.tokenHost`
  * `authorizePath` - URL path to request an *authorization code*. Default to **/oauth/authorize**

* `http` optional object used to set default options to the internal http library ([wreck](https://github.com/hapijs/wreck)). All options except **baseUrl** are allowed
  * `json`: JSON response parsing mode. Defaults to **strict**
  * `redirects` Number or redirects to follow. Defaults to **20**
  * `headers` Http headers
    * `accept` Acceptable http response content type. Defaults to **application/json**
    * `authorization` Always overriden by the library to properly send the required credentials on each scenario

* `options` additional options to setup how the module perform requests
  * `scopeSeparator` Scope separator character. Some providers may require a different separator. Defaults to **empty space**.
  * `bodyFormat` - Request's body data format. Valid options are `form` or `json`. Defaults to **form**
  * `authorizationMethod` - Method used to send the *client.id*/*client.secret* authorization params at the token request. Valid options are `header` or `body`. If set to **body**, the **bodyFormat** option will be used to format the credentials. Defaults to **header**

## Module
### .authorizationCode
This submodule provides supports for the OAuth2 [Authorization Code Grant](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.1) to support applications asking for user's resources without handling the user credentials.

#### .authorizeURL([authorizeOptions]) => String
Creates the authorization URL from the *client configuration* and the *authorize options*. The following are supported authorize options:

* `redirectURI` String representing the registered application URI where the user is redirected after authentication
* `scope` String or array of strings representing the application privileges
* `state` String representing an opaque value used by the client to main the state between the request and the callback

Additional options will be automatically serialized as query params in the resulting URL.

#### .getToken(params, [httpOptions]) => Promise<token>
Get a new access token using the current grant type.

* `params`
  * `code` Authorization code received by the callback URL
  * `redirectURI` Application callback URL
  * `[scope]` Optional string or array including a subset of the original client scopes to request

Additional options will be automatically serialized as params for the token request.

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

### .ownerPassword
This submodule provides support for the OAuth2 [Password Owner](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.3) to support applications handling the user credentials.

#### .getToken(params, [httpOptions]) => Promise<token>
Get a new access token using the current grant type.

* `params`
  * `username` User identifier
  * `password` User password
  * `[scope]` Optional string or array including a subset of the original client scopes to request

Additional options will be automatically serialized as params for the token request.

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

### .clientCredentials
This submodule provides support for the OAuth2 [Client Credentials](http://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.4) to support clients that can request access tokens using only its client credentials.

#### .getToken(params, [httpOptions]) => Promise<token>
Get a new access token using the current grant type.

* `params`
  * `[scope]` Optional string or array including a subset of the original client scopes to request

Additional options will be automatically serialized as params for the token request.

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

### .accessToken
This submodule allows for the token level operations.

#### .create(token) => AccessToken
An access token (plain object) can be used to create a new token object with the following methods

### AccessToken
#### .expired(expirationWindowSeconds) => Boolean
Determines if the current access token is definitely expired or not

* `expirationWindowSeconds` Window of time before the actual expiration to refresh the token

#### .refresh(params) => Promise<ResponsePayload>
Refreshes the current access token. The following params are allowed:

* `params`
  * `[scope]` Optional string or array including a subset of the original token scopes to request

Additional options will be automatically serialized as query params for the token request.

#### .revoke(tokenType) => Promise
Revokes either the access or refresh token depending on the {tokenType} value. Token type can be one of: `access_token` or `refresh_token`.

#### .revokeAll() => Promise
Revokes both the current access and refresh tokens
