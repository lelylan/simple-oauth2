'use strict';

const coreModule = require('./../core');

/**
 * Clients credentials flow implementation
 */
module.exports = (config) => {
  const core = coreModule(config);

  /**
   * Returns the Access Token Object
   * @param  {Object} params
   * @param  {String} params.scope A string that represents the application privileges
   * @return {Promise}
   */
  async function getToken(params) {
    const options = Object.assign({}, params, {
      grant_type: 'client_credentials',
    });

    return core.request(config.auth.tokenPath, options);
  }

  return {
    getToken,
  };
};
