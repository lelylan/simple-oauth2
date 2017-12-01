'use strict';

const path = require('path');
const qs = require('querystring');
const nock = require('nock');
const chai = require('chai');
const oauth2Module = require('./../index');

const expect = chai.expect;
const baseConfig = require('./fixtures/module-config');

describe('authorization code grant type', () => {
  let request;
  let result;
  let resultPromise;
  let error;
  let errorPromise;

  describe('when computing an authorization url', () => {
    const authorizeConfig = {
      redirect_uri: 'http://localhost:3000/callback',
      scope: 'user',
      state: '02afe928b',
    };

    describe('with default configuration', () => {
      it('returns the authorization URI', () => {
        const oauth2 = oauth2Module.create(baseConfig);
        const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });
    });

    describe('with custom configuration', () => {
      it('uses a custom idParamName', () => {
        const oauth2Temp = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
            idParamName: 'incredible-param-name',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
          },
        });

        const authorizationURL = oauth2Temp.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&incredible-param-name=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });

      it('uses a custom authorizeHost', () => {
        const oauth2Temp = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
            authorizeHost: 'https://other-authorization-server.com',
          },
        });

        const authorizationURL = oauth2Temp.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });

      it('uses a custom authorizePath', () => {
        const oauth2Temp = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
            authorizePath: '/authorize-now',
          },
        });

        const authorizationURL = oauth2Temp.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://authorization-server.org/authorize-now?response_type=code&client_id=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });
    });
  });

  describe('when requesting an access token', () => {
    let oauth2;
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

    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=',
        },
      };

      oauth2 = oauth2Module.create(baseConfig);

      request = nock('https://authorization-server.org', options)
        .post('/oauth/token', qs.stringify(oauthParams))
        .times(2)
        .replyWithFile(200, path.join(__dirname, '/fixtures/access_token.json'));
    });

    beforeEach((done) => {
      oauth2.authorizationCode.getToken(tokenParams, (e, r) => {
        error = e; result = r; done();
      });
    });

    beforeEach(() => {
      return oauth2.authorizationCode
        .getToken(tokenParams)
        .then((r) => { resultPromise = r; })
        .catch((e) => { errorPromise = e; });
    });

    it('makes the HTTP request', () => {
      request.done();
    });

    it('returns an access token as result of the token request', () => {
      expect(result).to.have.property('access_token');
      expect(resultPromise).to.have.property('access_token');
    });
  });
});
