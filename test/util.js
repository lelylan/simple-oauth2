'use strict';

const nock = require('nock');
const expectedAccessToken = require('./fixtures/access_token');

function stubTokenRequest({ headers, requestBody }) {
  const scopeOptions = { reqheaders: headers };

  return nock('https://authorization-server.org:443', scopeOptions)
    .post('/oauth/token', requestBody)
    .reply(200, expectedAccessToken);
}


module.exports = {
  stubTokenRequest,
};
