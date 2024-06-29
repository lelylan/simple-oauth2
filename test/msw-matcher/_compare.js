'use strict';

const diff = require('diff');

const createSelector = (obj, matcher, selector = {}) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(matcher)) {
    if (Object.hasOwn(obj, key)) {
      if (typeof value === 'object' && value !== null) {
        // eslint-disable-next-line no-param-reassign
        selector[key] ??= {};
        createSelector(obj[key], value, selector[key]);
      } else {
        // eslint-disable-next-line no-param-reassign
        selector[key] = obj[key];
      }
    }
  }

  return selector;
};

const comparePartial = (actual, expected) => {
  const selector = createSelector(actual, expected);
  const result = diff.diffJson(selector, expected);
  const changes = result.reduce((res, part) => res && !part.added && !part.removed, true);

  return {
    pass: changes,
  };
};

module.exports = { comparePartial };
