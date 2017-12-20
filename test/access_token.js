'use strict';

const qs = require('querystring');
const nock = require('nock');
const { expect } = require('chai');
const startOfYesterday = require('date-fns/start_of_yesterday');
const oauth2Module = require('./../index.js');
const isValid = require('date-fns/is_valid');
const isEqual = require('date-fns/is_equal');
const expectedAccessToken = require('./fixtures/access_token');

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
  let token;

  beforeEach(() => {
    const options = {
      reqheaders: {
        Accept: 'application/json',
        Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
      },
    };

    request = nock('https://authorization-server.org:443', options)
      .post('/oauth/token', qs.stringify(authorizationCodeParams))
      .reply(200, expectedAccessToken);
  });

  beforeEach(async () => {
    result = await oauth2.authorizationCode.getToken(tokenParams);
    token = oauth2.accessToken.create(result);
  });

  describe('#create', () => {
    it('creates an access token wrapper object', () => {
      expect(token).to.have.property('token');
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
    });
  });

  describe('when expired', () => {
    beforeEach(() => {
      token.token.expires_at = startOfYesterday();
    });

    it('returns false', () => {
      expect(token.expired()).to.be.equal(true);
    });
  });

  describe('when refreshes token', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(refreshConfig))
        .reply(200, expectedAccessToken);
    });

    beforeEach(async () => {
      result = await token.refresh();
    });

    it('makes the HTTP request', () => {
      request.done();
    });

    it('returns a new oauth2.accessToken as a result of the token refresh', () => {
      expect(result.token).to.have.property('access_token');
    });
  });

  describe('when refreshes token with additional params', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(refreshWithAdditionalParamsConfig))
        .reply(200, expectedAccessToken);
    });

    beforeEach(async () => {
      result = await token.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' });
    });

    it('makes the HTTP request', () => {
      request.done();
    });

    it('returns a new oauth2.accessToken as a result of the token refresh', () => {
      expect(result.token).to.have.property('access_token');
    });
  });

  describe('#revoke', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/revoke', qs.stringify(revokeConfig))
        .reply(200);
    });

    beforeEach(() => {
      return token.revoke('refresh_token');
    });

    it('make HTTP call', () => {
      request.done();
    });
  });
});
