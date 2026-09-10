/* TaiNhacMP3 format switch fix: MP4/MP3 button label + API payload stay synchronized. */
(() => {
  const selectedFormat = () => document.querySelector('input[name="format"]:checked')?.value?.toLowerCase() === 'mp3' ? 'mp3' : 'mp4';

  const updateButton = () => {
    const btn = document.getElementById('cutBtn');
    if (!btn) return;
    const format = selectedFormat();
    const arrow = btn.querySelector('span');
    btn.childNodes.forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) n.textContent = format === 'mp3' ? '✂ Cắt MP3 ' : '✂ Cắt video ';
    });
    if (arrow) arrow.textContent = '→';
    btn.dataset.outputFormat = format;
    btn.setAttribute('aria-label', format === 'mp3' ? 'Cắt MP3' : 'Cắt video');
  };

  const hook = () => {
    document.querySelectorAll('input[name="format"]').forEach(r => {
      if (r.dataset.formatFix === '1') return;
      r.dataset.formatFix = '1';
      r.addEventListener('change', () => setTimeout(updateButton, 0));
    });
    updateButton();
  };

  if (!window.__TAINHAC_FORMAT_FETCH_FIXED__) {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      try {
        const url = typeof input === 'string' ? input : (input?.url || '');
        if (url.includes('/api/cut') && init?.body) {
          const body = typeof init.body === 'string' ? JSON.parse(init.body) : null;
          if (body && typeof body === 'object') {
            body.format = selectedFormat();
            init = {...init, body: JSON.stringify(body)};
            if (init.headers && !(init.headers instanceof Headers)) {
              init.headers = {...init.headers, 'Content-Type': 'application/json'};
            }
          }
        }
      } catch (_) {}
      return originalFetch(input, init);
    };
    window.__TAINHAC_FORMAT_FETCH_FIXED__ = true;
  }

  new MutationObserver(hook).observe(document.body, {subtree:true, childList:true});
  hook();
})();
