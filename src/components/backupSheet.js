// src/components/backupSheet.js — Export / Import JSON backup. NOT pure (DOM, FileReader).
// Import keeps UNDO (C3): snapshot() before, and an Undo action on the success toast.
(function () {
  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  // Local-date filename (C8) — never toISOString(), which would UTC-skew 00:00–04:00 Dubai.
  function localYMD(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // A one-off toast that carries an Undo button (auto-dismiss ~6s to give time to undo).
  function undoToast(msg, onUndo) {
    var root = document.getElementById('toast-root'); if (!root) return;
    var el = h('<div class="toast"><span>' + msg + '</span><button class="btn btn-ghost" type="button" style="width:auto;padding:6px 12px;margin-inline-start:auto">Undo</button></div>');
    root.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    var t = setTimeout(remove, 6000);
    function remove() { el.classList.remove('show'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250); }
    el.querySelector('button').addEventListener('click', function () { clearTimeout(t); onUndo(); remove(); });
  }

  function open(store, nowISO, onChanged) {
    var host = document.getElementById('app') || document.body;
    var wrap = h(
      '<div class="sheet-wrap open" id="backupSheetWrap">' +
        '<div class="scrim" data-close="1"></div>' +
        '<div class="sheet" role="dialog" aria-modal="true" aria-label="Back up your data">' +
          '<div class="sheet-chrome">' +
            '<div class="handle"></div>' +
            '<div class="sheet-head"><h2 class="sheet-title">Back up your data</h2>' +
              '<button class="sheet-close" data-close="1" aria-label="Close">✕</button></div>' +
          '</div>' +
          '<div id="bk-banner"></div>' +
          '<div class="field"><button class="btn btn-primary" id="bk-export" type="button">⤓ Export backup (JSON)</button></div>' +
          '<div class="field"><button class="btn" id="bk-import" type="button">⤒ Import backup (JSON)</button>' +
            '<input type="file" id="bk-file" accept="application/json,.json" style="display:none">' +
          '</div>' +
          '<div class="banner">💾 Back up weekly — your data lives on this phone. Importing replaces everything currently in the app.</div>' +
        '</div>' +
      '</div>'
    );
    host.appendChild(wrap);

    var banner = wrap.querySelector('#bk-banner');
    var fileInput = wrap.querySelector('#bk-file');

    function close() { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
    wrap.addEventListener('click', function (e) { if (e.target.getAttribute && e.target.getAttribute('data-close')) close(); });

    function showError(msg) { banner.innerHTML = '<div class="banner" style="border-color:var(--bad);background:var(--bad-soft);color:var(--bad)">' + msg + '</div>'; }
    function clearBanner() { banner.innerHTML = ''; }

    // Export — BB8: <a download> is unreliable in iOS standalone (PWA) mode. Prefer the
    // native share sheet (Files / AirDrop / Mail) when it can share the file; otherwise
    // fall back to the blob anchor, guarded so a failure surfaces instead of silently throwing.
    wrap.querySelector('#bk-export').addEventListener('click', function () {
      var payload = store.exportPayload(nowISO);
      var json = JSON.stringify(payload, null, 2);
      var filename = 'health-journey-backup-' + localYMD(new Date()) + '.json';

      var file = null;
      try { file = new File([json], filename, { type: 'application/json' }); } catch (e) { file = null; }
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share({ files: [file], title: 'Health Journey backup' })
          .then(function () { if (HJ.toast) HJ.toast('Backed up'); })
          .catch(function () { /* user cancelled the share sheet — no error */ });
        return;
      }
      try {
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        if (HJ.toast) HJ.toast('Backed up');
      } catch (e) {
        showError('Could not export the backup on this device. Try again from Safari.');
        if (HJ.toast) HJ.toast('Export failed');
      }
    });

    // Import
    wrap.querySelector('#bk-import').addEventListener('click', function () { clearBanner(); fileInput.value = ''; fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var parsed;
        try { parsed = JSON.parse(reader.result); }
        catch (e) { showError('That file is not valid JSON.'); if (HJ.toast) HJ.toast('Import failed'); return; }
        confirmImport(parsed);
      };
      reader.onerror = function () { showError('Could not read that file.'); };
      reader.readAsText(file);
    });

    function confirmImport(parsed) {
      banner.innerHTML =
        '<div class="banner" style="border-color:var(--warn);background:var(--warn-soft);color:var(--warn)">' +
          'Importing replaces all current data. Continue?' +
          '<div class="btn-row"><button class="btn btn-primary" id="bk-confirm" type="button">Replace</button>' +
          '<button class="btn btn-ghost" id="bk-cancel" type="button">Cancel</button></div></div>';
      banner.querySelector('#bk-cancel').addEventListener('click', clearBanner);
      banner.querySelector('#bk-confirm').addEventListener('click', function () {
        var prev = store.snapshot();                 // C3: capture for Undo
        var res = store.importPayload(parsed);
        if (!res.ok) { showError(res.error); if (HJ.toast) HJ.toast('Import rejected'); return; }
        clearBanner();
        close();
        undoToast('Restored', function () { store.restore(prev); if (typeof onChanged === 'function') onChanged(); if (HJ.toast) HJ.toast('Undone'); });
        if (typeof onChanged === 'function') onChanged();
      });
    }
  }

  (self.HJ = self.HJ || {}).backupSheet = { open: open };
})();
