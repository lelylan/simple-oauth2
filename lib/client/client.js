'use strict';

const coreModule = require('./../core');

/**
 * Clients credentials flow implementation
 */
module.exports = (config) => {
  const core = coreModule(config);

  /**
   * Returns the Access Token Object
   * @param  {String} params.scope A string that represents the application privileges
   * @return {Promise}
   */
  function getToken(params) {
    const options = Object.assign({}, params, {
      grant_type: 'client_credentials',
    });

    return core.api('POST', config.auth.tokenPath, options);
  }

  return {
    getToken,
  };
};
