/* TaiNhacMP3 Direct Browser mode
 * Local-file processing only: the source file stays on the user's device.
 * YouTube URLs continue to use the server path because browser CORS/streaming
 * restrictions prevent reliable direct processing of arbitrary YouTube media.
 */
(() => {
  const I18N = {
    en: { kicker:'DIRECT · BROWSER', title:'Process on your device', desc:'Select a video file already on your phone or computer. The file is processed locally and is not uploaded to TaiNhacMP3.', choose:'Choose file', start:'Start', end:'End', cut:'Cut on this device →', download:'Download', loading:'Loading browser video processor…', processing:'Processing on your device…', done:'Done — the file stayed on your device.', badTime:'End time must be greater than start time.', max:'Direct Browser mode is limited to 30 minutes per clip.', failed:'Direct processing failed. Use Server mode instead.', mp4:'Video', mp3:'Audio' },
    vi: { kicker:'TRỰC TIẾP · TRÌNH DUYỆT', title:'Xử lý ngay trên thiết bị', desc:'Chọn video đã có trên điện thoại hoặc máy tính. File được xử lý ngay trên thiết bị và không được tải lên TaiNhacMP3.', choose:'Chọn file', start:'Bắt đầu', end:'Kết thúc', cut:'Cắt trên thiết bị →', download:'Tải xuống', loading:'Đang tải bộ xử lý video trên trình duyệt…', processing:'Đang xử lý trên thiết bị…', done:'Đã xong — file vẫn được giữ trên thiết bị của bạn.', badTime:'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.', max:'Chế độ Trực tiếp giới hạn tối đa 30 phút mỗi đoạn.', failed:'Xử lý trực tiếp thất bại. Hãy dùng chế độ Server.', mp4:'Video', mp3:'Âm thanh' },
    fr: { kicker:'DIRECT · NAVIGATEUR', title:'Traitez sur votre appareil', desc:'Sélectionnez une vidéo déjà présente sur votre téléphone ou ordinateur. Le fichier est traité localement et n’est pas envoyé à TaiNhacMP3.', choose:'Choisir un fichier', start:'Début', end:'Fin', cut:'Découper sur cet appareil →', download:'Télécharger', loading:'Chargement du processeur vidéo…', processing:'Traitement sur votre appareil…', done:'Terminé — le fichier reste sur votre appareil.', badTime:'La fin doit être supérieure au début.', max:'Le mode Direct est limité à 30 minutes par extrait.', failed:'Échec du traitement direct. Utilisez le mode Serveur.', mp4:'Vidéo', mp3:'Audio' },
    de: { kicker:'DIRECT · BROWSER', title:'Auf deinem Gerät verarbeiten', desc:'Wähle eine Videodatei von deinem Smartphone oder Computer. Die Datei wird lokal verarbeitet und nicht zu TaiNhacMP3 hochgeladen.', choose:'Datei auswählen', start:'Start', end:'Ende', cut:'Auf diesem Gerät schneiden →', download:'Herunterladen', loading:'Browser-Videoprozessor wird geladen…', processing:'Wird auf deinem Gerät verarbeitet…', done:'Fertig — die Datei blieb auf deinem Gerät.', badTime:'Das Ende muss nach dem Start liegen.', max:'Der Direct-Modus ist auf 30 Minuten pro Clip begrenzt.', failed:'Direkte Verarbeitung fehlgeschlagen. Verwende den Server-Modus.', mp4:'Video', mp3:'Audio' },
    es: { kicker:'DIRECT · NAVEGADOR', title:'Procesa en tu dispositivo', desc:'Selecciona un vídeo que ya esté en tu teléfono u ordenador. El archivo se procesa localmente y no se sube a TaiNhacMP3.', choose:'Elegir archivo', start:'Inicio', end:'Fin', cut:'Cortar en este dispositivo →', download:'Descargar', loading:'Cargando el procesador de vídeo…', processing:'Procesando en tu dispositivo…', done:'Listo — el archivo permaneció en tu dispositivo.', badTime:'La hora de finalización debe ser mayor que la de inicio.', max:'El modo Direct está limitado a 30 minutos por clip.', failed:'El procesamiento directo falló. Usa el modo Servidor.', mp4:'Vídeo', mp3:'Audio' },
    id: { kicker:'DIRECT · BROWSER', title:'Proses di perangkat Anda', desc:'Pilih file video yang sudah ada di ponsel atau komputer. File diproses secara lokal dan tidak diunggah ke TaiNhacMP3.', choose:'Pilih file', start:'Mulai', end:'Selesai', cut:'Potong di perangkat ini →', download:'Unduh', loading:'Memuat pemroses video browser…', processing:'Memproses di perangkat Anda…', done:'Selesai — file tetap berada di perangkat Anda.', badTime:'Waktu selesai harus lebih besar dari waktu mulai.', max:'Mode Direct dibatasi maksimal 30 menit per klip.', failed:'Pemrosesan langsung gagal. Gunakan mode Server.', mp4:'Video', mp3:'Audio' },
    th: { kicker:'DIRECT · BROWSER', title:'ประมวลผลบนอุปกรณ์ของคุณ', desc:'เลือกไฟล์วิดีโอที่มีอยู่แล้วในโทรศัพท์หรือคอมพิวเตอร์ ไฟล์จะถูกประมวลผลในเครื่องและไม่ถูกอัปโหลดไปยัง TaiNhacMP3', choose:'เลือกไฟล์', start:'เริ่ม', end:'สิ้นสุด', cut:'ตัดบนอุปกรณ์นี้ →', download:'ดาวน์โหลด', loading:'กำลังโหลดตัวประมวลผลวิดีโอ…', processing:'กำลังประมวลผลบนอุปกรณ์ของคุณ…', done:'เสร็จแล้ว — ไฟล์ยังคงอยู่บนอุปกรณ์ของคุณ', badTime:'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น', max:'โหมด Direct จำกัดความยาวคลิปไม่เกิน 30 นาที', failed:'การประมวลผลโดยตรงล้มเหลว โปรดใช้โหมด Server', mp4:'วิดีโอ', mp3:'เสียง' },
    ja: { kicker:'DIRECT · ブラウザ', title:'デバイス上で処理', desc:'スマートフォンやパソコンにある動画ファイルを選択してください。ファイルは端末上で処理され、TaiNhacMP3にはアップロードされません。', choose:'ファイルを選択', start:'開始', end:'終了', cut:'このデバイスで切り抜く →', download:'ダウンロード', loading:'ブラウザ動画プロセッサを読み込み中…', processing:'デバイス上で処理中…', done:'完了 — ファイルはデバイス上に残っています。', badTime:'終了時間は開始時間より後にしてください。', max:'Directモードは1クリップ30分までです。', failed:'直接処理に失敗しました。Serverモードを使用してください。', mp4:'動画', mp3:'音声' },
    ko: { kicker:'DIRECT · 브라우저', title:'기기에서 처리', desc:'휴대폰이나 컴퓨터에 이미 있는 동영상 파일을 선택하세요. 파일은 기기에서 직접 처리되며 TaiNhacMP3에 업로드되지 않습니다.', choose:'파일 선택', start:'시작', end:'종료', cut:'이 기기에서 자르기 →', download:'다운로드', loading:'브라우저 동영상 처리기를 불러오는 중…', processing:'기기에서 처리하는 중…', done:'완료 — 파일은 기기에 그대로 남아 있습니다.', badTime:'종료 시간은 시작 시간보다 커야 합니다.', max:'Direct 모드는 클립당 최대 30분으로 제한됩니다.', failed:'Direct 처리에 실패했습니다. Server 모드를 사용하세요.', mp4:'동영상', mp3:'오디오' },
    pt: { kicker:'DIRECT · NAVEGADOR', title:'Processe no seu dispositivo', desc:'Selecione um vídeo que já esteja no seu telefone ou computador. O arquivo é processado localmente e não é enviado ao TaiNhacMP3.', choose:'Escolher arquivo', start:'Início', end:'Fim', cut:'Cortar neste dispositivo →', download:'Baixar', loading:'Carregando o processador de vídeo…', processing:'Processando no seu dispositivo…', done:'Concluído — o arquivo permaneceu no seu dispositivo.', badTime:'O fim deve ser maior que o início.', max:'O modo Direct é limitado a 30 minutos por clipe.', failed:'O processamento direto falhou. Use o modo Servidor.', mp4:'Vídeo', mp3:'Áudio' },
    it: { kicker:'DIRECT · BROWSER', title:'Elabora sul tuo dispositivo', desc:'Seleziona un video già presente sul telefono o sul computer. Il file viene elaborato localmente e non viene caricato su TaiNhacMP3.', choose:'Scegli file', start:'Inizio', end:'Fine', cut:'Taglia su questo dispositivo →', download:'Scarica', loading:'Caricamento del processore video…', processing:'Elaborazione sul dispositivo…', done:'Fatto — il file è rimasto sul tuo dispositivo.', badTime:'La fine deve essere maggiore dell’inizio.', max:'La modalità Direct è limitata a 30 minuti per clip.', failed:'Elaborazione diretta non riuscita. Usa la modalità Server.', mp4:'Video', mp3:'Audio' }
  };

  const lang = () => {
    const selected = document.getElementById('language')?.value;
    return I18N[selected] ? selected : (window.DEFAULT_LANG && I18N[window.DEFAULT_LANG] ? window.DEFAULT_LANG : 'en');
  };
  const t = key => I18N[lang()][key] || I18N.en[key] || key;

  const load = () => {
    if (!document.getElementById('editor') || document.getElementById('directMode')) return;

    const wrap = document.createElement('section');
    wrap.id = 'directMode';
    wrap.className = 'direct-mode';
    wrap.innerHTML = `
      <div class="direct-card">
        <div class="direct-icon">💻</div>
        <div class="direct-copy">
          <span class="direct-kicker"></span>
          <h3 class="direct-title"></h3>
          <p class="direct-desc"></p>
        </div>
        <label class="direct-file-btn">
          <input id="directFile" type="file" accept="video/*,audio/*" hidden>
          <span class="direct-choose"></span>
        </label>
      </div>
      <div id="directEditor" class="direct-editor hidden">
        <div class="direct-file-name" id="directFileName"></div>
        <div class="direct-times">
          <label><span class="direct-start-label"></span><input id="directStart" value="00:00" inputmode="numeric"></label>
          <label><span class="direct-end-label"></span><input id="directEnd" value="00:30" inputmode="numeric"></label>
        </div>
        <div class="direct-format">
          <label><input type="radio" name="directFormat" value="mp4" checked> MP4 <small class="direct-mp4-label"></small></label>
          <label><input type="radio" name="directFormat" value="mp3"> MP3 <small class="direct-mp3-label"></small></label>
        </div>
        <button id="directCut" class="cut-btn" type="button"></button>
        <div id="directProgress" class="direct-progress hidden"></div>
        <a id="directDownload" class="download-btn hidden" download></a>
      </div>`;

    document.getElementById('editor').after(wrap);

    const style = document.createElement('style');
    style.textContent = `
      .direct-mode{margin-top:20px}.direct-card{display:flex;gap:16px;align-items:center;padding:20px;border:1px solid rgba(80,220,255,.3);border-radius:22px;background:linear-gradient(135deg,rgba(16,31,54,.96),rgba(20,24,43,.96))}.direct-icon{font-size:30px}.direct-copy{flex:1}.direct-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:#17c9ee}.direct-copy h3{margin:4px 0;font-size:20px}.direct-copy p{margin:6px 0 0;color:#91a4c2;line-height:1.5}.direct-file-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:14px;background:#13b9dc;color:#06131e;font-weight:800;cursor:pointer;white-space:nowrap}.direct-editor{margin-top:12px;padding:18px;border-radius:20px;background:rgba(18,28,49,.9);border:1px solid rgba(255,255,255,.08)}.direct-editor.hidden{display:none}.direct-file-name{font-weight:700;margin-bottom:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.direct-times{display:flex;gap:12px}.direct-times label{flex:1;font-size:13px;color:#91a4c2}.direct-times label>span{display:block}.direct-times input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0c1424;color:#fff}.direct-format{display:flex;gap:18px;margin:14px 0}.direct-format small{color:#91a4c2}.direct-progress{margin-top:12px;color:#17c9ee}.direct-download{margin-top:12px;display:inline-flex}.hidden{display:none!important}@media(max-width:650px){.direct-card{align-items:flex-start;flex-wrap:wrap}.direct-file-btn{width:100%}}
    `;
    document.head.appendChild(style);

    let selectedFile = null;
    const $ = id => document.getElementById(id);
    const renderText = () => {
      $('.direct-kicker').textContent=t('kicker');
      $('.direct-title').textContent=t('title');
      $('.direct-desc').textContent=t('desc');
      $('.direct-choose').textContent=t('choose');
      $('.direct-start-label').textContent=t('start');
      $('.direct-end-label').textContent=t('end');
      $('.direct-mp4-label').textContent=t('mp4');
      $('.direct-mp3-label').textContent=t('mp3');
      $('directCut').textContent=t('cut');
      if (!$('directProgress').classList.contains('hidden') && !selectedFile) $('directProgress').textContent='';
      if (!$('directDownload').classList.contains('hidden')) $('directDownload').textContent=t('download');
    };
    renderText();

    const parseTime = v => {
      const s = String(v || '').trim();
      if (/^\d+$/.test(s)) return Number(s);
      const p = s.split(':').map(Number);
      if (p.some(Number.isNaN)) return NaN;
      if (p.length === 2) return p[0] * 60 + p[1];
      if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
      return NaN;
    };

    $('directFile').addEventListener('change', e => {
      selectedFile = e.target.files[0] || null;
      if (!selectedFile) return;
      $('directFileName').textContent = selectedFile.name;
      $('directEditor').classList.remove('hidden');
      $('directProgress').classList.add('hidden');
      $('directDownload').classList.add('hidden');
    });

    $('directCut').addEventListener('click', async () => {
      if (!selectedFile) return;
      const start = parseTime($('directStart').value);
      const end = parseTime($('directEnd').value);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        $('directProgress').textContent = t('badTime');
        $('directProgress').classList.remove('hidden');
        return;
      }
      if (end - start > 1800) {
        $('directProgress').textContent = t('max');
        $('directProgress').classList.remove('hidden');
        return;
      }

      $('directProgress').classList.remove('hidden');
      $('directProgress').textContent = t('loading');
      $('directDownload').classList.add('hidden');

      try {
        if (!window.FFmpeg) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Could not load browser video processor'));
            document.head.appendChild(s);
          });
        }
        const { createFFmpeg, fetchFile } = FFmpeg;
        const ffmpeg = createFFmpeg({
          log: false,
          corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
          progress: p => {
            if (p && Number.isFinite(p.ratio)) $('directProgress').textContent = `${t('processing')} ${Math.max(0, Math.min(100, Math.round(p.ratio * 100)))}%`;
          }
        });
        await ffmpeg.load();

        const input = 'input' + (selectedFile.name.match(/\.[^.]+$/)?.[0] || '.mp4');
        const format = document.querySelector('input[name="directFormat"]:checked').value;
        const output = format === 'mp3' ? 'tainhacmp3-direct.mp3' : 'tainhacmp3-direct.mp4';
        ffmpeg.FS('writeFile', input, await fetchFile(selectedFile));
        $('directProgress').textContent = t('processing');

        if (format === 'mp3') {
          await ffmpeg.run('-ss', String(start), '-i', input, '-t', String(end - start), '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', output);
        } else {
          await ffmpeg.run('-ss', String(start), '-i', input, '-t', String(end - start), '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-movflags', '+faststart', output);
        }

        const data = ffmpeg.FS('readFile', output);
        const mime = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        const url = URL.createObjectURL(new Blob([data.buffer], {type: mime}));
        $('directDownload').href = url;
        $('directDownload').textContent = t('download');
        $('directDownload').classList.remove('hidden');
        $('directProgress').textContent = t('done');

        try { ffmpeg.FS('unlink', input); ffmpeg.FS('unlink', output); } catch (_) {}
      } catch (err) {
        console.error(err);
        $('directProgress').textContent = t('failed');
      }
    });

    const language = document.getElementById('language');
    if (language) language.addEventListener('change', renderText);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
