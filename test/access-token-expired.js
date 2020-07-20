'use strict';

const test = require('ava');

const Chance = require('./_chance');
const AccessToken = require('../lib/access-token');
const { Client } = require('../lib/client');
const { createModuleConfigWithDefaults: createModuleConfig } = require('./_module-config');

const chance = new Chance();

test('@expired => returns true when expired', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: true,
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(accessToken.expired());
});

test('@expired => returns true if the token is expiring within the expiration window', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = {
    ...chance.accessToken({
      expireMode: 'expires_in',
    }),
    expires_in: 10,
  };

  const expirationWindowSeconds = 11;
  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.true(accessToken.expired(expirationWindowSeconds));
});

test('@expired => returns false when not expired', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expired: false,
    expireMode: 'expires_at',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.false(accessToken.expired());
});

test('@expired => returns false when no expiration property is present', (t) => {
  const config = createModuleConfig();
  const client = new Client(config);

  const accessTokenResponse = chance.accessToken({
    expireMode: 'no_expiration',
  });

  const accessToken = new AccessToken(config, client, accessTokenResponse);

  t.false(accessToken.expired());
});
