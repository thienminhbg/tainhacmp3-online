(() => {
  const themes = [
    ['1', '🔴 Đỏ'],
    ['2', '🟣 Tím'],
    ['3', '🔵 Xanh dương'],
    ['4', '🟢 Xanh lá'],
    ['5', '🟡 Vàng'],
    ['6', '🌸 Hồng xanh'],
    ['7', '🩵 Cyan']
  ];

  const apply = (n) => {
    document.body.className = document.body.className
      .replace(/\btheme-(?:rainbow|[1-7])\b/g, '')
      .trim();
    document.body.classList.add('theme-' + n);
    localStorage.setItem('tainhac-theme', n);
  };

  const autoConfirm = () => {
    const input = document.getElementById('url');
    const form = document.getElementById('infoForm');
    if (!input || !form) return;
    const value = input.value.trim();
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(value)) {
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.submit();
    }
  };

  const init = () => {
    const nav = document.querySelector('.nav nav');
    const language = document.getElementById('language');
    if (!nav || !language || document.getElementById('themeSwitch')) return;

    const select = document.createElement('select');
    select.id = 'themeSwitch';
    select.className = 'theme-select';
    select.setAttribute('aria-label', 'Giao diện');
    select.title = 'Chọn giao diện';

    themes.forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = '🎨 ' + label;
      select.appendChild(option);
    });

    const saved = localStorage.getItem('tainhac-theme') || '1';
    select.value = saved;
    select.addEventListener('change', () => apply(select.value));

    language.insertAdjacentElement('afterend', select);
    apply(saved);

    const input = document.getElementById('url');
    const pasteBtn = document.getElementById('pasteBtn');
    if (input) {
      input.addEventListener('paste', () => setTimeout(autoConfirm, 80));
      input.addEventListener('drop', () => setTimeout(autoConfirm, 80));
    }
    if (pasteBtn) pasteBtn.addEventListener('click', () => setTimeout(autoConfirm, 150));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
