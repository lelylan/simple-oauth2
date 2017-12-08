'use strict';

const path = require('path');
const qs = require('querystring');
const nock = require('nock');
const chai = require('chai');
const oauth2Module = require('./../index');
const expectedAccessToken = require('./fixtures/access_token');

const expect = chai.expect;
const baseConfig = require('./fixtures/module-config');

describe('authorization code grant type', () => {
  let request;
  let result;
  let resultPromise;

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
        const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

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
    describe('with body credentials', () => {
      describe('with format json', () => {
        let oauth2;
        const tokenParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
        };

        const tokenRequestParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
          grant_type: 'authorization_code',
          client_id: 'the client id',
          client_secret: 'the client secret',
        };

        before(() => {
          const config = Object.assign({}, baseConfig, {
            options: {
              useBodyAuth: true,
              bodyFormat: 'json',
              useBasicAuthorizationHeader: false,
            },
          });

          oauth2 = oauth2Module.create(config);
        });

        beforeEach(() => {
          const options = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          };

          request = nock('https://authorization-server.org', options)
            .post('/oauth/token', tokenRequestParams)
            .times(2)
            .reply(200, expectedAccessToken);
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

        it('makes the HTTP request', () => {
          request.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
          expect(resultPromise).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with format form', () => {
        let oauth2;
        const tokenParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
        };

        const tokenRequestParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
          grant_type: 'authorization_code',
          client_id: 'the client id',
          client_secret: 'the client secret',
        };

        before(() => {
          const config = Object.assign({}, baseConfig, {
            options: {
              useBodyAuth: true,
              bodyFormat: 'form',
              useBasicAuthorizationHeader: false,
            },
          });

          oauth2 = oauth2Module.create(config);
        });

        beforeEach(() => {
          const options = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };

          request = nock('https://authorization-server.org', options)
            .post('/oauth/token', qs.stringify(tokenRequestParams))
            .times(2)
            .reply(200, expectedAccessToken);
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

        it('makes the HTTP request', () => {
          request.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
          expect(resultPromise).to.be.deep.equal(expectedAccessToken);
        });
      });
    });

    describe('with header credentials', () => {
      let oauth2;
      const tokenParams = {
        code: 'code',
        redirect_uri: 'http://callback.com',
      };

      const tokenRequestParams = {
        code: 'code',
        redirect_uri: 'http://callback.com',
        grant_type: 'authorization_code',
      };

      before(() => {
        const config = Object.assign({}, baseConfig, {
          options: {
            useBodyAuth: false,
            useBasicAuthorizationHeader: true,
          },
        });

        oauth2 = oauth2Module.create(config);
      });

      beforeEach(() => {
        const options = {
          reqheaders: {
            Accept: 'application/json',
            Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
          },
        };

        request = nock('https://authorization-server.org', options)
          .post('/oauth/token', tokenRequestParams)
          .times(2)
          .reply(200, expectedAccessToken);
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

      it('makes the HTTP request', () => {
        request.done();
      });

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
        expect(resultPromise).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
