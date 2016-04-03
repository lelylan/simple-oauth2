var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org' },
  oauth2 = require('./../index.js')(credentials),
  qs = require('querystring'),
  nock = require('nock');

var request,
  result, resultPromise,
  error, errorPromise,
  tokenConfig = { 'code': 'code', 'redirect_uri': 'http://callback.com' },
  oauthConfig = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code', 'client_id': 'client-id', 'client_secret': 'client-secret' },
  authorizeConfig = { 'redirect_uri': 'http://localhost:3000/callback', 'scope': 'user', 'state': '02afe928b' };

describe('oauth2.authCode', function () {
  describe('#authorizeURL', function () {

    it('returns the authorization URI', function () {
      result = oauth2.authCode.authorizeURL(authorizeConfig);

      var expected = 'https://example.org/oauth/authorize?redirect_uri=' + encodeURIComponent('http://localhost:3000/callback') + '&scope=user&state=02afe928b&response_type=code&client_id=client-id';
      result.should.eql(expected);
    });

    it('should allow absolute URI for authorizationPath', function () {
      var oauth2 = require('./../index')({
        clientID: 'client-id',
        clientSecret: 'client-secret',
        site: 'https://example.org',
        authorizationPath: 'https://othersite.com/oauth/authorize'
      });
      result = oauth2.authCode.authorizeURL(authorizeConfig);

      var expected = 'https://othersite.com/oauth/authorize?redirect_uri=' + encodeURIComponent('http://localhost:3000/callback') + '&scope=user&state=02afe928b&response_type=code&client_id=client-id';
      result.should.eql(expected);
    });
  });

  describe('#getToken', function () {
    beforeEach(function () {
      request = nock('https://example.org')
        .post('/oauth/token', qs.stringify(oauthConfig))
        .times(2)
        .replyWithFile(200, __dirname + '/fixtures/access_token.json');
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
    });

    it('returns an access token as result of callback api', function () {
      result.should.have.property('access_token');
    });

    it('returns an access token as result of promise api', function () {
      resultPromise.should.have.property('access_token');
    });
  });
});
