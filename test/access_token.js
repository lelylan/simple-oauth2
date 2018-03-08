'use strict';

const qs = require('querystring');
const nock = require('nock');
const Chance = require('chance');
const accessTokenMixin = require('chance-access-token');
const { expect } = require('chai');
const { defaultsDeep } = require('lodash');
const { isValid, isDate, differenceInSeconds } = require('date-fns');

const oauth2Module = require('./../index.js');
const moduleConfig = require('./fixtures/module-config');

const chance = new Chance();
chance.mixin({ accessToken: accessTokenMixin });

const oauth2 = oauth2Module.create(moduleConfig);

const scopeOptions = {
  reqheaders: {
    Accept: 'application/json',
    Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
  },
};

describe('on access token creation', () => {
  it('creates a new access token instance', () => {
    const accessTokenResponse = chance.accessToken();

    const accessToken = oauth2.accessToken.create(accessTokenResponse);

    expect(accessToken).to.have.property('token');
    expect(accessToken).to.have.property('refresh');
    expect(accessToken).to.have.property('revoke');
    expect(accessToken).to.have.property('expired');
  });

  it('assigns the access token property when is already a date', () => {
    const accessTokenResponse = chance.accessToken({
      expired: true,
      parseDate: true,
      expireMode: 'expires_at',
    });

    const accessToken = oauth2.accessToken.create(accessTokenResponse);

    expect(isDate(accessToken.token.expires_at)).to.be.equal(true);
    expect(isValid(accessToken.token.expires_at)).to.be.equal(true);
  });

  it('parses the expires_at property as date when set', () => {
    const accessTokenResponse = chance.accessToken({
      expired: true,
      parseDate: false,
      expireMode: 'expires_at',
    });

    const accessToken = oauth2.accessToken.create(accessTokenResponse);

    expect(isDate(accessToken.token.expires_at)).to.be.equal(true);
    expect(isValid(accessToken.token.expires_at)).to.be.equal(true);
  });

  it('computes the expires_at property when only expires_in is present', () => {
    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const today = new Date();
    const accessToken = oauth2.accessToken.create(accessTokenResponse);

    expect(isDate(accessToken.token.expires_at)).to.be.equal(true);
    expect(isValid(accessToken.token.expires_at)).to.be.equal(true);

    const diffInSeconds = differenceInSeconds(accessToken.token.expires_at, today);
    expect(diffInSeconds).to.be.equal(accessTokenResponse.expires_in);
  });
});

describe('on token expiration verification', () => {
  it('returns true when expired', () => {
    const accessTokenResponse = chance.accessToken({
      expired: true,
      expireMode: 'expires_at',
    });

    const accessToken = oauth2.accessToken.create(accessTokenResponse);

    expect(accessToken.expired()).to.be.equal(true);
  });

  it('returns false when no expired', () => {
    const accessTokenResponse = chance.accessToken({
      expired: false,
      expireMode: 'expires_at',
    });

    const accessToken = oauth2.accessToken.create(accessTokenResponse);

    expect(accessToken.expired()).to.be.equal(false);
  });
});

