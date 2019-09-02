'use strict';

const nock = require('nock');
const qs = require('querystring');
const bounce = require('@hapi/bounce');
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

    describe('with default module configuration', () => {
      describe('when no options are provided', () => {
        it('returns the authorization URI', () => {
          const oauth2 = oauth2Module.create(baseConfig);
          const authorizationURL = oauth2.authorizationCode.authorizeURL();
          const expectedAuthorizationURL = 'https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id';

          expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
        });
      });

      describe('when options are provided', () => {
        it('returns the authorization URI', () => {
          const oauth2 = oauth2Module.create(baseConfig);
          const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
          const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

          expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
        });
      });

      describe('when multiple scopes are provided as an array', () => {
        const authConfigMultScopesAry = Object.assign({}, authorizeConfig, {
          scope: ['user', 'account'],
        });

        it('returns the authorization URI with scopes joined by commas', () => {
          const oauth2 = oauth2Module.create(baseConfig);
          const authorizationURL = oauth2.authorizationCode.authorizeURL(authConfigMultScopesAry);
          const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user%20account&state=02afe928b`;

          expect(authorizationURL).to.be.equal(expectedAuthorizationURL);
        });
      });
    });

    describe('with custom module configuration', () => {
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

      it('uses a custom authorizeHost with trailing slashes', () => {
        const oauth2 = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
            authorizeHost: 'https://other-authorization-server.com/root/',
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

      it('uses a custom authorizeHost and authorizePath', () => {
        const oauth2 = oauth2Module.create({
          client: {
            id: 'client-id',
            secret: 'client-secret',
          },
          auth: {
            tokenHost: 'https://authorization-server.org',
            authorizeHost: 'https://other-authorization-server.com',
            authorizePath: '/authorize-now',
          },
        });

        const authorizationURL = oauth2.authorizationCode.authorizeURL(authorizeConfig);
        const expectedAuthorizationURL = `https://other-authorization-server.com/authorize-now?response_type=code&client_id=client-id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user&state=02afe928b`;

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

        it('performs the http request', () => {
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

        it('performs the http request', () => {
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

    describe('with custom token host and path', () => {
      before(() => {
        const scopeOptions = {
          reqheaders: {
            Accept: 'application/json',
          },
        };

        const expectedRequestParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
          grant_type: 'authorization_code',
        };

        scope = nock('https://authorization-server.org', scopeOptions)
          .post('/root/oauth/token', expectedRequestParams)
          .reply(200, expectedAccessToken);
      });

      before(async () => {
        const config = Object.assign({}, baseConfig, {
          auth: {
            tokenHost: 'https://authorization-server.org:443/root/',
            tokenPath: '/oauth/token',
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

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });

    describe('with additional http configuration', () => {
      before(() => {
        const scopeOptions = {
          reqheaders: {
            Accept: 'application/json',
            Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
            'X-MYTHICAL-HEADER': 'mythical value',
            'USER-AGENT': 'hello agent',
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
          http: {
            headers: {
              'X-MYTHICAL-HEADER': 'mythical value',
              'USER-AGENT': 'hello agent',
            },
          },
        });

        const tokenParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
        };

        const oauth2 = oauth2Module.create(config);
        result = await oauth2.authorizationCode.getToken(tokenParams);
      });

      it('performs the http request with custom headers', () => {
        scope.done();
      });

      it('resolves the access token', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });

    describe('when a non-json response is received', () => {
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

        scope = nock('https://authorization-server.org:443', scopeOptions)
          .post('/oauth/token', expectedRequestParams)
          .reply(200, '<html>Sorry for not responding with a json response</html>', {
            'Content-Type': 'application/html',
          });
      });

      it('rejects the operation', async () => {
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

        try {
          await oauth2.authorizationCode.getToken(tokenParams);

          throw new Error('The operation was expected to be rejected');
        } catch (error) {
          scope.done();
          bounce.ignore(error, { isBoom: true, output: { statusCode: 406 } });
        }
      });
    });
  });
});
