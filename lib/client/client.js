'use strict';

const coreModule = require('./../core');
const encoding = require('./../encoding');

/**
 * Clients credentials flow implementation
 */
module.exports = (config) => {
  const core = coreModule(config);

  /**
   * Returns the Access Token Object
   * @param {Object} params
   * @param {String|Array<String>} params.scope A String or array of strings
   *                                     that represents the application privileges
   * @return {Promise}
   */
  async function getToken(params = {}) {
    const baseParams = {
      grant_type: 'client_credentials',
    };

    const scopeParams = encoding.getScopeParam(params.scope);
    const options = Object.assign(baseParams, params, scopeParams);

    return core.request(config.auth.tokenPath, options);
  }

  return {
    getToken,
  };
};
