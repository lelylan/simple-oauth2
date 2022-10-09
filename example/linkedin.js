"use strict";

const createApplication = require(".");
const { AuthorizationCode } = require("..");

createApplication(({ app, callbackUrl }) => {
  const secret =  process.env.CLIENT_SECRET;

  const client = new AuthorizationCode({
    client: {
      id: process.env.CLIENT_ID,
      secret,
    },
    options: {
      authorizationMethod: 'body',
    },
    auth: {
      authorizeHost: "https://www.linkedin.com",
      authorizePath: "/oauth/v2/authorization",
      tokenHost: "https://www.linkedin.com",
      tokenPath: "/oauth/v2/accessToken",
    },
  });

  // Authorization uri definition
  const authorizationUri = client.authorizeURL({
    redirect_uri: callbackUrl,
    scope: ["r_liteprofile", "r_emailaddress"],
    state: "random123",
  });

  // Initial page redirecting to Github
  app.get("/oauth/linkedin", (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get("/oauth/linkedin/callback", async (req, res) => {
    const { code } = req.query;
    const options = {
      code,
      redirect_uri: callbackUrl,
      scope: "r_liteprofile, r_emailaddress"
    };

    try {
      const accessToken = await client.getToken(options);

      console.log("The resulting token: ", accessToken.token);

      return res.status(200).json(accessToken.token);
    } catch (error) {
      console.error("Access Token Error", error.message);
      return res.status(500).json("Authentication failed");
    }
  });

  app.get("/", (req, res) => {
    res.send('Hello<br><a href="/oauth/linkedin">Log in with LinkedIn</a>');
  });
});
