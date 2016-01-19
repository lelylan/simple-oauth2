var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org' },
  oauth2 = require('./../index.js')(credentials),
  qs = require('querystring'),
  should = require('should'),
  nock = require('nock');

var request, requestContent,
  result, resultPromise,
  error, errorPromise,
  tokenConfig = { 'code': 'code', 'redirect_uri': 'http://callback.com' },
  oauthConfig = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code', 'client_id': 'client-id', 'client_secret': 'client-secret' };

describe('Simple oauth2 Error', function () {
  describe('with status code 401', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthConfig))
        .reply(401);

      requestContent = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthConfig))
        .reply(401, {
          content: 'No authorized'
        });
    });

    beforeEach(function (done) {
      oauth2.authCode.getToken(tokenConfig, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.authCode
        .getToken(tokenConfig)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      request.isDone();
      requestContent.isDone();
    });

    it('returns an error object with the httpStatusCode and message as a result of callback api', function () {
      error.message.should.eql('Unauthorized');
      error.status.should.eql(401);

      should.equal(error.context, null);
    });

    it('returns an error object with the httpStatusCode, context and message as a result of promise api', function () {
      errorPromise.message.should.eql('Unauthorized');
      errorPromise.status.should.eql(401);
      errorPromise.context.should.deepEqual({
        content: 'No authorized'
      });
    });
  });

  describe('with status code 500', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthConfig))
        .reply(500);

      requestContent = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthConfig))
        .reply(500, {
          description: 'Error details.'
        });
    });

    beforeEach(function (done) {
      oauth2.authCode.getToken(tokenConfig, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.authCode
        .getToken(tokenConfig)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      request.isDone();
      requestContent.isDone();
    });

    it('returns an error object with the httpStatusCode and message as a result of the callback api', function () {
      error.message.should.eql('Internal Server Error');
      error.status.should.eql(500);
      should.equal(error.context, null);
    });

    it('returns an error object with the httpStatusCode, context and message as a result of promise api', function () {
      errorPromise.message.should.eql('Internal Server Error');
      errorPromise.status.should.eql(500);
      errorPromise.context.should.deepEqual({
        description: 'Error details.'
      });
    });
  });
});
