'use strict';

const test = require('ava');
const { AuthorizationCode } = require('../index');
const AccessToken = require('../lib/access-token');
const { createModuleConfig } = require('./_module-config');
const { getAccessToken } = require('./_authorization-server-mock');

test('@createToken => creates a new access token instance from a JSON object', async (t) => {
  const oauth2 = new AuthorizationCode(createModuleConfig());
  const accessToken = oauth2.createToken(getAccessToken());

  t.true(accessToken instanceof AccessToken);
});
