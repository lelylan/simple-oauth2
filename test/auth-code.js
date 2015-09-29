var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org', mobileAuthorizationUri: 'example://app/authorize' },
    oauth2 = require('./../lib/simple-oauth2.js')(credentials),
    qs = require('querystring'),
    nock = require('nock');

var request, result, error, result_mobile;

describe('oauth2.authCode',function() {

  describe('#authorizeURL', function(){

    var params = { 'redirect_uri': 'http://localhost:3000/callback', 'scope': 'user', 'state': '02afe928b' };

    beforeEach(function(done) {
      result = oauth2.authCode.authorizeURL(params);
      done();
    })

    beforeEach(function(done) {
      result_mobile = oauth2.authCode.authorizeURL(params, true);
      done();
    })

    it('returns the authorization URI for mobile apps', function() {
      var expected = 'example://app/authorize?redirect_uri=' + encodeURIComponent('http://localhost:3000/callback') + '&scope=user&state=02afe928b&response_type=code&client_id=client-id';
      result_mobile.should.eql(expected);
    })

    it('returns the authorization URI', function() {
      var expected = 'https://example.org/oauth/authorize?redirect_uri=' + encodeURIComponent('http://localhost:3000/callback') + '&scope=user&state=02afe928b&response_type=code&client_id=client-id';
      result.should.eql(expected);
    })
  });

  describe('#getToken',function() {

    beforeEach(function(done) {
      var params = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code', 'client_id': 'client-id', 'client_secret': 'client-secret' };
      request = nock('https://example.org').post('/oauth/token', qs.stringify(params)).replyWithFile(200, __dirname + '/fixtures/access_token.json');
      done();
    })

    beforeEach(function(done) {
      var params = { 'code': 'code', 'redirect_uri': 'http://callback.com' }
      oauth2.authCode.getToken(params, function(e, r) {
        error = e; result = r; done();
      })
    })

    it('makes the HTTP request', function() {
      request.isDone();
    });

    it('returns an access token',function() {
      result.should.have.property('access_token');
    });
  });
});
