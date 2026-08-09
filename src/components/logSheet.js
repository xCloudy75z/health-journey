// src/components/logSheet.js — the "Log today" entry sheet → store.setDay (field-level merge).
// NOT pure (DOM). Reads each segment's selection by an explicit data-value check (never
// truthiness of the value — 0 is a real value), builds a form, and delegates the
// form→patch mapping to the pure, tested HJ.entry.buildEntryPatch.
(function () {
  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  function open(store, dateStr, onSaved) {
    var prev = store.getDay(dateStr) || {};
    var host = document.getElementById('app') || document.body;
    var dateLabel = HJ.format.formatDateShort(dateStr, dateStr) === 'Today'
      ? 'Log today' : 'Log · ' + dateStr;

    var wrap = h(
      '<div class="sheet-wrap open" id="logSheetWrap">' +
        '<div class="scrim" data-close="1"></div>' +
        '<div class="sheet" role="dialog" aria-modal="true" aria-label="Log today">' +
          '<div class="sheet-chrome">' +
            '<div class="handle"></div>' +
            '<div class="sheet-head"><h2 class="sheet-title">' + dateLabel + '</h2>' +
              '<button class="sheet-close" data-close="1" aria-label="Close">✕</button></div>' +
          '</div>' +
          '<div class="field">' +
            '<label>Weight (kg) — morning, after toilet, before food</label>' +
            '<input class="input input-lg" id="ls-weight" inputmode="decimal" placeholder="—">' +
            '<div class="input-err" id="ls-weight-err" hidden>Enter a weight between 30 and 400 kg, or leave it blank.</div>' +
          '</div>' +
          '<div class="field">' +
            '<label>Walked (minutes)</label>' +
            '<div class="qa-row" id="ls-qa">' +
              '<button class="qa" type="button" data-min="0">0</button>' +
              '<button class="qa" type="button" data-min="15">15</button>' +
              '<button class="qa" type="button" data-min="30">30</button>' +
              '<button class="qa" type="button" data-min="45">45</button>' +
            '</div>' +
            '<input class="input" id="ls-walked" inputmode="numeric" placeholder="or type minutes" style="margin-top:9px">' +
          '</div>' +
          '<div class="field">' +
            '<label>Medicine taken correctly?</label>' +
            '<div class="seg dose" id="ls-dose">' +
              '<button type="button" data-value="correct" data-kind="ok">✓ Correct</button>' +
              '<button type="button" data-value="incorrect" data-kind="no">Incorrect</button>' +
              '<button type="button" data-value="missed" data-kind="no">Missed</button>' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<label>Side effects</label>' +
            '<div class="seg" id="ls-side">' +
              '<button type="button" data-value="0">0 · None</button>' +
              '<button type="button" data-value="1">1 · Mild</button>' +
              '<button type="button" data-value="2">2 · Disruptive</button>' +
              '<button type="button" data-value="3">3 · Stopped me</button>' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<label>Stuck to the plan?</label>' +
            '<div class="seg" id="ls-adh">' +
              '<button type="button" data-value="0">0 · Off</button>' +
              '<button type="button" data-value="1">1 · Partial</button>' +
              '<button type="button" data-value="2">2 · Mostly</button>' +
              '<button type="button" data-value="3">3 · Fully</button>' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<label>Note (optional)</label>' +
            '<input class="input" id="ls-note" placeholder="How you felt, anything worth telling Dr Ola…">' +
          '</div>' +
          '<div class="save-row"><button class="btn btn-primary" id="ls-save" type="button">Save</button></div>' +
        '</div>' +
      '</div>'
    );
    host.appendChild(wrap);

    var elWeight = wrap.querySelector('#ls-weight');
    var elWalked = wrap.querySelector('#ls-walked');
    var segDose = wrap.querySelector('#ls-dose');
    var segSide = wrap.querySelector('#ls-side');
    var segAdh = wrap.querySelector('#ls-adh');
    var elNote = wrap.querySelector('#ls-note');
    var qaRow = wrap.querySelector('#ls-qa');

    // Prefill from the stored day (nulls stay blank/unselected).
    if (typeof prev.weightKg === 'number') elWeight.value = prev.weightKg;
    if (typeof prev.walkedMin === 'number') elWalked.value = prev.walkedMin;
    if (typeof prev.note === 'string') elNote.value = prev.note;
    selectByValue(segDose, prev.dose == null ? null : String(prev.dose));
    selectByValue(segSide, prev.sideEffects == null ? null : String(prev.sideEffects));
    selectByValue(segAdh, prev.adherence == null ? null : String(prev.adherence));

    // BB12: track whether the user touched anything, so a scrim/close tap on a
    // filled-but-unsaved entry asks before discarding. Prefill above is programmatic
    // (no input events) so `dirty` stays false on open.
    var dirty = false;
    function markDirty() { dirty = true; }
    var errEl = wrap.querySelector('#ls-weight-err');
    function clearWeightError() { elWeight.classList.remove('error'); if (errEl) errEl.hidden = true; }

    // Segment single-select with toggle-off (click a selected chip to clear it → unset).
    function wireSeg(seg, isDose) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !seg.contains(b)) return;
        markDirty();
        var wasSel = b.classList.contains('sel');
        [].forEach.call(seg.querySelectorAll('button'), function (x) { x.classList.remove('sel', 'ok', 'no'); });
        if (!wasSel) { b.classList.add('sel'); if (isDose && b.getAttribute('data-kind')) b.classList.add(b.getAttribute('data-kind')); }
      });
    }
    wireSeg(segDose, true); wireSeg(segSide, false); wireSeg(segAdh, false);

    elWeight.addEventListener('input', function () { markDirty(); clearWeightError(); });
    elNote.addEventListener('input', markDirty);

    // Quick-walk chips fill the free input; typing clears the chip selection.
    qaRow.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      markDirty();
      [].forEach.call(qaRow.querySelectorAll('.qa'), function (x) { x.classList.remove('sel'); });
      b.classList.add('sel'); elWalked.value = b.getAttribute('data-min');
    });
    elWalked.addEventListener('input', function () {
      markDirty();
      [].forEach.call(qaRow.querySelectorAll('.qa'), function (x) { x.classList.remove('sel'); });
    });

    function selectedValue(seg) {
      var sel = seg.querySelector('button.sel');
      return sel ? sel.getAttribute('data-value') : null;   // explicit selected-check; never value-truthiness
    }
    function selectByValue(seg, value) {
      [].forEach.call(seg.querySelectorAll('button'), function (b) {
        b.classList.remove('sel', 'ok', 'no');
        if (value !== null && b.getAttribute('data-value') === value) {
          b.classList.add('sel');
          var kind = b.getAttribute('data-kind'); if (kind) b.classList.add(kind);
        }
      });
    }

    function close() { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
    // BB12: a scrim/✕ dismissal on a dirty entry confirms before discarding.
    wrap.addEventListener('click', function (e) {
      if (e.target.getAttribute && e.target.getAttribute('data-close')) {
        if (dirty && !window.confirm('Discard this entry?')) return;
        close();
      }
    });

    wrap.querySelector('#ls-save').addEventListener('click', function () {
      // BB5: weight is the only hard-validated field. If it is non-empty but not a
      // real number in 30–400 kg, block the save, keep the sheet open, flag the input.
      var weightRaw = elWeight.value.trim();
      if (weightRaw !== '') {
        var wv = Number(weightRaw);
        if (isNaN(wv) || wv < 30 || wv > 400) {
          elWeight.classList.add('error');
          if (errEl) errEl.hidden = false;
          elWeight.focus();
          return;
        }
      }
      clearWeightError();
      var side = selectedValue(segSide);
      var adh = selectedValue(segAdh);
      var form = {
        weight: elWeight.value,
        walked: elWalked.value,
        dose: selectedValue(segDose),                 // null when unselected → merge preserves prior
        sideEffects: side === null ? null : Number(side),
        adherence: adh === null ? null : Number(adh),
        note: elNote.value
      };
      var patch = HJ.entry.buildEntryPatch(form);
      store.setDay(dateStr, patch);
      close();
      if (HJ.toast) HJ.toast('Saved');
      if (typeof onSaved === 'function') onSaved();
    });
  }

  (self.HJ = self.HJ || {}).logSheet = { open: open };
})();
