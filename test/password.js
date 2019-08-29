'use strict';

const nock = require('nock');
const qs = require('querystring');
const { expect } = require('chai');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');

const tokenOptions = {
  username: 'alice',
  password: 'secret',
};

const tokenRequestParams = {
  username: 'alice',
  password: 'secret',
  grant_type: 'password',
  client_id: 'the client id',
  client_secret: 'the client secret',
};

describe('owner password gran type', () => {
  describe('when requesting an access token', () => {
    describe('with body credentials', () => {
      describe('with json format', () => {
        let scope;
        let result;

        before(() => {
          const scopeOptions = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          };

          scope = nock('https://authorization-server.org:443', scopeOptions)
            .post('/oauth/token', tokenRequestParams)
            .reply(200, expectedAccessToken);
        });

        before(async () => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'json',
              authorizationMethod: 'body',
            },
          });

          const oauth2 = oauth2Module.create(config);
          result = await oauth2.ownerPassword.getToken(tokenOptions);
        });

        it('performs the http request', () => {
          scope.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with form format', () => {
        let scope;
        let result;

        before(() => {
          const scopeOptions = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };

          scope = nock('https://authorization-server.org:443', scopeOptions)
            .post('/oauth/token', qs.stringify(tokenRequestParams))
            .reply(200, expectedAccessToken);
        });

        before(async () => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'form',
              authorizationMethod: 'body',
            },
          });

          const oauth2 = oauth2Module.create(config);
          result = await oauth2.ownerPassword.getToken(tokenOptions);
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
      let scope;
      let result;

      before(() => {
        const scopeOptions = {
          reqheaders: {
            Accept: 'application/json',
            Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
          },
        };

        scope = nock('https://authorization-server.org:443', scopeOptions)
          .post('/oauth/token')
          .reply(200, expectedAccessToken);
      });

      before(async () => {
        const config = Object.assign({}, baseConfig, {
          options: {
            authorizationMethod: 'header',
          },
        });

        const oauth2 = oauth2Module.create(config);
        result = await oauth2.ownerPassword.getToken(tokenOptions);
      });

      it('performs the http request', () => {
        scope.done();
      });

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });

    describe('with custom token host and path', () => {
      let scope;
      let result;

      before(() => {
        const scopeOptions = {
          reqheaders: {
            Accept: 'application/json',
            Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
          },
        };

        scope = nock('https://authorization-server.org:443', scopeOptions)
          .post('/root/oauth/token')
          .reply(200, expectedAccessToken);
      });

      before(async () => {
        const config = Object.assign({}, baseConfig, {
          auth: {
            tokenHost: 'https://authorization-server.org:443/root/',
            tokenPath: '/oauth/token',
          },
        });

        const oauth2 = oauth2Module.create(config);
        result = await oauth2.ownerPassword.getToken(tokenOptions);
      });

      it('performs the http request', () => {
        scope.done();
      });

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });

    describe('with additional http configuration', () => {
      let scope;
      let result;

      before(() => {
        const scopeOptions = {
          reqheaders: {
            Accept: 'application/json',
            Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
            'X-MYTHICAL-HEADER': 'mythical value',
            'USER-AGENT': 'hello agent',
          },
        };

        scope = nock('https://authorization-server.org:443', scopeOptions)
          .post('/oauth/token')
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

        const oauth2 = oauth2Module.create(config);
        result = await oauth2.ownerPassword.getToken(tokenOptions);
      });

      it('performs the http request', () => {
        scope.done();
      });

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
