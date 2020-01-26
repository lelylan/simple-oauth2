'use strict';

function getScopeParam(scope) {
  if (scope === undefined) {
    return null;
  }

  if (Array.isArray(scope)) {
    return {
      scope: scope.join(' '),
    };
  }

  return {
    scope,
  };
}

module.exports = class GrantParams {
  #params = null;
  #baseParams = null;

  static forGrant(grantType, params) {
    const baseParams = {
      grant_type: grantType,
    };

    return new GrantParams(baseParams, params);
  }

  constructor(baseParams, params) {
    this.#params = { ...params };
    this.#baseParams = { ...baseParams };
  }

  toObject() {
    const scopeParams = getScopeParam(this.#params.scope);

    return Object.assign(this.#baseParams, this.#params, scopeParams);
  }
};
