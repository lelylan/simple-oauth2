'use strict';

const coreModule = require('./../core');

/**
 * Client credentials flow implementation
 * @param  {Object} config
 */
module.exports = function (config) {
  const core = coreModule(config);

  /**
   * Returns the Access Token Object
   * @param  {Object}   params
   *         params.scope - A string that represents the application privileges
   * @param  {Function} callback The callback function returning the results
   *                             An error object is passed as first argument and the result as last
   */
  function getToken(params, callback) {
    params.grant_type = 'client_credentials';

    return core
      .api('POST', config.tokenPath, params)
      .nodeify(callback);
  }

  return {
    getToken,
  };
};
