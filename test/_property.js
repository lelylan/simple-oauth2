export const has = (...args) => Object.prototype.hasOwnProperty.call(...args);
export const hasIn = (object, propertyName) => propertyName in object;
