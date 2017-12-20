'use strict';

const coreModule = require('./../core');

/**
 * User Password flow implementation
 */
module.exports = (config) => {
  const core = coreModule(config);

  /**
   * Returns the Access Token Object
   * @param  {Object} params
   * @param  {String} params.username A string that represents the registered username
   * @param  {String} params.password A string that represents the registered password
   * @param  {String} params.scope A string that represents the application privileges
   * @return {Promise}
   */
  async function getToken(params) {
    const options = Object.assign({}, params, {
      grant_type: 'password',
    });

    return core.request(config.auth.tokenPath, options);
  }

  return {
    getToken,
  };
};
