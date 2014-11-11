var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org' },
    oauth2 = require('./../lib/simple-oauth2.js')(credentials),
    qs = require('querystring'),
    nock = require('nock');

var request, result, error;

describe('oauth2.password',function() {

  describe('#getToken',function() {

    beforeEach(function(done) {
      var params = { 'username': 'alice', 'password': 'secret', 'grant_type': 'password' };
      request = nock('https://example.org:443').post('/oauth/token', qs.stringify(params)).replyWithFile(200, __dirname + '/fixtures/access_token.json');
      done();
    })

    beforeEach(function(done) {
      var params = { 'username': 'alice', 'password': 'secret' };
      oauth2.password.getToken(params, function(e, r) {
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
