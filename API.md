# API

Node.js client library for [OAuth2](http://oauth.net/2/). OAuth2 allows users to grant access to restricted resources by third party applications, giving them the possibility to enable and disable those accesses whenever they want.

## Options

Simple OAuth2 grant classes accept an object with the following params.

* `client` - required object with the following properties:
  * `id` - Service registered client id. When required by the [spec](https://tools.ietf.org/html/rfc6749#appendix-B) this value will be automatically encoded. Required
  * `secret` - Service registered client secret. When required by the [spec](https://tools.ietf.org/html/rfc6749#appendix-B) this value will be automatically encoded. Required
  * `idParamName` - Parameter name used to send the client id. Defaults to **client_id**
  * `secretParamName` - Parameter name used to send the client secret. Defaults to **client_secret**

* `auth` - required object with the following properties:
  * `tokenHost` - Base URL used to obtain access tokens. Required
  * `tokenPath` - URL path to obtain access tokens (See [url resolution notes](#url-resolution)). Defaults to **/oauth/token**
  * `revokePath` - URL path to revoke access tokens (See [url resolution notes](#url-resolution)). Defaults to **/oauth/revoke**
  * `authorizeHost` - Base URL used to request an *authorization code*. Defaults to `auth.tokenHost` value
  * `authorizePath` - URL path to request an *authorization code* (See [url resolution notes](#url-resolution)). Defaults to **/oauth/authorize**

* `http` optional object used to set default options to the internal http library ([wreck](https://github.com/hapijs/wreck)). All options except **baseUrl** are allowed
  * `json`: JSON response parsing mode. Defaults to **strict**
  * `redirects` Number or redirects to follow. Defaults to **20**
  * `headers` Http headers
    * `accept` Acceptable http response content type. Defaults to **application/json**
    * `authorization` Always overriden by the library to properly send the required credentials on each scenario

* `options` additional options to setup how the module perform requests
  * `scopeSeparator` Scope separator character. Some providers may require a different separator. Defaults to **empty space**
  * `credentialsEncodingMode` Setup how credentials are encoded when `options.authorizationMode` is **header**. Use **loose** if your provider doesn't conform the [OAuth2 specification](https://tools.ietf.org/html/rfc6749#section-2.3.1). Defaults to **strict**
  * `bodyFormat` - Request's body data format. Valid options are `form` or `json`. Defaults to **form**
  * `authorizationMethod` - Method used to send the *client.id*/*client.secret* authorization params at the token request. Valid options are `header` or `body`. If set to **body**, the **bodyFormat** option will be used to format the credentials. Defaults to **header**

### URL resolution
URL paths are relatively resolved to their corresponding host property using the [Node WHATWG URL](https://nodejs.org/dist/latest-v12.x/docs/api/url.html#url_constructor_new_url_input_base) resolution algorithm.

## Grant Types
### new AuthorizationCode(options)
This submodule provides support for the OAuth2 [Authorization Code](https://oauth.net/2/grant-types/authorization-code/) grant type.

#### .authorizeURL([authorizeOptions]) => String
Creates the authorization URL from the *client configuration* and the *authorize options*. The following are supported authorize options:

* `redirectURI` String representing the registered application URI where the user is redirected after authentication
* `scope` String or array of strings representing the application privileges
* `state` String representing an opaque value used by the client to main the state between the request and the callback

Additional options will be automatically serialized as query params in the resulting URL.

#### await .getToken(params, [httpOptions]) => AccessToken
Get a new access token using the current grant type.

* `params`
  * `code` Authorization code received by the callback URL
  * `redirectURI` Application callback URL
  * `[scope]` Optional string or array including a subset of the original client scopes to request

Additional options will be automatically serialized as params for the token request.

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

#### .createToken(token) => AccessToken
Creates a new access token by providing a token object as specified by [RFC6750](https://tools.ietf.org/html/rfc6750#section-4).

### new ResourceOwnerPassword(options)
This submodule provides support for the OAuth2 [Resource Owner Password Credentials](https://oauth.net/2/grant-types/password/) grant type.

#### await .getToken(params, [httpOptions]) => AccessToken
Get a new access token using the current grant type.

* `params`
  * `username` User identifier
  * `password` User password
  * `[scope]` Optional string or array including a subset of the original client scopes to request

Additional options will be automatically serialized as params for the token request.

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

#### .createToken(token) => AccessToken
Creates a new access token by providing a token object as specified by [RFC6750](https://tools.ietf.org/html/rfc6750#section-4).

### new ClientCredentials(options)
This submodule provides support for the OAuth2 [Client Credentials](https://oauth.net/2/grant-types/client-credentials/) grant type.

#### await .getToken(params, [httpOptions]) => AccessToken
Get a new access token using the current grant type.

* `params`
  * `[scope]` Optional string or array including a subset of the original client scopes to request

Additional options will be automatically serialized as params for the token request.

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

#### .createToken(token) => AccessToken
Creates a new access token by providing a token object as specified by [RFC6750](https://tools.ietf.org/html/rfc6750#section-4).

### AccessToken
#### .expired([expirationWindowSeconds]) => Boolean
Determines if the current access token is definitely expired or not

* `expirationWindowSeconds` Window of time before the actual expiration to refresh the token. Defaults to **0**.

#### await .refresh(params, [httpOptions]) => AccessToken
Refreshes the current access token. The following params are allowed:

* `params`
  * `[scope]` Optional string or array including a subset of the original token scopes to request
* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

Additional options will be automatically serialized as query params for the token request.

#### await .revoke(tokenType, [httpOptions])
Revokes either the access or refresh token depending on the {tokenType} value. Token type can be one of: `access_token` or `refresh_token`.

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

#### await .revokeAll([httpOptions])
Revokes both the current access and refresh tokens

* `httpOptions` All [wreck](https://github.com/hapijs/wreck) options can be overriden as documented by the module `http` options.

#### .token
Immutable object containing the token object provided while constructing a new access token instance. This property will usually have the schema as specified by [RFC6750](https://tools.ietf.org/html/rfc6750#section-4), but the exact properties may vary between authorization servers.

Please also note, that the current implementation will always add an **expires_at** property regardless of the authorization server response, as we require it to to provide the refresh token functionality.
