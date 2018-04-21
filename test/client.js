'use strict';

const qs = require('querystring');
const { expect } = require('chai');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');
const { stubTokenRequest } = require('./util');

const tokenRequestParams = {
  grant_type: 'client_credentials',
  client_id: 'the client id',
  client_secret: 'the client secret',
};

describe('client credentials grant type', () => {
  describe('when requesting an access token', () => {
    describe('with body credentials', () => {
      describe('with json body', () => {
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
        });

        it('performs the http request', async function () {
          const scope = stubTokenRequest({ headers: this.headers, requestBody: tokenRequestParams });
          await this.oauth2.clientCredentials.getToken();
          scope.done();
        });

        it('preserves additional request params', async function () {
          const expectedRequestParams = { ...tokenRequestParams, random_param: 'random value' };
          stubTokenRequest({ headers: this.headers, requestBody: expectedRequestParams });
          await this.oauth2.clientCredentials.getToken({ random_param: 'random value' });
        });

        it('accepts scope as string', async function () {
          const expectedRequestParams = { ...tokenRequestParams, scope: 'scope-a' };
          stubTokenRequest({ headers: this.headers, requestBody: expectedRequestParams });
          await this.oauth2.clientCredentials.getToken({ scope: 'scope-a' });
        });

        it('accepts scope as array', async function () {
          const expectedRequestParams = { ...tokenRequestParams, scope: 'scope-a scope-b' };
          stubTokenRequest({ headers: this.headers, requestBody: expectedRequestParams });
          await this.oauth2.clientCredentials.getToken({ scope: ['scope-a', 'scope-b'] });
        });

        it('returns an access token as result of the token request', async function () {
          stubTokenRequest({ headers: this.headers, requestBody: tokenRequestParams });
          const result = await this.oauth2.clientCredentials.getToken();
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with form body', () => {
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
        });

        it('performs the http request', async function () {
          const scope = stubTokenRequest({ headers: this.headers, requestBody: qs.stringify(tokenRequestParams) });
          await this.oauth2.clientCredentials.getToken();
          scope.done();
        });

        it('preserves additional request params', async function () {
          stubTokenRequest({ headers: this.headers, requestBody: /random_param=random%20value/ });
          await this.oauth2.clientCredentials.getToken({ random_param: 'random value' });
        });

        it('accepts scope as string', async function () {
          stubTokenRequest({ headers: this.headers, requestBody: /scope=scope-a/ });
          await this.oauth2.clientCredentials.getToken({ scope: 'scope-a' });
        });

        it('accepts scope as array', async function () {
          stubTokenRequest({ headers: this.headers, requestBody: /scope=scope-a%20scope-b/ });
          await this.oauth2.clientCredentials.getToken({ scope: ['scope-a', 'scope-b'] });
        });

        it('returns an access token as result of the token request', async function () {
          stubTokenRequest({ headers: this.headers, requestBody: qs.stringify(tokenRequestParams) });
          const result = await this.oauth2.clientCredentials.getToken();
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
      });

      it('performs the http request', async function () {
        const scope = stubTokenRequest({ headers: this.headers });
        await this.oauth2.clientCredentials.getToken();
        scope.done();
      });

      it('returns an access token as result of the token request', async function () {
        stubTokenRequest({ headers: this.headers });
        const result = await this.oauth2.clientCredentials.getToken();
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
      });

      it('performs the http request', async function () {
        const scope = stubTokenRequest({ headers: this.headers });
        await this.oauth2.clientCredentials.getToken();
        scope.done();
      });

      it('returns an access token as result of the token request', async function () {
        stubTokenRequest({ headers: this.headers });
        const result = await this.oauth2.clientCredentials.getToken();
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
