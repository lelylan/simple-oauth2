'use strict';

const nock = require('nock');
const qs = require('querystring');
const { expect } = require('chai');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');

describe('authorization code grant type', () => {
  let scope;
  let result;

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

    describe('with multiple scopes in configuration provided as an array', () => {
      const authConfigMultScopesAry = Object.assign({}, authorizeConfig, { scope: ['user', 'account'] });

      it('returns the authorization URI with scopes joined by commas', () => {
        const oauth2 = oauth2Module.create(baseConfig);
        const authorizationURL = oauth2.authorizationCode.authorizeURL(authConfigMultScopesAry);
        const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user%2Caccount&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });
    });

    describe('with custom configuration', () => {
      it('uses a custom idParamName', () => {
        const oauth2 = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
            idParamName: 'incredible-param-name',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
          },
        });

        const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&incredible-param-name=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });

      it('uses a custom authorizeHost', () => {
        const oauth2 = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
            authorizeHost: 'https://other-authorization-server.com',
          },
        });

        const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://other-authorization-server.com/oauth/authorize?response_type=code&client_id=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });

      it('uses a custom authorizePath', () => {
        const oauth2 = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
            authorizePath: '/authorize-now',
          },
        });

        const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://authorization-server.org/authorize-now?response_type=code&client_id=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

        expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
      });
    });
  });

  describe('when requesting an access token', () => {
    describe('with body credentials', () => {
      describe('with format json', () => {
        before(() => {
          const scopeOptions = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          };

          const expectedRequestParams = {
            code: 'code',
            redirect_uri: 'http://callback.com',
            grant_type: 'authorization_code',
            client_id: 'the client id',
            client_secret: 'the client secret',
          };

          scope = nock('https://authorization-server.org', scopeOptions)
            .post('/oauth/token', expectedRequestParams)
            .reply(200, expectedAccessToken);
        });

        before(async () => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'json',
              authorizationMethod: 'body',
            },
          });

          const tokenParams = {
            code: 'code',
            redirect_uri: 'http://callback.com',
          };

          const oauth2 = oauth2Module.create(config);
          result = await oauth2.authorizationCode.getToken(tokenParams);
        });

        it('makes the HTTP request', () => {
          scope.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with format form', () => {
        before(() => {
          const scopeOptions = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };

          const expectedRequestParams = {
            code: 'code',
            redirect_uri: 'http://callback.com',
            grant_type: 'authorization_code',
            client_id: 'the client id',
            client_secret: 'the client secret',
          };

          scope = nock('https://authorization-server.org', scopeOptions)
            .post('/oauth/token', qs.stringify(expectedRequestParams))
            .reply(200, expectedAccessToken);
        });

        before(async () => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'form',
              authorizationMethod: 'body',
            },
          });

          const tokenParams = {
            code: 'code',
            redirect_uri: 'http://callback.com',
          };

          const oauth2 = oauth2Module.create(config);
          result = await oauth2.authorizationCode.getToken(tokenParams);
        });

        it('makes the HTTP request', () => {
          scope.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });
    });

    describe('with header credentials', () => {
      before(() => {
        const scopeOptions = {
          reqheaders: {
            Accept: 'application/json',
            Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
          },
        };

        const expectedRequestParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
          grant_type: 'authorization_code',
        };

        scope = nock('https://authorization-server.org', scopeOptions)
          .post('/oauth/token', expectedRequestParams)
          .reply(200, expectedAccessToken);
      });

      before(async () => {
        const config = Object.assign({}, baseConfig, {
          options: {
            authorizationMethod: 'header',
          },
        });

        const tokenParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
        };

        const oauth2 = oauth2Module.create(config);
        result = await oauth2.authorizationCode.getToken(tokenParams);
      });

      it('performs the http request', () => {
        scope.done();
      });

      it('resolves the access token', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
