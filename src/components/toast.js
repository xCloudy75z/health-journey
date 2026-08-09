// src/components/toast.js — tiny non-blocking toast. NOT pure (uses setTimeout/DOM).
(function(){
  function toast(msg){
    var root=document.getElementById('toast-root'); if(!root) return;
    var el=document.createElement('div'); el.className='toast'; el.textContent=msg;
    root.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add('show'); });
    setTimeout(function(){ el.classList.remove('show'); setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 250); }, 2200);
  }
  (self.HJ=self.HJ||{}).toast=toast;
})();
