'use strict';

const has = (...args) => Object.prototype.hasOwnProperty.call(...args);
const hasIn = (object, propertyName) => propertyName in object;

module.exports = {
  has,
  hasIn,
};
