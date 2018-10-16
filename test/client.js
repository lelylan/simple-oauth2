'use strict';

const nock = require('nock');
const qs = require('querystring');
const bounce = require('bounce');
const { expect } = require('chai');
const oauth2Module = require('./../index');
const baseConfig = require('./fixtures/module-config');
const expectedAccessToken = require('./fixtures/access_token');

const tokenParams = {
  random_param: 'random value',
};

describe('client credentials grant type', () => {
  describe('when requesting an access token', () => {
    let scope;
    let result;

    describe('with body credentials', () => {
      describe('with json body', () => {
        before(() => {
          const scopeOptions = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          };

          const expectedRequestParams = {
            grant_type: 'client_credentials',
            client_id: 'the client id',
            client_secret: 'the client secret',
            random_param: 'random value',
          };

          scope = nock('https://authorization-server.org:443', scopeOptions)
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

          const oauth2 = oauth2Module.create(config);
          result = await oauth2.clientCredentials.getToken(tokenParams);
        });

        it('performs the http request', () => {
          scope.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with form body', () => {
        before(() => {
          const scopeOptions = {
            reqheaders: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };

          const expectedRequestParams = {
            random_param: 'random value',
            grant_type: 'client_credentials',
            client_id: 'the client id',
            client_secret: 'the client secret',
          };

          scope = nock('https://authorization-server.org:443', scopeOptions)
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

          const oauth2 = oauth2Module.create(config);
          result = await oauth2.clientCredentials.getToken(tokenParams);
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
        result = await oauth2.clientCredentials.getToken(tokenParams);
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
        result = await oauth2.clientCredentials.getToken(tokenParams);
      });

      it('performs the http request', () => {
        scope.done();
      });

      it('returns an access token as result of the token request', () => {
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
          grant_type: 'client_credentials',
          client_id: 'the client id',
          client_secret: 'the client secret',
          random_param: 'random value',
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

        const oauth2 = oauth2Module.create(config);

        try {
          await oauth2.clientCredentials.getToken(tokenParams);

          throw new Error('The operation was expected to be rejected');
        } catch (error) {
          scope.done();
          bounce.ignore(error, { isBoom: true, output: { statusCode: 406 } });
        }
      });
    });
  });
});
