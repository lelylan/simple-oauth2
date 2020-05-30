'use strict';

const { URL } = require('url');
const nock = require('nock');
const Hoek = require('@hapi/hoek');
const Boom = require('@hapi/boom');

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
      .reply(200, accessToken, {
        'Content-Type': 'application/json',
      });
  }

  function tokenSuccessWithRedirections(redirectionHost, scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .times(19)
      .reply(301, null, {
        Location: new URL('/oauth/token', authorizationServerUrl),
      })
      .post('/oauth/token', params)
      .reply(301, null, {
        Location: new URL('/oauth/token', redirectionHost),
      });
  }

  function tokenSuccess(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .reply(200, accessToken, {
        'Content-Type': 'application/json',
      });
  }

  function tokenError(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .reply(500, Boom.badImplementation(), {
        'Content-Type': 'application/json',
      });
  }

  function tokenAuthorizationError(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/token', params)
      .reply(401, Boom.unauthorized(), {
        'Content-Type': 'application/json',
      });
  }

  function tokenRevokeSuccess(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/revoke', params)
      .reply(240, null, {
        'Content-Type': 'application/json',
      });
  }

  function tokenRevokeSuccessWithCustomPath(path, scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post(path, params)
      .reply(204, null, {
        'Content-Type': 'application/json',
      });
  }

  function tokenRevokeError(scopeOptions, params) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/revoke', params)
      .reply(500, Boom.badImplementation(), {
        'Content-Type': 'application/json',
      });
  }

  function tokenRevokeAllSuccess(scopeOptions, accessTokenParams, refreshTokenParams) {
    return nock(authorizationServerUrl, scopeOptions)
      .post('/oauth/revoke', accessTokenParams)
      .reply(204, null, {
        'Content-Type': 'application/json',
      })
      .post('/oauth/revoke', refreshTokenParams)
      .reply(204, null, {
        'Content-Type': 'application/json',
      });
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

function getJSONEncodingScopeOptions(options = {}) {
  return Hoek.applyToDefaults({
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }, options);
}

function getFormEncodingScopeOptions(options = {}) {
  return Hoek.applyToDefaults({
    reqheaders: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }, options);
}

function getHeaderCredentialsScopeOptions(options = {}) {
  return Hoek.applyToDefaults({
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
