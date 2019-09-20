'use strict';

const createApplication = require('./');
const simpleOauthModule = require('./../');

createApplication(({ app, callbackUrl }) => {
  const oauth2 = simpleOauthModule.create({
    client: {
      id: process.env.CLIENT_ID,
      secret: process.env.CLIENT_SECRET,
    },
    auth: {
      tokenHost: 'https://api.dropbox.com',
      authorizeHost: 'https://dropbox.com',
      tokenPath: '/oauth2/token',
      authorizePath: '/oauth2/authorize'
    },
    options: {
      authorizationMethod: 'body',
    },
  });

  // Authorization uri definition
  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: 'http://localhost:3000/callback',
    state: '3(#0/!~',
  });

  // Initial page redirecting to Github
  app.get('/auth', (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const options = {
      code,
      redirect_uri: 'http://localhost:3000/callback',
    };

    try {
      const result = await oauth2.authorizationCode.getToken(options);

      console.log('The resulting token: ', result);

      const token = oauth2.accessToken.create(result);

      return res.status(200).json(token)
    } catch(error) {
      console.error('Access Token Error', error.message);
      return res.status(500).json('Authentication failed');
    }
  });

  app.get('/', (req, res) => {
    res.send('Hello<br><a href="/auth">Log in with Dropbox</a>');
  });
});
