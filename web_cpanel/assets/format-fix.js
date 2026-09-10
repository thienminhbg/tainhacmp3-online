/* TaiNhacMP3: switch ALL format-specific UI text between MP4 video and MP3 audio. */
(() => {
  const TEXT = {
    vi:{mp4:{cut:'✂ Cắt video ',processing:'Đang xử lý đoạn video…',ready:'Đoạn video đã sẵn sàng',download:'Tải xuống'},mp3:{cut:'✂ Cắt MP3 ',processing:'Đang xử lý MP3…',ready:'MP3 đã sẵn sàng',download:'Tải MP3'}},
    en:{mp4:{cut:'✂ Cut video ',processing:'Processing your video…',ready:'Your video is ready',download:'Download'},mp3:{cut:'✂ Cut MP3 ',processing:'Processing your MP3…',ready:'MP3 is ready',download:'Download MP3'}},
    fr:{mp4:{cut:'✂ Découper la vidéo ',processing:'Traitement de la vidéo…',ready:'Votre vidéo est prête',download:'Télécharger'},mp3:{cut:'✂ Découper le MP3 ',processing:'Traitement du MP3…',ready:'Votre MP3 est prêt',download:'Télécharger le MP3'}},
    de:{mp4:{cut:'✂ Video schneiden ',processing:'Video wird verarbeitet…',ready:'Dein Video ist fertig',download:'Herunterladen'},mp3:{cut:'✂ MP3 schneiden ',processing:'MP3 wird verarbeitet…',ready:'Deine MP3-Datei ist fertig',download:'MP3 herunterladen'}},
    es:{mp4:{cut:'✂ Cortar vídeo ',processing:'Procesando tu vídeo…',ready:'Tu vídeo está listo',download:'Descargar'},mp3:{cut:'✂ Cortar MP3 ',processing:'Procesando tu MP3…',ready:'Tu MP3 está listo',download:'Descargar MP3'}},
    id:{mp4:{cut:'✂ Potong video ',processing:'Memproses video…',ready:'Video Anda siap',download:'Unduh'},mp3:{cut:'✂ Potong MP3 ',processing:'Memproses MP3…',ready:'MP3 Anda siap',download:'Unduh MP3'}},
    th:{mp4:{cut:'✂ ตัดวิดีโอ ',processing:'กำลังประมวลผลวิดีโอ…',ready:'วิดีโอพร้อมแล้ว',download:'ดาวน์โหลด'},mp3:{cut:'✂ ตัด MP3 ',processing:'กำลังประมวลผล MP3…',ready:'MP3 พร้อมแล้ว',download:'ดาวน์โหลด MP3'}},
    ja:{mp4:{cut:'✂ 動画を切り抜く ',processing:'動画を処理中…',ready:'動画の準備ができました',download:'ダウンロード'},mp3:{cut:'✂ MP3を切り抜く ',processing:'MP3を処理中…',ready:'MP3の準備ができました',download:'MP3をダウンロード'}},
    ko:{mp4:{cut:'✂ 영상 자르기 ',processing:'영상을 처리하는 중…',ready:'영상이 준비되었습니다',download:'다운로드'},mp3:{cut:'✂ MP3 자르기 ',processing:'MP3를 처리하는 중…',ready:'MP3가 준비되었습니다',download:'MP3 다운로드'}},
    pt:{mp4:{cut:'✂ Cortar vídeo ',processing:'Processando seu vídeo…',ready:'Seu vídeo está pronto',download:'Baixar'},mp3:{cut:'✂ Cortar MP3 ',processing:'Processando seu MP3…',ready:'Seu MP3 está pronto',download:'Baixar MP3'}},
    it:{mp4:{cut:'✂ Taglia video ',processing:'Elaborazione del video…',ready:'Il tuo video è pronto',download:'Scarica'},mp3:{cut:'✂ Taglia MP3 ',processing:'Elaborazione dell’MP3…',ready:'Il tuo MP3 è pronto',download:'Scarica MP3'}}
  };
  const getFormat=()=>document.querySelector('input[name="format"]:checked')?.value?.toLowerCase()==='mp3'?'mp3':'mp4';
  const getLang=()=>{const l=document.getElementById('language')?.value||document.documentElement.lang||'en';return TEXT[l]?l:'en';};
  const update=()=>{
    const f=getFormat(),t=TEXT[getLang()][f];
    const btn=document.getElementById('cutBtn');
    if(btn){Array.from(btn.childNodes).forEach(n=>{if(n.nodeType===Node.TEXT_NODE)n.textContent=t.cut;});const a=btn.querySelector('span');if(a)a.textContent='→';btn.setAttribute('aria-label',t.cut.trim().replace(/^✂\s*/,''));}
    const p=document.getElementById('progressText');if(p)p.textContent=t.processing;
    const d=document.getElementById('downloadTitle');if(d)d.textContent=t.ready;
    const b=document.getElementById('downloadBtn');if(b)b.textContent=t.download;
    const m=document.getElementById('downloadMeta');if(m&&m.textContent){const x=m.textContent.match(/[•·]\s*(\d{1,2}:\d{2}(?::\d{2})?)/);if(x)m.textContent=`${f.toUpperCase()} • ${x[1]}`;}
  };
  document.addEventListener('change',e=>{if(e.target?.matches('input[name="format"],#language'))update();});
  const observer=new MutationObserver(update);observer.observe(document.body,{subtree:true,childList:true});
  update();
})();
