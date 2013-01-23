var credentials = { client: { id: 'client-id', secret: 'client-secret', site: 'https://example.org' } },
    OAuth2 = require('./../lib/simple-oauth2.js')(credentials),
		qs = require('querystring'),
    nock = require('nock');

var request, result, error;

describe('Simple OAuth2 Error',function() {

	describe('with status code 401',function() {

		beforeEach(function(done) {
			var params = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code' };
			request = nock('https://example.org:443').post('/oauth/token', qs.stringify(params)).reply(401, 'Unauthorized');
			done();
		});

		beforeEach(function(done) {
			var params = { 'code': 'code', 'redirect_uri': 'http://callback.com' }
			OAuth2.AuthCode.getToken(params, function(e, r) {
				error = e; result = r; done();
			});
		});

		it('makes the HTTP request', function() {
			request.isDone();
		});

		it('returns an access token',function() {
			error.message.message.should.eql('Unauthorized');
		});
	});

	describe('with status code 500',function() {

		beforeEach(function(done) {
			var params = { 'code': 'code', 'redirect_uri': 'http://callback.com', 'grant_type': 'authorization_code' };
			request = nock('https://example.org:443').post('/oauth/token', qs.stringify(params)).reply(500, 'Server Error');
			done();
		});

		beforeEach(function(done) {
			var params = { 'code': 'code', 'redirect_uri': 'http://callback.com' }
			OAuth2.AuthCode.getToken(params, function(e, r) {
				error = e; result = r; done();
			});
		});

		it('makes the HTTP request', function() {
			request.isDone();
		});

		it('returns an access token',function() {
			error.message.message.should.eql('Internal Server Error');
		});
	});
})


