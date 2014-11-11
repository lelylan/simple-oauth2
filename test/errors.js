var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org' },
    oauth2 = require('./../lib/simple-oauth2.js')(credentials),
    qs = require('querystring'),
    nock = require('nock');

var request, result, error;

describe('Simple oauth2 Error',function() {

  describe('with status code 401',function() {

    beforeEach(function(done) {
      var params = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code', 'client_id': 'client-id', 'client_secret': 'client-secret' };
      request = nock('https://example.org:443').post('/oauth/token', qs.stringify(params)).reply(401);
      done();
    });

    beforeEach(function(done) {
      var params = { 'code': 'code', 'redirect_uri': 'http://callback.com' }
      oauth2.authCode.getToken(params, function(e, r) {
        error = e; result = r; done();
      });
    });

    it('makes the HTTP request', function() {
      request.isDone();
    });

    it('returns an access token',function() {
      error.message.should.eql('Unauthorized');
      error.status.should.eql(401);
    });
  });

  describe('with status code 500',function() {

    beforeEach(function(done) {
      var params = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code', 'client_id': 'client-id', 'client_secret': 'client-secret' };
      request = nock('https://example.org:443').post('/oauth/token', qs.stringify(params)).reply(500);
      done();
    });

    beforeEach(function(done) {
      var params = { 'code': 'code', 'redirect_uri': 'http://callback.com' }
      oauth2.authCode.getToken(params, function(e, r) {
        error = e; result = r; done();
      });
    });

    it('makes the HTTP request', function() {
      request.isDone();
    });

    it('returns an access token',function() {
      error.message.should.eql('Internal Server Error');
      error.status.should.eql(500);
    });
  });
})


