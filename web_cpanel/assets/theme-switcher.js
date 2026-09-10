(() => {
  const themes=[
    ['1','Đỏ'],['2','Tím'],['3','Xanh dương'],['4','Xanh lá'],['5','Vàng'],['6','Hồng xanh'],['7','Cyan']
  ];
  const apply=(n)=>{document.body.className=document.body.className.replace(/\btheme-(?:rainbow|[1-7])\b/g,'').trim();document.body.classList.add('theme-'+n);localStorage.setItem('tainhac-theme',n);const b=document.getElementById('themeSwitch');if(b){b.dataset.theme=n;b.textContent='🎨 '+themes[Number(n)-1][1]+' '+n+'/7';}};
  const init=()=>{const nav=document.querySelector('.nav nav');if(!nav||document.getElementById('themeSwitch'))return;const b=document.createElement('button');b.id='themeSwitch';b.type='button';b.className='theme-switcher';b.title='Đổi màu giao diện';b.setAttribute('aria-label','Đổi màu giao diện');b.addEventListener('click',()=>apply(String((Number(localStorage.getItem('tainhac-theme')||'1')%7)+1)));nav.appendChild(b);apply(localStorage.getItem('tainhac-theme')||'1');};
  document.addEventListener('DOMContentLoaded',init);
})();
