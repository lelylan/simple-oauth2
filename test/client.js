'use strict';

const path = require('path');
const qs = require('querystring');
const nock = require('nock');
const expect = require('chai').expect;
const oauth2Module = require('./../index.js');

const tokenParams = {};
const oauth2 = oauth2Module
  .create(require('./fixtures/oauth-options'));

describe('oauth2.Client', function () {
  describe('#getToken', function () {
    let request;
    let result;
    let resultPromise;
    let error;
    let errorPromise;

    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify({
          grant_type: 'client_credentials',
          client_id: 'client-id',
          client_secret: 'client-secret',
        }))
        .times(2)
        .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
    });

    beforeEach(function (done) {
      oauth2.clientCredentials.getToken(tokenParams, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.clientCredentials
        .getToken(tokenParams)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns an access token as result of the token request', function () {
      expect(result).to.have.property('access_token');
      expect(resultPromise).to.have.property('access_token');
    });
  });
});
