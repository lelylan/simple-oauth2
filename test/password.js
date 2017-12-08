'use strict';

const path = require('path');
const qs = require('querystring');
const nock = require('nock');
const chai = require('chai');
const oauth2Module = require('./../index');
const expectedAccessToken = require('./fixtures/access_token');

const expect = chai.expect;
const baseConfig = require('./fixtures/module-config');

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
        let resultPromise;

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
            .post('/oauth/token', tokenRequestParams)
            .times(2)
            .reply(200, expectedAccessToken);
        });

        beforeEach((done) => {
          oauth2.ownerPassword.getToken(tokenOptions, (e, r) => {
            result = r; done(e);
          });
        });

        beforeEach(() => {
          return oauth2.ownerPassword.getToken(tokenOptions)
            .then((r) => { resultPromise = r; });
        });

        it('makes the HTTP request', () => {
          return request.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
          expect(resultPromise).to.be.deep.equal(expectedAccessToken);
        });
      });

      describe('with form format', () => {
        let oauth2;
        let request;
        let result;
        let resultPromise;
        let error;
        let errorPromise;

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
            .post('/oauth/token', qs.stringify(tokenRequestParams))
            .times(2)
            .reply(200, expectedAccessToken);
        });

        beforeEach((done) => {
          oauth2.ownerPassword.getToken(tokenOptions, (e, r) => {
            result = r; done(e);
          });
        });

        beforeEach(() => {
          return oauth2.ownerPassword.getToken(tokenOptions)
            .then((r) => { resultPromise = r; });
        });

        it('makes the HTTP request', () => {
          return request.done();
        });

        it('returns an access token as result of the token request', () => {
          expect(result).to.be.deep.equal(expectedAccessToken);
          expect(resultPromise).to.be.deep.equal(expectedAccessToken);
        });
      });
    });

    describe('with header credentials', () => {
      let oauth2;
      let request;
      let result;
      let resultPromise;

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
          .times(2)
          .reply(200, expectedAccessToken);
      });

      beforeEach((done) => {
        oauth2.ownerPassword.getToken(tokenOptions, (e, r) => {
          result = r; done(e);
        });
      });

      beforeEach(() => {
        return oauth2.ownerPassword.getToken(tokenOptions)
          .then((r) => { resultPromise = r; });
      });

      it('makes the HTTP request', () => {
        return request.done();
      });

      it('returns an access token as result of the token request', () => {
        expect(result).to.be.deep.equal(expectedAccessToken);
        expect(resultPromise).to.be.deep.equal(expectedAccessToken);
      });
    });
  });
});
