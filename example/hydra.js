"use strict";

const createApplication = require("./");
const { AuthorizationCode } = require("simple-oauth2");

createApplication(({ app, callbackUrl }) => {
  console.log("callback", callbackUrl);
  const client = new AuthorizationCode({
    client: {
      id: "oauth-test2",
      secret: "secret",
    },
    auth: {
      tokenHost: "https://quran-hydra.fly.dev",
      tokenPath: "/oauth2/token",
      authorizePath: "/oauth2/auth",
    },
  });

  // Authorization uri definition
  const authorizationUri = client.authorizeURL({
    redirect_uri: callbackUrl,
    scope: "openid offline",
    state: "veimvfgqexjicockrwsgcb333o3a",
  });

  // Initial page redirecting to Github
  app.get("/auth", (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get("/callback", async (req, res) => {
    const { code } = req.query;
    console.log(code, "this is the code");
    const options = {
      code,
      redirect_uri: callbackUrl,
    };

    try {
      const data = await client.getToken(options);
      console.log(data);

      console.log("The resulting token: ", data.token);

      return res.status(200).json(data.token);
    } catch (error) {
      console.error("Access Token Error", error);
      return res.status(500).json("Authentication failed");
    }
  });

  app.get("/", (req, res) => {
    res.send('Hello<br><a href="/auth">Continue with Quran.com</a>');
  });
});
