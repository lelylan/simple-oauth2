var credentials = { client: { id: 'client-id', secret: 'client-secret', site: 'https://example.org' } },
    OAuth2 = require('./../lib/simple-oauth2.js')(credentials),
		qs = require('querystring'),
    nock = require('nock');

var request, result, error;

describe.only('OAuth2.AuthCode',function() {

	describe('#authorizeURL', function(){

		beforeEach(function(done) {
			var params = { 'redirect_uri': 'http://localhost:3000/callback', 'scope': 'user', 'state': '02afe928b' };
			result = OAuth2.AuthCode.authorizeURL(params);
			done();
		})

		it('returns the authorization URI', function() {
			var expected = 'https://example.org/oauth/authorization?redirect_uri=' + encodeURIComponent('http://localhost:3000/callback') + '&scope=user&state=02afe928b&response_type=code&client_id=client-id';
			result.should.eql(expected);
		})
	});

	//describe('#getToken',function() {

		//beforeEach(function(done) {
			//request = nock('http://api.lelylan.com').get('/devices/1').replyWithFile(200, __dirname + '/fixtures/device.json');
			//done();
		//})

		//beforeEach(function(done) {
			//Lelylan.Device.find('1', function(e, r) {
				//error = e; response = r; done();
			//})
		//})

		//it('makes the HTTP request', function() {
			//request.isDone();
		//});

		//it('return a json array',function() {
			//response.should.be.a('object');
		//});
	//});
});
