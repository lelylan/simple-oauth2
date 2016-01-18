var appConfig = require('./lib/config');
var utils = require('./lib/utils');

module.exports = function (config) {
  config = utils.configure(config, appConfig);

  return {
    authCode: require('./lib/client/auth-code')(config),
    password: require('./lib/client/password')(config),
    client: require('./lib/client/client')(config),
    accessToken: require('./lib/client/access-token')(config),
    api: require('./lib/core')(config).api
  };
};
