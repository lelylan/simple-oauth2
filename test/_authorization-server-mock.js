'use strict';

const url = require('url');
const nock = require('nock');
const merge = require('lodash/merge');

const accessToken = {
  access_token: '5683E74C-7514-4426-B64F-CF0C24223F69',
  refresh_token: '8D175C5F-AE24-4333-8795-332B3BDA8FE3',
  token_type: 'bearer',
  expires_in: '240000',
};

function createAuthorizationServer(authorizationServerUrl) {
  function tokenSuccessWithCustomPath(path, scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post(path, params)
      .reply(200, accessToken);
  }

  function tokenSuccessWithRedirections(redirectionHost, scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .times(19)
      .reply(301, null, {
        Location: url.resolve(authorizationServerUrl, '/oauth/token'),
      })
      .post('/oauth/token', params)
      .reply(301, null, {
        Location: url.resolve(redirectionHost, '/oauth/token'),
      });
  }

  function tokenSuccess(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .reply(200, accessToken);
  }

  function tokenError(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .reply(500);
  }

  function tokenAuthorizationError(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .reply(401);
  }

  function tokenRevokeSuccess(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/revoke', params)
      .reply(200);
  }

  function tokenRevokeSuccessWithCustomPath(path, scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post(path, params)
      .reply(200);
  }

  function tokenRevokeError(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/revoke', params)
      .reply(500);
  }

  function tokenRevokeAllSuccess(scopeOptions, accessTokenParams, refreshTokenParams) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/revoke', accessTokenParams)
      .reply(200)
      .post('/oauth/revoke', refreshTokenParams)
      .reply(200);
  }

  function tokenSuccessWithNonJSONContent(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .reply(200, '<html>Sorry for not responding with a json response</html>', {
        'Content-Type': 'application/html',
      });
  }

  return {
    tokenError,
    tokenAuthorizationError,
    tokenRevokeError,
    tokenRevokeSuccess,
    tokenRevokeAllSuccess,
    tokenRevokeSuccessWithCustomPath,
    tokenSuccessWithNonJSONContent,
    tokenSuccessWithRedirections,
    tokenSuccessWithCustomPath,
    tokenSuccess,
  };
}

function getAccessToken() {
  return accessToken;
}

function getJSONEncodingScopeOptions(options) {
  return merge({
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }, options);
}

function getFormEncodingScopeOptions(options) {
  return merge({
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }, options);
}

function getHeaderCredentialsScopeOptions(options) {
  return merge({
    reqheaders: {
      Accept: 'application/json',
      Authorization: 'Basic dGhlK2NsaWVudCtpZDp0aGUrY2xpZW50K3NlY3JldA==',
    },
  }, options);
}

module.exports = {
  getAccessToken,
  createAuthorizationServer,
  getJSONEncodingScopeOptions,
  getFormEncodingScopeOptions,
  getHeaderCredentialsScopeOptions,
};
