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
              '<button type="button" data-value="correct" data-kind="ok" aria-pressed="false">✓ Correct</button>' +
              '<button type="button" data-value="incorrect" data-kind="no" aria-pressed="false">Incorrect</button>' +
              '<button type="button" data-value="missed" data-kind="no" aria-pressed="false">Missed</button>' +
            '</div>' +
            '<div class="seg-hint" hidden>Tap the selected option again to clear it.</div>' +
          '</div>' +
          '<div class="fbox">' +
            '<div class="fbox-h">🫧 How you felt today</div>' +
            '<div class="feelrow"><span class="fl">🤢 Nausea</span>' +
              '<div class="scale" id="ls-f-nausea" data-feel="nausea">' +
                '<button type="button" data-value="0">None</button><button type="button" data-value="1">Mild</button>' +
                '<button type="button" data-value="2">Med</button><button type="button" data-value="3">Bad</button>' +
              '</div></div>' +
            '<div class="feelrow"><span class="fl">🍽️ Appetite</span>' +
              '<div class="scale" id="ls-f-appetite" data-feel="appetite">' +
                '<button type="button" data-value="0">Low</button><button type="button" data-value="1">Some</button>' +
                '<button type="button" data-value="2">Normal</button><button type="button" data-value="3">High</button>' +
              '</div></div>' +
            '<div class="feelrow"><span class="fl">⚡ Energy</span>' +
              '<div class="scale" id="ls-f-energy" data-feel="energy">' +
                '<button type="button" data-value="0">Flat</button><button type="button" data-value="1">OK</button>' +
                '<button type="button" data-value="2">Good</button><button type="button" data-value="3">Great</button>' +
              '</div></div>' +
            '<div class="feelrow"><span class="fl">🚻 Bowels</span>' +
              '<div class="scale" id="ls-f-bowels" data-feel="bowels">' +
                '<button type="button" data-value="0">None</button><button type="button" data-value="1">Slow</button>' +
                '<button type="button" data-value="2">Normal</button><button type="button" data-value="3">Loose</button>' +
              '</div></div>' +
            '<div class="quicknote" id="ls-tags">' +
              '<span class="qn" data-tag="Appetite way down">Appetite way down</span>' +
              '<span class="qn" data-tag="Queasy after pill">Queasy after pill</span>' +
              '<span class="qn" data-tag="Slept well">Slept well</span>' +
              '<span class="qn" data-tag="Couldn\'t finish lunch">Couldn\'t finish lunch</span>' +
              '<span class="qn" data-tag="Bloated">Bloated</span>' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<label>Side effects</label>' +
            '<div class="seg" id="ls-side">' +
              '<button type="button" data-value="0" aria-pressed="false">0 · None</button>' +
              '<button type="button" data-value="1" aria-pressed="false">1 · Mild</button>' +
              '<button type="button" data-value="2" aria-pressed="false">2 · Disruptive</button>' +
              '<button type="button" data-value="3" aria-pressed="false">3 · Stopped me</button>' +
            '</div>' +
            '<div class="seg-hint" hidden>Tap the selected option again to clear it.</div>' +
          '</div>' +
          '<div class="field">' +
            '<label>Stuck to the plan?</label>' +
            '<div class="seg" id="ls-adh">' +
              '<button type="button" data-value="0" aria-pressed="false">0 · Off</button>' +
              '<button type="button" data-value="1" aria-pressed="false">1 · Partial</button>' +
              '<button type="button" data-value="2" aria-pressed="false">2 · Mostly</button>' +
              '<button type="button" data-value="3" aria-pressed="false">3 · Fully</button>' +
            '</div>' +
            '<div class="seg-hint" hidden>Tap the selected option again to clear it.</div>' +
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

    var sheet = wrap.querySelector('.sheet');
    var elWeight = wrap.querySelector('#ls-weight');
    var elWalked = wrap.querySelector('#ls-walked');
    var segDose = wrap.querySelector('#ls-dose');
    var segSide = wrap.querySelector('#ls-side');
    var segAdh = wrap.querySelector('#ls-adh');
    var elNote = wrap.querySelector('#ls-note');
    var qaRow = wrap.querySelector('#ls-qa');
    var feelScales = { nausea: wrap.querySelector('#ls-f-nausea'), appetite: wrap.querySelector('#ls-f-appetite'),
      energy: wrap.querySelector('#ls-f-energy'), bowels: wrap.querySelector('#ls-f-bowels') };
    var tagsRow = wrap.querySelector('#ls-tags');

    // Prefill from the stored day (nulls stay blank/unselected).
    if (typeof prev.weightKg === 'number') elWeight.value = prev.weightKg;
    if (typeof prev.walkedMin === 'number') elWalked.value = prev.walkedMin;
    if (typeof prev.note === 'string') elNote.value = prev.note;
    selectByValue(segDose, prev.dose == null ? null : String(prev.dose));
    selectByValue(segSide, prev.sideEffects == null ? null : String(prev.sideEffects));
    selectByValue(segAdh, prev.adherence == null ? null : String(prev.adherence));

    // BB8: feelings must be prefilled in full (all 4 scales + tags) so a save always
    // resubmits the complete object — store.setDay's merge is shallow at the top level.
    var prevFeel = prev.feelings || {};
    ['nausea', 'appetite', 'energy', 'bowels'].forEach(function (k) {
      selectByValue(feelScales[k], prevFeel[k] == null ? null : String(prevFeel[k]));
    });
    var selectedTags = Array.isArray(prevFeel.tags) ? prevFeel.tags.slice() : [];
    [].forEach.call(tagsRow.querySelectorAll('.qn'), function (q) {
      if (selectedTags.indexOf(q.getAttribute('data-tag')) !== -1) q.classList.add('sel');
    });

    // BB12: track whether the user touched anything, so a scrim/close tap on a
    // filled-but-unsaved entry asks before discarding. Prefill above is programmatic
    // (no input events) so `dirty` stays false on open.
    var dirty = false;
    function markDirty() { dirty = true; }
    var errEl = wrap.querySelector('#ls-weight-err');
    function clearWeightError() { elWeight.classList.remove('error'); if (errEl) errEl.hidden = true; }

    // A12: keep aria-pressed in sync with the visual selection and reveal the "tap again
    // to clear" hint once something is picked (the hint is the .seg-hint sibling in .field).
    function syncSegState(seg) {
      var anySel = false;
      [].forEach.call(seg.querySelectorAll('button'), function (x) {
        var sel = x.classList.contains('sel');
        x.setAttribute('aria-pressed', sel ? 'true' : 'false');
        if (sel) anySel = true;
      });
      var hint = seg.parentNode && seg.parentNode.querySelector('.seg-hint');
      if (hint) hint.hidden = !anySel;
    }

    // Segment single-select with toggle-off (click a selected chip to clear it → unset).
    function wireSeg(seg, isDose) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !seg.contains(b)) return;
        markDirty();
        var wasSel = b.classList.contains('sel');
        [].forEach.call(seg.querySelectorAll('button'), function (x) { x.classList.remove('sel', 'ok', 'no'); });
        if (!wasSel) { b.classList.add('sel'); if (isDose && b.getAttribute('data-kind')) b.classList.add(b.getAttribute('data-kind')); }
        syncSegState(seg);
      });
    }
    wireSeg(segDose, true); wireSeg(segSide, false); wireSeg(segAdh, false);
    ['nausea', 'appetite', 'energy', 'bowels'].forEach(function (k) { wireSeg(feelScales[k], false); });
    tagsRow.addEventListener('click', function (e) {
      var q = e.target.closest('.qn'); if (!q) return;
      markDirty();
      var tag = q.getAttribute('data-tag');
      var idx = selectedTags.indexOf(tag);
      if (idx === -1) { selectedTags.push(tag); q.classList.add('sel'); }
      else { selectedTags.splice(idx, 1); q.classList.remove('sel'); }
    });

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
      syncSegState(seg);   // A12: prefill keeps aria-pressed + the clear-hint accurate
    }

    // A5: keep the sheet — and its sticky Save row — above the on-screen keyboard. iOS
    // Safari does not honour the viewport `interactive-widget` hint, so instead we watch
    // window.visualViewport and lift the sheet by however much the keyboard covers. Fully
    // defensive: a no-op where visualViewport is unavailable (older browsers / desktop).
    var vv = (typeof window !== 'undefined') ? window.visualViewport : null;
    function liftForKeyboard() {
      if (!vv || !sheet) return;
      var covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheet.style.transform = covered > 4 ? 'translateY(-' + covered + 'px)' : '';
    }
    if (vv) { vv.addEventListener('resize', liftForKeyboard); vv.addEventListener('scroll', liftForKeyboard); }

    function close() {
      if (vv) { vv.removeEventListener('resize', liftForKeyboard); vv.removeEventListener('scroll', liftForKeyboard); }
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }
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
      function feelVal(seg) { var v = selectedValue(seg); return v === null ? null : Number(v); }
      var form = {
        weight: elWeight.value,
        walked: elWalked.value,
        dose: selectedValue(segDose),                 // null when unselected → merge preserves prior
        sideEffects: side === null ? null : Number(side),
        adherence: adh === null ? null : Number(adh),
        note: elNote.value,
        feelings: { nausea: feelVal(feelScales.nausea), appetite: feelVal(feelScales.appetite),
          energy: feelVal(feelScales.energy), bowels: feelVal(feelScales.bowels), tags: selectedTags }
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
