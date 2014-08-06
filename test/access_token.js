var credentials = { clientID: 'client-id', clientSecret: 'client-secret', site: 'https://example.org' },
    oauth2 = require('./../lib/simple-oauth2.js')(credentials),
    qs = require('querystring'),
    nock = require('nock');

var request, result, token, error;


describe('oauth2.accessToken',function() {

  beforeEach(function(done) {
    var params = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code', 'client_id': 'client-id', 'client_secret': 'client-secret' };
    request = nock('https://example.org:443').post('/oauth/token', qs.stringify(params)).replyWithFile(200, __dirname + '/fixtures/access_token.json');
    done();
  })

  beforeEach(function(done) {
    var params = { 'code': 'code', 'redirect_uri': 'http://callback.com' }
    oauth2.authCode.getToken(params, function(e, r) {
      error = e; result = r; done();
    })
  })

  beforeEach(function(done) {
    token = oauth2.accessToken.create(result);
    done();
  });

  describe('#create',function() {

    it('creates an access token',function() {
      token.should.have.property('token');
    });
  });


  describe('when not expired', function() {

    it('returns false',function() {
      token.expired().should.be.false
    });
  });

  describe('when expired', function() {

    beforeEach(function(done) {
      token.token.expires_at = Date.yesterday();
      done();
    });

    it('returns false',function() {
      token.expired().should.be.true
    });
  });

  describe('when refreshes token', function() {

    beforeEach(function(done) {
      var params = { 'grant_type': 'refresh_token', refresh_token: 'ec1a59d298', 'client_id': 'client-id', 'client_secret': 'client-secret' };
      request = nock('https://example.org:443').post('/oauth/token', qs.stringify(params)).replyWithFile(200, __dirname + '/fixtures/access_token.json');
      done();
    });

    beforeEach(function(done) {
      result = null;
      token.refresh(function(e, r) {
        error = e; result = r; done();
      });
    });

    it('makes the HTTP request', function() {
      request.isDone();
    });

    it('returns a new oauth2.accessToken',function() {
      result.token.should.have.property('access_token');
    });
  })

  describe('#revoke',function() {

      beforeEach(function(done) {
          var params = { 'token': 'ec1a59d298', 'token_type_hint': 'refresh_token', 'client_id': 'client-id', 'client_secret': 'client-secret' };
          request = nock('https://example.org:443').post('/oauth/revoke', qs.stringify(params)).reply(200);
          done();
      });

      beforeEach(function(done) {
          result = null;
          token.revoke('refresh_token', function(e) {
              error = e; done();
          });
      });

    it('make HTTP call', function() {
        request.isDone();
    });
  });
});
