'use strict';

const qs = require('querystring');
const nock = require('nock');
const { expect } = require('chai');
const oauth2Module = require('./../index');
const expectedAccessToken = require('./fixtures/access_token');

const tokenParams = {};
const baseConfig = require('./fixtures/module-config');

describe('client credentials grant type', () => {
  describe('when requesting an access token', () => {
    let oauth2;
    let request;
    let result;

    describe('with body credentials', () => {
      describe('with json body', () => {
        before(() => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'json',
              useBodyAuth: true,
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

          request = nock('https://authorization-server.org:443', options)
            .post('/oauth/token', {
              grant_type: 'client_credentials',
              client_id: 'the client id',
              client_secret: 'the client secret',
            })
            .reply(200, expectedAccessToken);
        });

        beforeEach(async () => {
          result = await oauth2.clientCredentials.getToken(tokenParams);
        });

        it('makes the HTTP request', () => {
          expect(request.isDone()).to.be.equal(true);
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with form body', () => {
        before(() => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'form',
              useBodyAuth: true,
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

          request = nock('https://authorization-server.org:443', options)
            .post('/oauth/token', qs.stringify({
              grant_type: 'client_credentials',
              client_id: 'the client id',
              client_secret: 'the client secret',
            }))
            .reply(200, expectedAccessToken);
        });

        beforeEach(async () => {
          result = await oauth2.clientCredentials.getToken(tokenParams);
        });

        it('makes the HTTP request', () => {
          expect(request.isDone()).to.be.equal(true);
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });
    });

    describe('with header credentials', () => {
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

        request = nock('https://authorization-server.org:443', options)
          .post('/oauth/token')
          .reply(200, expectedAccessToken);
      });

      beforeEach(async () => {
        result = await oauth2.clientCredentials.getToken(tokenParams);
      });

      it('makes the HTTP request', () => {
        expect(request.isDone()).to.be.equal(true);
      });

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
