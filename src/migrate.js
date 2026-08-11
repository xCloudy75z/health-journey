// src/migrate.js — payload migration to the current schema. Pure.
(function (root, factory) { var api = factory(root); if (typeof module!=='undefined'&&module.exports) module.exports=api; root.HJ=root.HJ||{}; root.HJ.migrate=api; })(typeof self!=='undefined'?self:this, function (root) {
  // v1 -> v2: dailyLogs entries gain updatedAt (Bundle 8 log-sync spec). A day already
  // carrying updatedAt is left alone; one that lacks it gets null (never wins a merge
  // against a real timestamp — see store.js importPayload).
  function migrate(payload) {
    var state = payload.state;
    if (!state || !Array.isArray(state.dailyLogs)) return { state: state };
    var nextDailyLogs = state.dailyLogs.map(function (d) {
      if (d && Object.prototype.hasOwnProperty.call(d, 'updatedAt')) return d;
      var copy = {};
      for (var k in d) if (Object.prototype.hasOwnProperty.call(d, k)) copy[k] = d[k];
      copy.updatedAt = null;
      return copy;
    });
    var nextState = {};
    for (var sk in state) if (Object.prototype.hasOwnProperty.call(state, sk)) nextState[sk] = state[sk];
    nextState.dailyLogs = nextDailyLogs;
    return { state: nextState };
  }
  return { migrate: migrate };
});
