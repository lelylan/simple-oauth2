'use strict';

const qs = require('querystring');
const nock = require('nock');
const { expect } = require('chai');
const oauth2Module = require('./../index');

const oauth2 = oauth2Module.create(require('./fixtures/module-config.json'));

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
  let request;
  let result;
  let error;

  describe('with status code 401', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token')
        .reply(401);
    });

    beforeEach(async () => {
      result = undefined;

      try {
        result = await oauth2.authorizationCode.getToken(tokenParams);
      } catch (err) {
        error = err;
      }
    });

    it('makes the HTTP request', () => {
      request.done();
    });

    it('returns an error object with the httpStatusCode and message as a result of the token request', () => {
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
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(oauthParams))
        .reply(500, {
          customError: 'An amazing error has occured',
        });
    });

    beforeEach(async () => {
      try {
        result = await oauth2.authorizationCode.getToken(tokenParams);
      } catch (err) {
        error = err;
      }
    });

    it('makes the HTTP request', () => {
      request.done();
    });

    it('returns an error object with the httpStatusCode and message as a result of the token request', () => {
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
