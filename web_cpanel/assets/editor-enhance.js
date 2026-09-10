/* TaiNhacMP3 editor enhancement: simple minute/second editing. */
(() => {
  const LANG = {
    vi:{trim:'CẮT',setIn:'ĐẶT VÀO',setOut:'ĐẶT RA',start:'BẮT ĐẦU',end:'KẾT THÚC',selected:'THỜI LƯỢNG ĐÃ CHỌN',back5:'Lùi 5 giây',forward5:'Tiến 5 giây',play:'Phát',pause:'Tạm dừng',reset:'Đặt lại'},
    en:{trim:'TRIM',setIn:'SET IN',setOut:'SET OUT',start:'START',end:'END',selected:'SELECTED DURATION',back5:'Back 5 seconds',forward5:'Forward 5 seconds',play:'Play',pause:'Pause',reset:'Reset'},
    fr:{trim:'DÉCOUPER',setIn:'DÉBUT',setOut:'FIN',start:'DÉBUT',end:'FIN',selected:'DURÉE SÉLECTIONNÉE',back5:'Reculer de 5 secondes',forward5:'Avancer de 5 secondes',play:'Lire',pause:'Pause',reset:'Réinitialiser'},
    de:{trim:'SCHNEIDEN',setIn:'START SETZEN',setOut:'ENDE SETZEN',start:'START',end:'ENDE',selected:'AUSGEWÄHLTE DAUER',back5:'5 Sekunden zurück',forward5:'5 Sekunden vor',play:'Abspielen',pause:'Pause',reset:'Zurücksetzen'},
    es:{trim:'CORTAR',setIn:'FIJAR INICIO',setOut:'FIJAR FIN',start:'INICIO',end:'FIN',selected:'DURACIÓN SELECCIONADA',back5:'Retroceder 5 segundos',forward5:'Avanzar 5 segundos',play:'Reproducir',pause:'Pausa',reset:'Restablecer'},
    id:{trim:'POTONG',setIn:'ATUR MULAI',setOut:'ATUR SELESAI',start:'MULAI',end:'SELESAI',selected:'DURASI TERPILIH',back5:'Mundur 5 detik',forward5:'Maju 5 detik',play:'Putar',pause:'Jeda',reset:'Atur ulang'},
    th:{trim:'ตัด',setIn:'ตั้งจุดเริ่ม',setOut:'ตั้งจุดจบ',start:'เริ่ม',end:'สิ้นสุด',selected:'ความยาวที่เลือก',back5:'ย้อนกลับ 5 วินาที',forward5:'เดินหน้า 5 วินาที',play:'เล่น',pause:'หยุดชั่วคราว',reset:'รีเซ็ต'},
    ja:{trim:'トリム',setIn:'開始位置',setOut:'終了位置',start:'開始',end:'終了',selected:'選択した長さ',back5:'5秒戻る',forward5:'5秒進む',play:'再生',pause:'一時停止',reset:'リセット'},
    ko:{trim:'자르기',setIn:'시작 설정',setOut:'끝 설정',start:'시작',end:'종료',selected:'선택한 길이',back5:'5초 뒤로',forward5:'5초 앞으로',play:'재생',pause:'일시정지',reset:'초기화'},
    pt:{trim:'CORTAR',setIn:'DEFINIR INÍCIO',setOut:'DEFINIR FIM',start:'INÍCIO',end:'FIM',selected:'DURAÇÃO SELECIONADA',back5:'Voltar 5 segundos',forward5:'Avançar 5 segundos',play:'Reproduzir',pause:'Pausa',reset:'Redefinir'},
    it:{trim:'TAGLIA',setIn:'IMPOSTA INIZIO',setOut:'IMPOSTA FINE',start:'INIZIO',end:'FINE',selected:'DURATA SELEZIONATA',back5:'Indietro di 5 secondi',forward5:'Avanti di 5 secondi',play:'Riproduci',pause:'Pausa',reset:'Reimposta'}
  };
  const tr=()=>LANG[document.getElementById('language')?.value]||LANG.en;
  const parse=v=>{v=String(v||'').trim();if(/^\d+(?:\.\d+)?$/.test(v))return Number(v);const p=v.split(':').map(Number);if(p.some(Number.isNaN))return NaN;return p.length===2?p[0]*60+p[1]:p.length===3?p[0]*3600+p[1]*60+p[2]:NaN};
  const fmt=s=>{s=Math.max(0,Math.round(Number(s)||0));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=s%60;return h?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`};
  const videoId=()=>{try{const u=new URL(document.getElementById('url')?.value||'');if(u.hostname.includes('youtu.be'))return u.pathname.slice(1).split('/')[0];return u.searchParams.get('v')||((u.pathname.match(/\/(?:shorts|live)\/([^/]+)/)||[])[1]);}catch{return null}};

  function enhance(){
    const ed=document.getElementById('editor'); if(!ed||ed.classList.contains('hidden')||ed.dataset.enhanced)return;
    ed.dataset.enhanced='1';
    const controls=ed.querySelector('.controls'), timeline=ed.querySelector('#timeline'), start=ed.querySelector('#start'), end=ed.querySelector('#end');
    if(!controls||!timeline||!start||!end)return;
    start.type='text'; end.type='text'; start.inputMode='numeric'; end.inputMode='numeric';
    start.setAttribute('autocomplete','off'); end.setAttribute('autocomplete','off');
    const bar=document.createElement('div');bar.className='precision-toolbar';bar.innerHTML=`<button class="p-icon" data-act="back" title="">|◀</button><button class="p-skip" data-act="back">◀ 5s</button><button class="p-play" data-act="play">▶</button><button class="p-skip" data-act="forward">5s ▶</button><button class="p-icon" data-act="forward" title="">▶|</button><button class="p-icon" data-act="reset">↻</button>`;
    const trim=document.createElement('div');trim.className='precision-trim';trim.innerHTML=`<span class="p-trim"></span><button data-act="in" class="p-in">← <span class="p-setin"></span></button><button data-act="out" class="p-out"><span class="p-setout"></span> →</button>`;
    controls.insertBefore(bar,controls.firstChild);controls.insertBefore(trim,bar.nextSibling);
    const durationBox=document.createElement('div');durationBox.className='precision-duration';durationBox.innerHTML=`<span class="p-selected"></span><strong id="precisionDuration">00:00</strong>`;controls.appendChild(durationBox);
    const nudge=label=>{const old=label.querySelector('.nudge');if(!old)return;old.innerHTML='<button type="button" data-step="-1">−1s</button><button type="button" data-step="1">+1s</button>';old.querySelectorAll('button').forEach(b=>b.onclick=()=>{let v=parse(label.querySelector('input').value);if(!Number.isFinite(v))v=0;v+=Number(b.dataset.step);v=Math.max(0,Math.round(v));label.querySelector('input').value=fmt(v);sync()})};
    nudge(start.closest('label'));nudge(end.closest('label'));
    let total=0,playing=false,player=null;
    const playerReady=()=>{const id=videoId();if(!id)return;const preview=ed.querySelector('.preview');if(!preview)return;let frame=preview.querySelector('iframe');if(!frame){frame=document.createElement('iframe');frame.className='precision-video';frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.src=`https://www.youtube.com/embed/${encodeURIComponent(id)}?enablejsapi=1&origin=${encodeURIComponent(location.origin)}&rel=0`;preview.innerHTML='';preview.appendChild(frame)}
      const init=()=>{try{player=new YT.Player(frame,{events:{onReady:e=>{total=Number(e.target.getDuration())||total;sync();},onStateChange:e=>{playing=e.data===1;bar.querySelector('.p-play').textContent=playing?'Ⅱ':'▶';}}})}catch{}};
      if(window.YT&&YT.Player)init();else{const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);window.onYouTubeIframeAPIReady=init;}
    };
    const sync=()=>{let a=parse(start.value),b=parse(end.value);if(!Number.isFinite(a))a=0;if(!Number.isFinite(b))b=Math.min(30,total||30);a=Math.round(a);b=Math.round(b);if(total)b=Math.min(b,Math.floor(total));if(b<=a)b=Math.min(a+1,Math.floor(total||a+30));start.value=fmt(a);end.value=fmt(b);document.getElementById('precisionDuration').textContent=fmt(b-a);const sel=timeline.querySelector('#selection');if(sel&&total){sel.style.left=(a/total*100)+'%';sel.style.width=((b-a)/total*100)+'%';}ed.querySelector('#startTimeline').textContent=fmt(a);ed.querySelector('#endTimeline').textContent=fmt(b)};
    const seek=s=>{if(player&&player.seekTo)player.seekTo(Math.max(0,Math.min(total||1,s)),true)};
    const now=()=>player&&player.getCurrentTime?Number(player.getCurrentTime()):parse(start.value);
    const set=(field,v)=>{const el=field==='start'?start:end;el.value=fmt(v);sync()};
    bar.onclick=e=>{const b=e.target.closest('[data-act]');if(!b)return;const act=b.dataset.act;let t=now();if(act==='play'){if(player){playing?player.pauseVideo():player.playVideo();}else playerReady();}else if(act==='back')seek(t-5);else if(act==='forward')seek(t+5);else if(act==='reset'){set('start',0);set('end',Math.min(30,Math.floor(total||30)));seek(0)}};
    trim.onclick=e=>{const b=e.target.closest('[data-act]');if(!b)return;const t=Math.round(now());if(b.dataset.act==='in')set('start',Math.min(t,parse(end.value)-1));else set('end',Math.max(t,parse(start.value)+1));};
    [start,end].forEach(x=>{x.addEventListener('input',()=>{sync();});x.addEventListener('blur',()=>{let v=parse(x.value);if(Number.isFinite(v))x.value=fmt(v);sync();});x.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();x.blur();}})});
    let drag=null;
    const dragAt=e=>{if(!drag||!total)return;const r=timeline.getBoundingClientRect(),pct=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),v=Math.round(pct*total);if(drag==='l')set('start',Math.min(v,parse(end.value)-1));else set('end',Math.max(v,parse(start.value)+1));};
    timeline.addEventListener('pointerdown',e=>{if(!e.target.closest('.handle'))return;e.preventDefault();e.stopPropagation();drag=e.target.closest('.handle').classList.contains('left')?'l':'r';timeline.setPointerCapture(e.pointerId)});timeline.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();e.stopPropagation();dragAt(e)},true);timeline.addEventListener('pointerup',()=>drag=null);timeline.addEventListener('pointercancel',()=>drag=null);timeline.addEventListener('lostpointercapture',()=>drag=null);
    const text=()=>{const x=tr();bar.querySelector('[data-act="back"]').title=x.back5;bar.querySelector('[data-act="forward"]').title=x.forward5;trim.querySelector('.p-trim').textContent=x.trim;trim.querySelector('.p-setin').textContent=x.setIn;trim.querySelector('.p-setout').textContent=x.setOut;controls.querySelector('.p-selected').textContent=x.selected};text();document.getElementById('language')?.addEventListener('change',text);
    sync();playerReady();
  }
  const watch=()=>{const e=document.getElementById('editor');if(e&&!e.classList.contains('hidden')&&!e.dataset.enhanced)enhance()};
  new MutationObserver(watch).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});setInterval(watch,500);watch();
})();
