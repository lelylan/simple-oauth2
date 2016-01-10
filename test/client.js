var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org', form: false },
  oauth2 = require('./../index.js')(credentials),
  qs = require('querystring'),
  nock = require('nock');

var request,
  result, resultPromise,
  error, errorPromise,
  tokenConfig = {},
  oauthConfig = { 'grant_type': 'client_credentials', client_id: 'client-id', client_secret: 'client-secret' };

describe('oauth2.Client', function () {
  describe('#getToken', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthConfig))
        .times(2)
        .replyWithFile(200, __dirname + '/fixtures/access_token.json');
    });

    beforeEach(function (done) {
      oauth2.client.getToken(tokenConfig, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.client
        .getToken(tokenConfig)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      request.isDone();
    });

    it('returns an access token as result of callback api', function () {
      result.should.have.property('access_token');
    });

    it('returns an access token as result of promise api', function () {
      resultPromise.should.have.property('access_token');
    });
  });
});
