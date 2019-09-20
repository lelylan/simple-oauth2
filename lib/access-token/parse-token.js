'use strict';

const debug = require('debug')('access-token');
const isDate = require('date-fns/isDate');
const parseISO = require('date-fns/parseISO');
const addSeconds = require('date-fns/addSeconds');

const parseTokenDateProperties = (token) => {
  const parsedTokenProps = {};

  if ('expires_at' in token) {
    if (!isDate(token.expires_at)) {
      parsedTokenProps.expires_at = parseISO(token.expires_at);
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
