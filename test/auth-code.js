'use strict';

const qs = require('querystring');
const { expect } = require('chai');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');
const { stubTokenRequest } = require('./util');

describe('authorization code grant type', () => {
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
          const expectedAuthorizationURL = `https://authorization-server.org/oauth/authorize?response_type=code&client_id=the%20client%20id&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=user%2Caccount&state=02afe928b`;

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
        before(function () {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'json',
              authorizationMethod: 'body',
            },
          });
          this.oauth2 = oauth2Module.create(config);
          this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          };
          this.expectedRequestParams = {
            code: 'code',
            redirect_uri: 'http://callback.com',
            grant_type: 'authorization_code',
            client_id: 'the client id',
            client_secret: 'the client secret',
          };
        });

        it('performs the http request', async function () {
          const scope = stubTokenRequest({ headers: this.headers, requestBody: this.expectedRequestParams });
          const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
          await this.oauth2.authorizationCode.getToken(tokenParams);
          scope.done();
        });

        it('returns an access token as result of the token request', async function () {
          stubTokenRequest({ headers: this.headers, requestBody: this.expectedRequestParams });
          const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
          const result = await this.oauth2.authorizationCode.getToken(tokenParams);
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with format form', () => {
        before(function () {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'form',
              authorizationMethod: 'body',
            },
          });
          this.oauth2 = oauth2Module.create(config);
          this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          };
          this.expectedRequestParams = {
            code: 'code',
            redirect_uri: 'http://callback.com',
            grant_type: 'authorization_code',
            client_id: 'the client id',
            client_secret: 'the client secret',
          };
        });

        it('performs the http request', async function () {
          const scope = stubTokenRequest({
            headers: this.headers,
            requestBody: qs.stringify(this.expectedRequestParams),
          });
          const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
          await this.oauth2.authorizationCode.getToken(tokenParams);
          scope.done();
        });

        it('returns an access token as result of the token request', async function () {
          stubTokenRequest({
            headers: this.headers,
            requestBody: qs.stringify(this.expectedRequestParams),
          });
          const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
          const result = await this.oauth2.authorizationCode.getToken(tokenParams);
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });
    });

    describe('with header credentials', () => {
      before(function () {
        const config = Object.assign({}, baseConfig, {
          options: {
            authorizationMethod: 'header',
          },
        });
        this.oauth2 = oauth2Module.create(config);
        this.headers = {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        };
        this.expectedRequestParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
          grant_type: 'authorization_code',
        };
      });

      it('performs the http request', async function () {
        const scope = stubTokenRequest({
          headers: this.headers,
          requestBody: this.expectedRequestParams,
        });
        const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
        await this.oauth2.authorizationCode.getToken(tokenParams);
        scope.done();
      });

      it('resolves the access token', async function () {
        stubTokenRequest({
          headers: this.headers,
          requestBody: this.expectedRequestParams,
        });
        const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
        const result = await this.oauth2.authorizationCode.getToken(tokenParams);
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });

    describe('with additional http configuration', () => {
      before(function () {
        const config = Object.assign({}, baseConfig, {
          http: {
            headers: {
              'X-MYTHICAL-HEADER': 'mythical value',
              'USER-AGENT': 'hello agent',
            },
          },
        });
        this.oauth2 = oauth2Module.create(config);
        this.headers = {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
          'X-MYTHICAL-HEADER': 'mythical value',
          'USER-AGENT': 'hello agent',
        };
        this.expectedRequestParams = {
          code: 'code',
          redirect_uri: 'http://callback.com',
          grant_type: 'authorization_code',
        };
      });

      it('performs the http request with custom headers', async function () {
        const scope = stubTokenRequest({
          headers: this.headers,
          requestBody: this.expectedRequestParams,
        });
        const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
        await this.oauth2.authorizationCode.getToken(tokenParams);
        scope.done();
      });

      it('resolves the access token', async function () {
        stubTokenRequest({
          headers: this.headers,
          requestBody: this.expectedRequestParams,
        });
        const tokenParams = { code: 'code', redirect_uri: 'http://callback.com' };
        const result = await this.oauth2.authorizationCode.getToken(tokenParams);
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
