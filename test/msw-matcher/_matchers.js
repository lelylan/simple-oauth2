'use strict';

const { readBody } = require('./_request-body');
const { comparePartial } = require('./_compare');

const kExpected = Symbol('expected');

const normalize = (obj, options = {}) => {
  const normalized = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = options.normalizeKeys ? key.toLowerCase() : key;

    if (typeof value === 'object' && value !== null) {
      normalized[normalizedKey] ??= {};
      normalize(normalized[normalizedKey]);
    } else {
      // coherse to string
      normalized[normalizedKey] = options.normalizeValues ? `${value}` : value;
    }
  }

  return normalized;
};

class Matcher {
  constructor(expected) {
    this[kExpected] = expected;
  }
}

class BodyMatcher extends Matcher {
  async match(context) {
    const isJSON = context.request.headers.get('content-type') === 'application/json';
    const expected = normalize(this[kExpected], { normalizeKeys: false, normalizeValues: !isJSON });
    const actual = await readBody(context.request);

    return comparePartial(actual, expected);
  }
}

class HeadersMatcher extends Matcher {
  constructor(expected) {
    const expectedValue = normalize(expected, { normalizeKeys: true, normalizeValues: true });
    super(expectedValue);
  }

  async match(context) {
    const expected = this[kExpected];
    const actual = Object.fromEntries(context.request.headers);

    return comparePartial(actual, expected);
  }
}

class URLSearchParamsMatcher extends Matcher {
  constructor(expected) {
    const expectedValue = normalize(expected, { normalizeKeys: false, normalizeValues: true });
    super(expectedValue);
  }

  async match(context) {
    const expected = this[kExpected];
    const actual = Object.fromEntries(context.searchParams);

    return comparePartial(actual, expected);
  }
}

module.exports = { BodyMatcher, HeadersMatcher, URLSearchParamsMatcher };
