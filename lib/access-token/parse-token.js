'use strict';

const debug = require('debug')('access-token');
const isDate = require('date-fns/is_date');
const parse = require('date-fns/parse');
const addSeconds = require('date-fns/add_seconds');

const parseTokenDateProperties = (token) => {
  const parsedTokenProps = {};

  if ('expires_at' in token) {
    if (!isDate(token.expires_at)) {
      parsedTokenProps.expires_at = parse(token.expires_at);
    }
  } else if ('expires_in' in token) {
    parsedTokenProps.expires_at = addSeconds(
      new Date(),
      Number.parseInt(token.expires_in, 10)
    );
  } else {
    debug('No token expiration property was found. Ignoring date parsing');
  }

  return Object.assign({}, token, parsedTokenProps);
};

module.exports = parseTokenDateProperties;
