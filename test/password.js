var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org' },
  oauth2 = require('./../index.js')(credentials),
  qs = require('querystring'),
  nock = require('nock');

var request,
  result, resultPromise,
  error, errorPromise,
  tokenParams = { 'username': 'alice', 'password': 'secret' },
  oauthParams = { 'username': 'alice', 'password': 'secret', 'grant_type': 'password', 'client_id': 'client-id', 'client_secret': 'client-secret' };

describe('oauth2.password', function () {
  describe('#getToken', function () {
    beforeEach(function () {
      request = nock('https://example.org:443')
        .post('/oauth/token', qs.stringify(oauthParams))
        .times(2)
        .replyWithFile(200, __dirname + '/fixtures/access_token.json');
    });

    beforeEach(function (done) {
      oauth2.password.getToken(tokenParams, function (e, r) {
        error = e; result = r; done();
      });
    });

    beforeEach(function () {
      return oauth2.password.getToken(tokenParams)
        .then(function (r) { resultPromise = r; })
        .catch(function (e) { errorPromise = e; });
    });

    it('makes the HTTP request', function () {
      request.isDone();
    });

    it('returns an access token as result of callback api', function () {
      result.should.have.property('access_token');
    });

    it('returns an access token as result of promises api', function () {
      resultPromise.should.have.property('access_token');
    });
  });
});
