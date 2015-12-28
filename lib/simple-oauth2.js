var appConfig = require('./config');
var utils = require('./utils');

function configure(config) {
  config = config || {};
  utils.mergeDefaults(config, appConfig);
  return config;
}

module.exports = function (config) {
  config = configure(config);

  return {
    authCode: require('./client/auth-code')(config),
    password: require('./client/password')(config),
    client: require('./client/client')(config),
    accessToken: require('./client/access-token')(config),
    api: require('./core')(config).api
  };
};
