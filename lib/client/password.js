'use strict';

const coreModule = require('./../core');

/**
 * User Password flow implementation
 */
module.exports = function (config) {
  const core = coreModule(config);

  /**
   * Returns the Access Token Object
   * @param  {String} params.username A string that represents the registered username
   * @param  {String} params.password A string that represents the registered password.
   * @param  {String} params.scope A string that represents the application privileges
   * @param  {Function} callback
   * @return {Promise}
   */
  function getToken(params, callback) {
    const options = Object.assign({}, params);
    options.grant_type = 'password';

    return core
      .api('POST', config.tokenPath, options)
      .nodeify(callback);
  }

  return {
    getToken,
  };
};
