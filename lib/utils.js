module.exports = {
  isEmpty: function isEmpty(ob) {
    var i;
    for (i in ob) {
      if (ob.hasOwnProperty(i)) {
        return false;
      }
    }
    return true;
  },

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
  }
};
