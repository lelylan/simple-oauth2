'use strict';

const qs = require('querystring');
const nock = require('nock');
const path = require('path');
const expect = require('chai').expect;
const startOfYesterday = require('date-fns/start_of_yesterday');
const oauth2Module = require('./../index.js');
const isValid = require('date-fns/is_valid');
const isEqual = require('date-fns/is_equal');

const oauth2 = oauth2Module
  .create(require('./fixtures/oauth-options'));

const tokenParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
};

const refreshConfig = require('./fixtures/refresh-token.json');
const refreshWithAdditionalParamsConfig = require('./fixtures/refresh-token-with-params.json');
const oauthConfig = require('./fixtures/oauth-options-code.json');
const revokeConfig = require('./fixtures/revoke-token-params.json');

describe('oauth2.accessToken', function () {
  let request;
  let result;
  let resultPromise;
  let token;
  let tokenPromise;
  let error;
  let errorPromise;

  beforeEach(function () {
    request = nock('https://example.org:443')
      .post('/oauth/token', qs.stringify(oauthConfig))
      .times(2)
      .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
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

  beforeEach(function () {
    token = oauth2.accessToken.create(result);
    tokenPromise = oauth2.accessToken.create(resultPromise);
  });

  describe('#create', function () {
    it('creates an access token wrapper object', function () {
      expect(token).to.have.property('token');
      expect(tokenPromise).to.have.property('token');
    });
  });

  describe('#create with expires_at', function () {
    it('uses the set expires_at property', function () {
      token.token.expires_at = startOfYesterday();
      const expiredToken = oauth2.accessToken.create(token.token);
      expect(isValid(expiredToken.token.expires_at)).to.be.equal(true);
      expect(isEqual(expiredToken.token.expires_at, token.token.expires_at))
        .to.be.equal(true);
    });

    it('parses a set expires_at property', function () {
      const yesterday = startOfYesterday();
      token.token.expires_at = yesterday.toString();
      const expiredToken = oauth2.accessToken.create(token.token);
      expect(isValid(expiredToken.token.expires_at)).to.be.equal(true);
      expect(isEqual(expiredToken.token.expires_at, token.token.expires_at))
        .to.be.equal(true);
    });

    it('create its own date by default', function () {
      expect(isValid(token.token.expires_at)).to.be.equal(true);
    });
  });

  describe('when not expired', function () {
    it('returns false', function () {
      expect(token.expired()).to.be.equal(false);
      expect(tokenPromise.expired()).to.be.equal(false);
    });
  });

  describe('when expired', function () {
    beforeEach(function () {
      token.token.expires_at = startOfYesterday();
      tokenPromise.token.expires_at = startOfYesterday();
    });

    it('returns false', function () {
      expect(token.expired()).to.be.equal(true);
      expect(tokenPromise.expired()).to.be.equal(true);
    });
  });

  describe('when refreshes token', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(refreshConfig))
        .times(2)
        .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
    });

    beforeEach(function (done) {
      result = null;
      token.refresh(function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      resultPromise = null;
      errorPromise = null;

      return token.refresh()
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns a new oauth2.accessToken as a result of the token refresh', function () {
      expect(result).to.not.be.equal(global);
      expect(result.token).to.have.property('access_token');
      expect(resultPromise).to.not.be.equal(global);
      expect(resultPromise.token).to.have.property('access_token');
    });
  });

  describe('when refreshes token with additional params', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(refreshWithAdditionalParamsConfig))
        .times(2)
        .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
    });

    beforeEach(function (done) {
      result = null;
      token.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' }, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      resultPromise = null;
      errorPromise = null;

      return token.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' })
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns a new oauth2.accessToken as result of callback api', function () {
      expect(result.token).to.have.property('access_token');
    });

    it('returns a new oauth2.accessToken as a result of the token refresh', function () {
      expect(result.token).to.have.property('access_token');
      expect(resultPromise.token).to.have.property('access_token');
    });
  });

  describe('#revoke', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/revoke', qs.stringify(revokeConfig))
        .times(2)
        .reply(200);
    });

    beforeEach(function (done) {
      result = null;
      token.revoke('refresh_token', function (e) {
        error = e; done();
      });
    });

    beforeEach(function () {
      resultPromise = null;
      errorPromise = null;

      return tokenPromise.revoke('refresh_token')
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('make HTTP call', function () {
      expect(request.isDone()).to.be.equal(true);
    });
  });
});
