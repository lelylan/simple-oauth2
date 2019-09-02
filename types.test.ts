import simpleOauth2 = require("../simple-oauth2");

/* -----------
|   Options  |
------------*/

// Set the configuration settings
const credentials = {
  client: {
    id: "<client-id>",
    secret: "<client-secret>"
  },
  auth: {
    tokenHost: "https://api.oauth.com"
  }
};

// Initialize the OAuth2 Library
simpleOauth2.create(credentials);

/*----------------------------
|  Authorization Code flow   |
----------------------------*/

async () => {
  const oauth2 = simpleOauth2.create(credentials);

  // Authorization oauth2 URI
  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: "http://localhost:3000/callback",
    scope: "<scope>", // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    state: "<state>"
  });

  // Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
  console.log(authorizationUri);

  // Get the access token object (the authorization code is given from the previous step).
  const tokenConfig = {
    code: "<code>",
    redirect_uri: "http://localhost:3000/callback",
    scope: "<scope>" // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
  };

  // Save the access token
  try {
    const result = await oauth2.authorizationCode.getToken(tokenConfig);
    const accessToken = oauth2.accessToken.create(result);
  } catch (error) {
    console.log("Access Token Error", error.message);
  }
};

/*---------------------------
| Password Credentials Flow |
---------------------------*/

async () => {
  const oauth2 = simpleOauth2.create(credentials);

  // Get the access token object.
  const tokenConfig = {
    username: "username",
    password: "password",
    scope: "<scope>" // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
  };

  // Save the access token
  try {
    const result = await oauth2.ownerPassword.getToken(tokenConfig);
    const accessToken = oauth2.accessToken.create(result);
  } catch (error) {
    console.log("Access Token Error", error.message);
  }
};

/*-------------------------
| Client Credentials Flow |
-------------------------*/

() => {
  const oauth2 = simpleOauth2.create(credentials);
  const tokenConfig = {
    scope: "<scope>" // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
  };

  async () => {
    // Get the access token object for the client
    try {
      const result = await oauth2.clientCredentials.getToken(tokenConfig);
      const accessToken = oauth2.accessToken.create(result);
    } catch (error) {
      console.log("Access Token error", error.message);
    }
  };
};

/*---------
| Helpers |
---------*/

const oauth2 = simpleOauth2.create(credentials);
const tokenObject = {
  access_token: "<access-token>",
  refresh_token: "<refresh-token>",
  expires_in: "7200"
};
let accessToken = oauth2.accessToken.create(tokenObject);

async () => {
  // Check if the token is expired. If expired it is refreshed.
  if (accessToken.expired()) {
    try {
      accessToken = await accessToken.refresh();
    } catch (error) {
      console.log("Error refreshing access token: ", error.message);
    }
  }
};

async () => {
  // Provide a window of time before the actual expiration to refresh the token
  const EXPIRATION_WINDOW_IN_SECONDS = 300;

  const { token } = accessToken;
  const expirationTimeInSeconds = token.expires_at.getTime() / 1000;
  const expirationWindowStart = expirationTimeInSeconds - EXPIRATION_WINDOW_IN_SECONDS;

  // If the start of the window has passed, refresh the token
  const nowInSeconds = new Date().getTime() / 1000;
  const shouldRefresh = nowInSeconds >= expirationWindowStart;
  if (shouldRefresh) {
    try {
      accessToken = await accessToken.refresh();
    } catch (error) {
      console.log("Error refreshing access token: ", error.message);
    }
  }
};

async () => {
  // Revoke both access and refresh tokens
  try {
    // Revoke only the access token
    await accessToken.revoke("access_token");

    // Session ended. But the refresh_token is still valid.
    // Revoke the refresh token
    await accessToken.revoke("refresh_token");
  } catch (error) {
    console.log("Error revoking token: ", error.message);
  }
};

async () => {
  // Revoke both access and refresh tokens
  try {
    // Revokes both tokens, refresh token is only revoked if the access_token is properly revoked
    await accessToken.revokeAll();
  } catch (error) {
    console.log("Error revoking token: ", error.message);
  }
};

/*--------
| Errors |
--------*/

async () => {
  try {
    await oauth2.authorizationCode.getToken(undefined as any);
  } catch (error) {
    console.log(error);
  }
  // => {
  //     "statusCode": 401,
  //     "error": "Unauthorized",
  //     "message": "invalid password"
  // }
};
