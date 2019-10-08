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
  static forGrant(grantType, params) {
    const baseParams = {
      grant_type: grantType,
    };

    return new GrantParams(baseParams, params);
  }

  constructor(baseParams, params) {
    this.params = params;
    this.baseParams = baseParams;
    this.scopeParams = getScopeParam(this.params.scope);
  }

  toObject() {
    return Object.assign(this.baseParams, this.params, this.scopeParams);
  }
};
