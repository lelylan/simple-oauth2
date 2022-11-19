"use strict";

const app = require("express")();

const port = 3000;

module.exports = (cb) => {
  const callbackUrl = "https://quran-oauth2-example.fly.dev/callback";

  app.listen(port, (err) => {
    if (err) return console.error(err);

    console.log(`Express server listening at http://localhost:${port}`);

    return cb({
      app,
      callbackUrl,
    });
  });
};
