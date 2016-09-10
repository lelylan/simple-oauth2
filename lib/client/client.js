'use strict';

const url = require('url');
const coreModule = require('./../core');

/**
 * Clients credentials flow implementation
 */
module.exports = (config) => {
  const core = coreModule(config);
  const tokenUrl = url.resolve(config.auth.tokenHost, config.auth.tokenPath);

  /**
   * Returns the Access Token Object
   * @param  {String} params.scope A string that represents the application privileges
   * @param  {Function} callback
   * @return {Promise}
   */
  function getToken(params, callback) {
    const options = Object.assign({}, params || {}, {
      grant_type: 'client_credentials',
    });

    return core
      .api('POST', tokenUrl, options)
      .nodeify(callback);
  }

  return {
    getToken,
  };
};
