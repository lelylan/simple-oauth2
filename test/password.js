var credentials = { client: { id: 'client-id', secret: 'client-secret', site: 'https://example.org' } },
    OAuth2 = require('./../lib/simple-oauth2.js')(credentials),
    nock = require('nock');

var request, result, error;

describe('OAuth2.Password',function() {

	describe('#getToken',function() {

		beforeEach(function(done) {
			var params = { 'username': 'alice', 'password': 'secret', 'grant_type': 'password' };
			request = nock('https://example.org:443').post('/oauth/token', params).replyWithFile(200, __dirname + '/fixtures/access_token.json');
			done();
		})

		beforeEach(function(done) {
			var params = { 'username': 'alice', 'password': 'secret' };
			OAuth2.Password.getToken(params, function(e, r) {
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