describe('on token refresh', () => {
  it('creates a new access token with default params', async () => {
    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const refreshParams = {
      grant_type: 'refresh_token',
      refresh_token: accessTokenResponse.refresh_token,
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/oauth/token', qs.stringify(refreshParams))
      .reply(200, accessTokenResponse);

    const accessToken = oauth2.accessToken.create(accessTokenResponse);
    const refreshAccessToken = await accessToken.refresh();

    scope.done();
    expect(refreshAccessToken.token).to.have.property('access_token');
  });

  it('creates a new access token with custom params', async () => {
    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const refreshParams = {
      scope: 'TESTING_EXAMPLE_SCOPES',
      grant_type: 'refresh_token',
      refresh_token: accessTokenResponse.refresh_token,
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/oauth/token', qs.stringify(refreshParams))
      .reply(200, accessTokenResponse);

    const accessToken = oauth2.accessToken.create(accessTokenResponse);
    const refreshAccessToken = await accessToken.refresh({
      scope: 'TESTING_EXAMPLE_SCOPES',
    });

    scope.done();
    expect(refreshAccessToken.token).to.have.property('access_token');
  });

  it('creates a new access token with custom tokenPath', async () => {
    const customModuleConfig = defaultsDeep({}, moduleConfig, {
      auth: {
        tokenPath: '/the-custom/path',
      },
    });

    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const oauth2WithCustomOptions = oauth2Module.create(customModuleConfig);

    const refreshParams = {
      scope: 'TESTING_EXAMPLE_SCOPES',
      grant_type: 'refresh_token',
      refresh_token: accessTokenResponse.refresh_token,
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/the-custom/path', qs.stringify(refreshParams))
      .reply(200, accessTokenResponse);

    const accessToken = oauth2WithCustomOptions.accessToken.create(accessTokenResponse);
    const refreshAccessToken = await accessToken.refresh({ scope: 'TESTING_EXAMPLE_SCOPES' });

    scope.done();
    expect(refreshAccessToken.token).to.have.property('access_token');
  });
});

describe('on token revoke', () => {
  it('perform an access token revoke', async () => {
    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const revokeParams = {
      token: accessTokenResponse.access_token,
      token_type_hint: 'access_token',
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/oauth/revoke', qs.stringify(revokeParams))
      .reply(200);

    const accessToken = oauth2.accessToken.create(accessTokenResponse);
    await accessToken.revoke('access_token');

    scope.done();
  });

  it('perform a refresh token revoke', async () => {
    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const revokeParams = {
      token: accessTokenResponse.refresh_token,
      token_type_hint: 'refresh_token',
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/oauth/revoke', qs.stringify(revokeParams))
      .reply(200);

    const accessToken = oauth2.accessToken.create(accessTokenResponse);
    await accessToken.revoke('refresh_token');

    scope.done();
  });

  it('performs a token revoke with custom revokePath', async () => {
    const customModuleConfig = defaultsDeep({}, moduleConfig, {
      auth: {
        revokePath: '/the-custom/revoke-path',
      },
    });

    const oauth2WithCustomOptions = oauth2Module.create(customModuleConfig);

    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const revokeParams = {
      token: accessTokenResponse.refresh_token,
      token_type_hint: 'refresh_token',
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/the-custom/revoke-path', qs.stringify(revokeParams))
      .reply(200);

    const accessToken = oauth2WithCustomOptions.accessToken.create(accessTokenResponse);
    await accessToken.revoke('refresh_token');

    scope.done();
  });

  it('revokes access and refresh tokens', async () => {
    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const refreshTokenRevokeParams = {
      token: accessTokenResponse.refresh_token,
      token_type_hint: 'refresh_token',
    };

    const accessTokenRevokeParams = {
      token: accessTokenResponse.access_token,
      token_type_hint: 'access_token',
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/oauth/revoke', qs.stringify(accessTokenRevokeParams))
      .reply(200)
      .post('/oauth/revoke', qs.stringify(refreshTokenRevokeParams))
      .reply(200);

    const accessToken = oauth2.accessToken.create(accessTokenResponse);
    await accessToken.revokeAll();

    scope.done();
  });

  it('revokes refresh token only when access token is revoked', async () => {
    const accessTokenResponse = chance.accessToken({
      expireMode: 'expires_in',
    });

    const accessTokenRevokeParams = {
      token: accessTokenResponse.access_token,
      token_type_hint: 'access_token',
    };

    const scope = nock('https://authorization-server.org:443', scopeOptions)
      .post('/oauth/revoke', qs.stringify(accessTokenRevokeParams))
      .reply(500);

    const accessToken = oauth2.accessToken.create(accessTokenResponse);

    try {
      await accessToken.revokeAll();

      expect(false).to.be.equal(true, 'An error was expected');
    } catch (err) {
      // we check for a boom internal status code to verify the error produced
      // is the expected (500) and not one produced for failed requests to nock
      expect(err).to.be.an('Error');
      expect(err.isBoom).to.be.equal(true);
      expect(err.output.statusCode).to.be.equal(500);
    }

    // If the scope is done, then no additional refresh token request was made
    scope.done();
  });
});
