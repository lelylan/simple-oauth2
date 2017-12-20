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
        let oauth2;
        let request;
        let result;

        before(() => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'json',
              authorizationMethod: 'body',
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
            .post('/oauth/token', tokenRequestParams)
            .reply(200, expectedAccessToken);
        });

        beforeEach(async () => {
          result = await oauth2.ownerPassword.getToken(tokenOptions);
        });

        it('makes the HTTP request', () => {
          return request.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with form format', () => {
        let oauth2;
        let request;
        let result;

        before(() => {
          const config = Object.assign({}, baseConfig, {
            options: {
              bodyFormat: 'form',
              authorizationMethod: 'body',
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
            .post('/oauth/token', qs.stringify(tokenRequestParams))
            .reply(200, expectedAccessToken);
        });

        beforeEach(async () => {
          result = await oauth2.ownerPassword.getToken(tokenOptions);
        });

        it('makes the HTTP request', () => {
          request.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
        });
      });
    });

    describe('with header credentials', () => {
      let oauth2;
      let request;
      let result;

      before(() => {
        const config = Object.assign({}, baseConfig, {
          options: {
            authorizationMethod: 'header',
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
        result = await oauth2.ownerPassword.getToken(tokenOptions);
      });

      it('makes the HTTP request', () => {
        request.done();
      });

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
