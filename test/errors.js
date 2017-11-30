'use strict';

const qs = require('querystring');
const nock = require('nock');
const chai = require('chai');
const oauth2Module = require('./../index.js');

const expect = chai.expect;
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
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(401);

      requestContent = nock('https://authorization-server.org:443', options)
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
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(500);

      requestContent = nock('https://authorization-server.org:443', options)
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
