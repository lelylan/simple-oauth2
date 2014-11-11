var appConfig = require('./config');

module.exports = function(config) {

  function configure(config) {
    config = config || {};
    mergeDefaults(config, appConfig);
    return config;
  }

  config = configure(config);

  function mergeDefaults(o1, o2) {
    for (var p in o2) {
      try { if (typeof o2[p] == 'object') { o1[p] = mergeDefaults(o1[p], o2[p]); } else if (typeof o1[p] == 'undefined') { o1[p] = o2[p]; } }
      catch(e) { o1[p] = o2[p]; }
    }
    return o1;
  }

  return {
    'authCode': require('./client/auth-code')(config),
    'password': require('./client/password')(config),
    'client': require('./client/client')(config),
    'accessToken': require('./client/access-token')(config),
    'api': require('./core')(config).api
  }
};

