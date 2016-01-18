module.exports = {

  name: 'Simple OAuth2',

  /**
   * Verify if a given object actually have valid properties
   * @param  {Object}  ob Object to evaluate
   * @return {Boolean}    Indicates if the object has valid properties
   */
  isEmpty: function isEmpty(ob) {
    var i;
    for (i in ob) {
      if (ob.hasOwnProperty(i)) {
        return false;
      }
    }

    return true;
  },

  /**
   * Merge a set of default options with the provided options object
   * @param  {Object} o1 Default options
   * @param  {Object} o2 Provided options
   * @return {Object}    Merged options
   */
  mergeDefaults: function mergeDefaults(o1, o2) {
    var p;
    for (p in o2) {
      if (!o2.hasOwnProperty(p)) continue;

      try {
        if (typeof o2[p] === 'object') {
          o1[p] = mergeDefaults(o1[p], o2[p]);
        } else if (typeof o1[p] === 'undefined') {
          o1[p] = o2[p];
        }
      } catch (e) {
        o1[p] = o2[p];
      }
    }
    return o1;
  },

  /**
   * Create a safe set of default options
   * @param  {Object} config   Provided options
   * @param  {Object} defaults Default options
   * @return {Object}          Safe options
   */
  configure: function configure(config, defaults) {
    config = config || {};
    this.mergeDefaults(config, defaults);

    return config;
  },

  /**
   * Get the authorization header used to request a valid token
   * @param  {String} clientID
   * @param  {String} clientSecret
   * @return {String}              Authorization header string token
   */
  getAuthorizationHeaderToken: function getAuthorizationHeaderToken(clientID, clientSecret) {
    return new Buffer(clientID + ':' + clientSecret).toString('base64');
  },

  log: function debugLog(message) {
    if (process.env.DEBUG) {
      message = this.name + ' : ' + message;

      console.log.apply(console, arguments);
    }
  }
};
