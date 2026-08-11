// src/migrate.js — payload migration to the current schema. Pure.
(function (root, factory) { var api = factory(root); if (typeof module!=='undefined'&&module.exports) module.exports=api; root.HJ=root.HJ||{}; root.HJ.migrate=api; })(typeof self!=='undefined'?self:this, function (root) {
  // v1 -> v3: dailyLogs entries gain updatedAt (Bundle 8) and mealsLog (meals-intake-
  // tracking). A field a day already has is left completely alone; one that lacks it
  // gets a safe default (updatedAt: null — never wins a merge against a real timestamp,
  // see store.js importPayload; mealsLog: [] — "nothing logged", not "unknown").
  function migrate(payload) {
    var state = payload.state;
    if (!state || !Array.isArray(state.dailyLogs)) return { state: state };
    var nextDailyLogs = state.dailyLogs.map(function (d) {
      var needsUpdatedAt = !(d && Object.prototype.hasOwnProperty.call(d, 'updatedAt'));
      var needsMealsLog = !(d && Object.prototype.hasOwnProperty.call(d, 'mealsLog'));
      if (!needsUpdatedAt && !needsMealsLog) return d;
      var copy = {};
      for (var k in d) if (Object.prototype.hasOwnProperty.call(d, k)) copy[k] = d[k];
      if (needsUpdatedAt) copy.updatedAt = null;
      if (needsMealsLog) copy.mealsLog = [];
      return copy;
    });
    var nextState = {};
    for (var sk in state) if (Object.prototype.hasOwnProperty.call(state, sk)) nextState[sk] = state[sk];
    nextState.dailyLogs = nextDailyLogs;
    return { state: nextState };
  }
  return { migrate: migrate };
});
