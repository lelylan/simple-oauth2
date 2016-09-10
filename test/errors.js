'use strict';

const qs = require('querystring');
const nock = require('nock');
const expect = require('chai').expect;
const oauth2Module = require('./../index.js');

const oauth2 = oauth2Module
  .create(require('./fixtures/oauth-options.json'));

const tokenParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
};
const oauthParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
  grant_type: 'authorization_code',
  client_id: 'client-id',
  client_secret: 'client-secret',
};

describe('Simple oauth2 Error', function () {
  let request;
  let requestContent;
  let result;
  let resultPromise;
  let error;
  let errorPromise;

  describe('with status code 401', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(401);

      requestContent = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(401, {
          content: 'No authorized',
        });
    });

    beforeEach(function (done) {
      oauth2.authorizationCode.getToken(tokenParams, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.authorizationCode
        .getToken(tokenParams)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      expect(request.isDone()).to.be.equal(true);
      expect(requestContent.isDone()).to.be.equal(true);
    });

    it('returns an error object with the httpStatusCode and message as a result of the token request', function () { // eslint-disable-line
      expect(error.message).to.be.equal('Unauthorized');
      expect(error.status).to.be.equal(401);
      expect(error.context).to.be.equal(null);

      expect(errorPromise.message).to.be.equal('Unauthorized');
      expect(errorPromise.status).to.be.equal(401);
      expect(errorPromise.context).to.be.deep.equal({
        content: 'No authorized',
      });
    });
  });

  describe('with status code 500', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(500);

      requestContent = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(500, {
          description: 'Error details.',
        });
    });

    beforeEach(function (done) {
      oauth2.authorizationCode.getToken(tokenParams, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.authorizationCode
        .getToken(tokenParams)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      expect(request.isDone()).to.be.equal(true);
      expect(requestContent.isDone()).to.be.equal(true);
    });

    it('returns an error object with the httpStatusCode and message as a result of the token request', function () { // eslint-disable-line
      expect(error.message).to.be.equal('Internal Server Error');
      expect(error.status).to.be.equal(500);
      expect(error.context).to.be.equal(null);

      expect(errorPromise.message).to.be.equal('Internal Server Error');
      expect(errorPromise.status).to.be.equal(500);
      expect(errorPromise.context).to.be.deep.equal({
        description: 'Error details.',
      });
    });
  });
});
