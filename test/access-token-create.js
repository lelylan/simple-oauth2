'use strict';

const test = require('ava');
const {
  isEqual,
  isValid,
  isDate,
  differenceInSeconds,
} = require('date-fns');

const Chance = require('./_chance');
const AccessToken = require('../lib/access-token');
const { Client } = require('../lib/client');
const { has, hasIn } = require('./_property');
const { createModuleConfigWithDefaults: createModuleConfig } = require('./_module-config');

const chance = new Chance();

test('@create => throws an error when no token payload is provided', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  t.throws(() => new AccessToken(config, client), {
    message: /Cannot create access token without a token to parse/,
  });
});

test('@create => creates a new access token instance', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken();
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.truthy(accessToken);
  t.true(has(accessToken, 'token'));
  t.true(hasIn(accessToken, 'refresh'));
  t.true(hasIn(accessToken, 'revoke'));
  t.true(hasIn(accessToken, 'expired'));
});

test('@create => do not reassigns the expires at property when is already a date', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    dateFormat: 'date',
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => parses the expires at property when is UNIX timestamp in seconds', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    dateFormat: 'unix',
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => parses the expires at property when is ISO time', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    dateFormat: 'iso',
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));
});

test('@create => computes the expires at property when only expires in is present', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'expires_in',
  });

  const today = new Date();
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(isDate(accessToken.token.expires_at));
  t.true(isValid(accessToken.token.expires_at));

  const diffInSeconds = differenceInSeconds(accessToken.token.expires_at, today);

  t.is(diffInSeconds, accessTokenResponse.expires_in);
});

test('@create => ignores the expiration parsing when no expiration property is present', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'no_expiration',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.not(has(accessToken.token, 'expires_in'));
  t.not(has(accessToken.token, 'expires_at'));
});

test('@toJSON => serializes the access token information in an equivalent format', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken();

  const accessToken = new AccessToken(config, client, accessTokenResponse);
  const restoredAccessToken = new AccessToken(config, client, JSON.parse(JSON.stringify(accessToken)));

  t.deepEqual(restoredAccessToken.token, accessToken.token);
  t.true(isEqual(restoredAccessToken.token.expires_at, accessToken.token.expires_at));
});
