'use strict';

const path = require('path');
const qs = require('querystring');
const nock = require('nock');
const expect = require('chai').expect;
const oauth2Module = require('./../index.js');

const oauth2 = oauth2Module
  .create(require('./fixtures/oauth-options'));

const tokenParams = {
  username: 'alice',
  password: 'secret',
};

const oauthParams = {
  username: 'alice',
  password: 'secret',
  grant_type: 'password',
  client_id: 'client-id',
  client_secret: 'client-secret',
};

describe('oauth2.password', function () {
  describe('#getToken', function () {
    let request;
    let result;
    let resultPromise;
    let error;
    let errorPromise;

    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthParams))
        .times(2)
        .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
    });

    beforeEach(function (done) {
      oauth2.ownerPassword.getToken(tokenParams, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.ownerPassword.getToken(tokenParams)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns an access token as result of the token request', function () {
      expect(result).to.have.property('access_token');
      expect(resultPromise).to.be.property('access_token');
    });
  });
});
