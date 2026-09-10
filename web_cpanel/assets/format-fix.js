/* TaiNhacMP3: keep the cut button label synchronized with the selected MP4/MP3 format. */
(() => {
  const getFormat = () => {
    const el = document.querySelector('input[name="format"]:checked');
    return el && String(el.value).toLowerCase() === 'mp3' ? 'mp3' : 'mp4';
  };

  const updateButton = () => {
    const btn = document.getElementById('cutBtn');
    if (!btn) return;
    const format = getFormat();
    const wanted = format === 'mp3' ? '✂ Cắt MP3 ' : '✂ Cắt video ';
    Array.from(btn.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== wanted.trim()) {
        node.textContent = wanted;
      }
    });
    const arrow = btn.querySelector('span');
    if (arrow && arrow.textContent !== '→') arrow.textContent = '→';
    btn.dataset.outputFormat = format;
    btn.setAttribute('aria-label', format === 'mp3' ? 'Cắt MP3' : 'Cắt video');
  };

  document.addEventListener('change', event => {
    if (event.target && event.target.matches('input[name="format"]')) {
      setTimeout(updateButton, 0);
    }
  });

  updateButton();
  setInterval(updateButton, 500);
})();
