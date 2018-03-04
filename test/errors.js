'use strict';

const qs = require('querystring');
const nock = require('nock');
const { expect } = require('chai');
const baseConfig = require('./fixtures/module-config.json');
const oauth2Module = require('./../index');

const oauth2 = oauth2Module.create(baseConfig);

const tokenParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
};

const oauthParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
  grant_type: 'authorization_code',
};

describe('Simple oauth2 Error', () => {
  let scope;
  let result;
  let error;

  describe('with status code 401', () => {
    before(() => {
      const scopeOptions = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      scope = nock('https://authorization-server.org:443', scopeOptions)
        .post('/oauth/token')
        .reply(401);
    });

    before(async () => {
      result = undefined;

      try {
        result = await oauth2.authorizationCode.getToken(tokenParams);
      } catch (err) {
        error = err;
      }
    });

    it('performs the http request', () => {
      scope.done();
    });

    it('rejects with a boom error', () => {
      const authorizationError = {
        error: 'Unauthorized',
        message: 'Response Error: 401 null',
        statusCode: 401,
      };

      expect(result).to.be.equal(undefined);
      expect(error.isBoom).to.be.equal(true);
      expect(error.output.payload).to.be.deep.equal(authorizationError);
    });
  });

  describe('with status code 500', () => {
    before(() => {
      const scopeOptions = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      scope = nock('https://authorization-server.org:443', scopeOptions)
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(500, {
          customError: 'An amazing error has occured',
        });
    });

    before(async () => {
      try {
        result = await oauth2.authorizationCode.getToken(tokenParams);
      } catch (err) {
        error = err;
      }
    });

    it('performs the http request', () => {
      scope.done();
    });

    it('rejects with a boom error', () => {
      const internalServerError = {
        error: 'Internal Server Error',
        message: 'An internal server error occurred',
        statusCode: 500,
      };

      expect(result).to.be.equal(undefined);
      expect(error.isBoom).to.be.equal(true);
      expect(error.output.payload).to.be.deep.equal(internalServerError);
    });
  });
});
