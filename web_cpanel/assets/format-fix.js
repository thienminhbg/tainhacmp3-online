/* TaiNhacMP3: MP4/MP3 button label only. Keep the existing app API flow untouched. */
(() => {
  const getFormat = () => {
    const el = document.querySelector('input[name="format"]:checked');
    return el && String(el.value).toLowerCase() === 'mp3' ? 'mp3' : 'mp4';
  };

  const updateButton = () => {
    const btn = document.getElementById('cutBtn');
    if (!btn) return;
    const format = getFormat();
    const arrow = btn.querySelector('span');
    Array.from(btn.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = format === 'mp3' ? '✂ Cắt MP3 ' : '✂ Cắt video ';
      }
    });
    if (arrow) arrow.textContent = '→';
    btn.dataset.outputFormat = format;
    btn.setAttribute('aria-label', format === 'mp3' ? 'Cắt MP3' : 'Cắt video');
  };

  document.addEventListener('change', event => {
    if (event.target && event.target.matches('input[name="format"]')) {
      updateButton();
    }
  });

  const observer = new MutationObserver(updateButton);
  observer.observe(document.body, {subtree: true, childList: true});

  updateButton();
})();
