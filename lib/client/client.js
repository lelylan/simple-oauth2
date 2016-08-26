'use strict';

const coreModule = require('./../core');

/**
 * Clients credentials flow implementation
 */
module.exports = function (config) {
  const core = coreModule(config);

  /**
   * Returns the Access Token Object
   * @param  {String} params.scope A string that represents the application privileges
   * @param  {Function} callback
   * @return {Promise}
   */
  function getToken(params, callback) {
    const options = Object.assign({}, params);
    options.grant_type = 'client_credentials';

    return core
      .api('POST', config.tokenPath, options)
      .nodeify(callback);
  }

  return {
    getToken,
  };
};
