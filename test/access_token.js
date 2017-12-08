'use strict';

const qs = require('querystring');
const nock = require('nock');
const path = require('path');
const chai = require('chai');
const startOfYesterday = require('date-fns/start_of_yesterday');
const oauth2Module = require('./../index.js');
const isValid = require('date-fns/is_valid');
const isEqual = require('date-fns/is_equal');

const expect = chai.expect;
const oauth2 = oauth2Module.create(require('./fixtures/module-config'));

const tokenParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
};

const refreshConfig = require('./fixtures/refresh-token.json');
const refreshWithAdditionalParamsConfig = require('./fixtures/refresh-token-with-params.json');
const authorizationCodeParams = require('./fixtures/auth-code-params.json');
const revokeConfig = require('./fixtures/revoke-token-params.json');

describe('access token request', () => {
  let request;
  let result;
  let resultPromise;
  let token;
  let tokenPromise;

  beforeEach(() => {
    const options = {
      reqheaders: {
        Accept: 'application/json',
        Authorization: 'Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=',
      },
    };

    request = nock('https://authorization-server.org:443', options)
      .post('/oauth/token', qs.stringify(authorizationCodeParams))
      .times(2)
      .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
  });

  beforeEach((done) => {
    oauth2.authorizationCode.getToken(tokenParams, (e, r) => {
      result = r; done(e);
    });
  });

  beforeEach(() => {
    return oauth2.authorizationCode
      .getToken(tokenParams)
      .then((r) => { resultPromise = r; });
  });

  beforeEach(() => {
    token = oauth2.accessToken.create(result);
    tokenPromise = oauth2.accessToken.create(resultPromise);
  });

  describe('#create', () => {
    it('creates an access token wrapper object', () => {
      expect(token).to.have.property('token');
      expect(tokenPromise).to.have.property('token');
    });
  });

  describe('#create with expires_at', () => {
    it('uses the set expires_at property', () => {
      token.token.expires_at = startOfYesterday();
      const expiredToken = oauth2.accessToken.create(token.token);

      expect(isValid(expiredToken.token.expires_at)).to.be.equal(true);
      expect(isEqual(expiredToken.token.expires_at, token.token.expires_at)).to.be.equal(true);
    });

    it('parses a set expires_at property', () => {
      const yesterday = startOfYesterday();
      token.token.expires_at = yesterday.toString();
      const expiredToken = oauth2.accessToken.create(token.token);

      expect(isValid(expiredToken.token.expires_at)).to.be.equal(true);
      expect(isEqual(expiredToken.token.expires_at, token.token.expires_at)).to.be.equal(true);
    });

    it('create its own date by default', () => {
      expect(isValid(token.token.expires_at)).to.be.equal(true);
    });
  });

  describe('when not expired', () => {
    it('returns false', () => {
      expect(token.expired()).to.be.equal(false);
      expect(tokenPromise.expired()).to.be.equal(false);
    });
  });

  describe('when expired', () => {
    beforeEach(() => {
      token.token.expires_at = startOfYesterday();
      tokenPromise.token.expires_at = startOfYesterday();
    });

    it('returns false', () => {
      expect(token.expired()).to.be.equal(true);
      expect(tokenPromise.expired()).to.be.equal(true);
    });
  });

  describe('when refreshes token', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(refreshConfig))
        .times(2)
        .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
    });

    beforeEach((done) => {
      result = null;
      token.refresh((e, r) => {
        result = r; done(e);
      });
    });

    beforeEach(() => {
      resultPromise = null;

      return token.refresh()
        .then((r) => { resultPromise = r; });
    });

    it('makes the HTTP request', () => {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns a new oauth2.accessToken as a result of the token refresh', () => {
      expect(result).to.not.be.equal(global);
      expect(result.token).to.have.property('access_token');
      expect(resultPromise).to.not.be.equal(global);
      expect(resultPromise.token).to.have.property('access_token');
    });
  });

  describe('when refreshes token with additional params', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(refreshWithAdditionalParamsConfig))
        .times(2)
        .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
    });

    beforeEach((done) => {
      result = null;
      token.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' }, (e, r) => {
        result = r; done(e);
      });
    });

    beforeEach(() => {
      resultPromise = null;

      return token.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' })
        .then((r) => { resultPromise = r; });
    });

    it('makes the HTTP request', () => {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns a new oauth2.accessToken as result of callback api', () => {
      expect(result.token).to.have.property('access_token');
    });

    it('returns a new oauth2.accessToken as a result of the token refresh', () => {
      expect(result.token).to.have.property('access_token');
      expect(resultPromise.token).to.have.property('access_token');
    });
  });

  describe('#revoke', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/revoke', qs.stringify(revokeConfig))
        .times(2)
        .reply(200);
    });

    beforeEach((done) => {
      result = null;
      token.revoke('refresh_token', (e) => {
        done(e);
      });
    });

    beforeEach(() => {
      resultPromise = null;

      return tokenPromise.revoke('refresh_token')
        .then((r) => { resultPromise = r; });
    });

    it('make HTTP call', () => {
      expect(request.isDone()).to.be.equal(true);
    });
  });
});
