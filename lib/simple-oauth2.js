var appConfig = require('./config');
var utils = require('./utils');

module.exports = function (config) {
  config = utils.configure(config, appConfig);

  return {
    authCode: require('./client/auth-code')(config),
    password: require('./client/password')(config),
    client: require('./client/client')(config),
    accessToken: require('./client/access-token')(config),
    api: require('./core')(config).api
  };
};
