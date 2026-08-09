// src/migrate.js — payload migration to the current schema. Pure.
(function (root, factory) { var api = factory(root); if (typeof module!=='undefined'&&module.exports) module.exports=api; root.HJ=root.HJ||{}; root.HJ.migrate=api; })(typeof self!=='undefined'?self:this, function (root) {
  // v1 → v1 identity. Future versions add steps here.
  function migrate(payload) { return { state: payload.state }; }
  return { migrate: migrate };
});
