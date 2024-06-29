'use strict';

const Hoek = require('@hapi/hoek');
const Boom = require('@hapi/boom');
const { HttpResponse } = require('msw');

const msw = require('./msw-matcher/_index');

const accessToken = {
  access_token: '5683E74C-7514-4426-B64F-CF0C24223F69',
  refresh_token: '8D175C5F-AE24-4333-8795-332B3BDA8FE3',
  token_type: 'bearer',
  expires_in: '240000',
};

function createAuthorizationServer(authorizationServerUrl) {
  function tokenSuccessWithCustomPath(path, scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post(path)
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => HttpResponse.json(accessToken, {
        status: 200,
      }));
  }

  function tokenSuccess(scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/token')
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => HttpResponse.json(accessToken, {
        status: 200,
      }));
  }

  function tokenError(scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/token')
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => HttpResponse.json(Boom.badImplementation(), {
        status: 500,
      }));
  }

  function tokenAuthorizationError(scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/token')
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => HttpResponse.json(Boom.unauthorized(), {
        status: 401,
      }));
  }

  function tokenRevokeSuccess(scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/revoke')
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => new HttpResponse(null, {
        status: 204,
        headers: {
          'Content-Type': 'application/json',
        },
      }));
  }

  function tokenRevokeSuccessWithCustomPath(path, scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post(path)
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => new HttpResponse(null, {
        status: 204,
        headers: {
          'Content-Type': 'application/json',
        },
      }));
  }

  function tokenRevokeError(scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/revoke')
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => HttpResponse.json(Boom.badImplementation(), {
        status: 500,
      }));
  }

  function tokenRevokeAllSuccess(scopeOptions, accessTokenParams, refreshTokenParams) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/revoke')
      .matchBody(accessTokenParams)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => new HttpResponse(null, {
        status: 204,
        headers: {
          'Content-Type': 'application/json',
        },
      }))
      .post('/oauth/revoke')
      .matchBody(refreshTokenParams)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => new HttpResponse(null, {
        status: 204,
        headers: {
          'Content-Type': 'application/json',
        },
      }));
  }

  function tokenSuccessWithNonJSONContent(scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/token')
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => new HttpResponse('<html>Sorry for not responding with a json response</html>', {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }));
  }

  function tokenSuccessWithoutRefreshToken(scopeOptions, params) {
    return msw
      .scope(authorizationServerUrl)
      .post('/oauth/token')
      .matchBody(params)
      .matchHeaders(scopeOptions.reqheaders)
      .handler(() => HttpResponse.json({ ...accessToken, refresh_token: undefined }, {
        status: 200,
      }));
  }

  return {
    tokenError,
    tokenAuthorizationError,
    tokenRevokeError,
    tokenRevokeSuccess,
    tokenRevokeAllSuccess,
    tokenRevokeSuccessWithCustomPath,
    tokenSuccessWithNonJSONContent,
    tokenSuccessWithCustomPath,
    tokenSuccess,
    tokenSuccessWithoutRefreshToken,
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
