// src/entry.js — pure: turn the log-sheet form state into a merge patch.
(function (root, factory) { var api=factory(); if (typeof module!=='undefined'&&module.exports) module.exports=api; root.HJ=root.HJ||{}; root.HJ.entry=api; })(typeof self!=='undefined'?self:this, function () {
  // form = { weight:'', walked:'', dose:null|'correct'|'incorrect'|'missed',
  //          sideEffects:null|0..3, adherence:null|0..3, note:'' }
  // Returns a partial with ONLY the fields the user actually set. 0 is a REAL value.
  function num(s){ if (s===''||s===null||s===undefined) return null; var n=Number(s); return isNaN(n)?null:n; }
  function hasAnyFeeling(f) {
    if (!f) return false;
    return f.nausea != null || f.appetite != null || f.energy != null || f.bowels != null ||
      (Array.isArray(f.tags) && f.tags.length > 0);
  }
  function buildEntryPatch(form){
    var p = {};
    var w = num(form.weight); if (w!==null) p.weightKg = w;
    var wk = num(form.walked); if (wk!==null) p.walkedMin = Math.round(wk);
    if (form.dose!==null && form.dose!==undefined) p.dose = form.dose;      // omit when unselected
    if (form.sideEffects!==null && form.sideEffects!==undefined) p.sideEffects = form.sideEffects; // keeps 0
    if (form.adherence!==null && form.adherence!==undefined) p.adherence = form.adherence;         // keeps 0
    if (typeof form.note==='string') p.note = form.note;
    if (hasAnyFeeling(form.feelings)) p.feelings = form.feelings;   // omit entirely if untouched
    return p;
  }
  return { buildEntryPatch: buildEntryPatch };
});
