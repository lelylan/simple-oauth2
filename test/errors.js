'use strict';

const qs = require('querystring');
const nock = require('nock');
const chai = require('chai');
const oauth2Module = require('./../index.js');

const expect = chai.expect;
const oauth2 = oauth2Module.create(require('./fixtures/module-config.json'));

const tokenParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
};

const oauthParams = {
  code: 'code',
  redirect_uri: 'http://callback.com',
  grant_type: 'authorization_code',
  client_id: 'the client id',
  client_secret: 'the client secret',
};

describe('Simple oauth2 Error', () => {
  let request;
  let result;
  let resultPromise;
  let error;
  let errorPromise;

  describe('with status code 401', () => {
    beforeEach(() => {
      const options = {
        reqheaders: {
          Accept: 'application/json',
          Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
        },
      };

      request = nock('https://authorization-server.org:443', options)
        .post('/oauth/token', qs.stringify(oauthParams))
        .times(2)
        .reply(401);
    });

    beforeEach((done) => {
      oauth2.authorizationCode.getToken(tokenParams, (e, r) => {
        error = e; result = r; done();
      });
    });

    beforeEach(() => {
      return oauth2.authorizationCode
        .getToken(tokenParams)
        .then((r) => { resultPromise = r; })
        .catch((e) => { errorPromise = e; });
    });

    it('makes the HTTP request', () => {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns an error object with the httpStatusCode and message as a result of the token request', () => {
      const authorizationError = {
        error: 'Unauthorized',
        message: 'Response Error: 401 null',
        statusCode: 401,
      };

      expect(error.isBoom).to.be.equal(true);
      expect(error.output.payload).to.be.deep.equal(authorizationError);

      expect(errorPromise.isBoom).to.be.equal(true);
      expect(errorPromise.output.payload).to.be.deep.equal(authorizationError);
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
        .times(2)
        .reply(500, {
          customError: 'An amazing error has occured',
        });
    });

    beforeEach((done) => {
      oauth2.authorizationCode.getToken(tokenParams, (e, r) => {
        error = e; result = r; done();
      });
    });

    beforeEach(() => {
      return oauth2.authorizationCode
        .getToken(tokenParams)
        .then((r) => { resultPromise = r; })
        .catch((e) => { errorPromise = e; });
    });

    it('makes the HTTP request', () => {
      expect(request.isDone()).to.be.equal(true);
    });

    it('returns an error object with the httpStatusCode and message as a result of the token request', () => {
      const internalServerError = {
        error: 'Internal Server Error',
        message: 'An internal server error occurred',
        statusCode: 500,
      };

      expect(error.isBoom).to.be.equal(true);
      expect(error.output.payload).to.be.deep.equal(internalServerError);

      expect(errorPromise.isBoom).to.be.equal(true);
      expect(errorPromise.output.payload).to.be.deep.equal(internalServerError);
    });
  });
});
