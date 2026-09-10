/* TaiNhacMP3 timeline touch fix: prevent accidental selection jumps after dragging on mobile. */
(() => {
  const setup = () => {
    const timeline = document.getElementById('timeline');
    const start = document.getElementById('start');
    const end = document.getElementById('end');
    const durationLabel = document.getElementById('durationLabel');
    if (!timeline || !start || !end || timeline.dataset.touchFixed === '1') return;
    timeline.dataset.touchFixed = '1';
    timeline.style.touchAction = 'none';

    const parse = (v) => {
      const s = String(v || '').trim();
      const p = s.split(':').map(Number);
      if (p.some(Number.isNaN)) return NaN;
      if (p.length === 2) return p[0] * 60 + p[1];
      if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
      return Number(s);
    };
    const fmt = (v) => {
      v = Math.max(0, Math.round(Number(v) || 0));
      const h = Math.floor(v / 3600);
      const m = Math.floor((v % 3600) / 60);
      const s = v % 60;
      return h ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    const getTotal = () => {
      const text = durationLabel?.textContent || '';
      const n = parse(text);
      return Number.isFinite(n) && n > 0 ? n : Math.max(parse(end.value), 1);
    };
    const emit = (el) => el.dispatchEvent(new Event('input', {bubbles:true}));
    let drag = null;

    const move = (e) => {
      if (!drag) return;
      e.preventDefault();
      const r = timeline.getBoundingClientRect();
      const total = getTotal();
      const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const value = Math.round(pct * total);
      if (drag === 'l') {
        const b = parse(end.value);
        start.value = fmt(Math.min(value, b - 1));
        emit(start);
      } else {
        const a = parse(start.value);
        end.value = fmt(Math.max(value, a + 1));
        emit(end);
      }
    };

    timeline.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('.handle');
      if (!handle) return;
      e.preventDefault();
      e.stopPropagation();
      drag = handle.classList.contains('left') ? 'l' : 'r';
      try { timeline.setPointerCapture(e.pointerId); } catch {}
    }, true);
    timeline.addEventListener('pointermove', (e) => {
      if (!drag) return;
      e.preventDefault();
      e.stopPropagation();
      move(e);
    }, true);
    const stop = (e) => {
      if (!drag) return;
      e.preventDefault();
      e.stopPropagation();
      drag = null;
      try { if (timeline.hasPointerCapture(e.pointerId)) timeline.releasePointerCapture(e.pointerId); } catch {}
    };
    timeline.addEventListener('pointerup', stop, true);
    timeline.addEventListener('pointercancel', stop, true);
    timeline.addEventListener('lostpointercapture', () => { drag = null; }, true);
    window.addEventListener('blur', () => { drag = null; });
  };
  const watch = () => setup();
  new MutationObserver(watch).observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class']});
  setInterval(watch, 500);
  watch();
})();
