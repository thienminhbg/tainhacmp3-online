/* TaiNhacMP3 Direct Browser mode
 * Local-file processing only: the source file stays on the user's device.
 * YouTube URLs continue to use the server path because browser CORS/streaming
 * restrictions prevent reliable direct processing of arbitrary YouTube media.
 */
(() => {
  const load = () => {
    if (!document.getElementById('editor') || document.getElementById('directMode')) return;

    const wrap = document.createElement('section');
    wrap.id = 'directMode';
    wrap.className = 'direct-mode';
    wrap.innerHTML = `
      <div class="direct-card">
        <div class="direct-icon">💻</div>
        <div class="direct-copy">
          <span class="direct-kicker">DIRECT · BROWSER</span>
          <h3>Process on your device</h3>
          <p>Select a video file already on your phone or computer. The file is processed locally and is not uploaded to TaiNhacMP3.</p>
        </div>
        <label class="direct-file-btn">
          <input id="directFile" type="file" accept="video/*,audio/*" hidden>
          Choose file
        </label>
      </div>
      <div id="directEditor" class="direct-editor hidden">
        <div class="direct-file-name" id="directFileName"></div>
        <div class="direct-times">
          <label>Start<input id="directStart" value="00:00" inputmode="numeric"></label>
          <label>End<input id="directEnd" value="00:30" inputmode="numeric"></label>
        </div>
        <div class="direct-format">
          <label><input type="radio" name="directFormat" value="mp4" checked> MP4</label>
          <label><input type="radio" name="directFormat" value="mp3"> MP3</label>
        </div>
        <button id="directCut" class="cut-btn" type="button">Cut on this device →</button>
        <div id="directProgress" class="direct-progress hidden"></div>
        <a id="directDownload" class="download-btn hidden" download>Download</a>
      </div>`;

    document.getElementById('editor').after(wrap);

    const style = document.createElement('style');
    style.textContent = `
      .direct-mode{margin-top:20px}.direct-card{display:flex;gap:16px;align-items:center;padding:20px;border:1px solid rgba(80,220,255,.3);border-radius:22px;background:linear-gradient(135deg,rgba(16,31,54,.96),rgba(20,24,43,.96))}.direct-icon{font-size:30px}.direct-copy{flex:1}.direct-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;color:#17c9ee}.direct-copy h3{margin:4px 0;font-size:20px}.direct-copy p{margin:6px 0 0;color:#91a4c2;line-height:1.5}.direct-file-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:14px;background:#13b9dc;color:#06131e;font-weight:800;cursor:pointer;white-space:nowrap}.direct-editor{margin-top:12px;padding:18px;border-radius:20px;background:rgba(18,28,49,.9);border:1px solid rgba(255,255,255,.08)}.direct-editor.hidden{display:none}.direct-file-name{font-weight:700;margin-bottom:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.direct-times{display:flex;gap:12px}.direct-times label{flex:1;font-size:13px;color:#91a4c2}.direct-times input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0c1424;color:#fff}.direct-format{display:flex;gap:18px;margin:14px 0}.direct-progress{margin-top:12px;color:#17c9ee}.direct-download{margin-top:12px;display:inline-flex}.hidden{display:none!important}@media(max-width:650px){.direct-card{align-items:flex-start;flex-wrap:wrap}.direct-file-btn{width:100%}}
    `;
    document.head.appendChild(style);

    let selectedFile = null;
    const $ = id => document.getElementById(id);
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
        $('directProgress').textContent = 'End time must be greater than start time.';
        $('directProgress').classList.remove('hidden');
        return;
      }
      if (end - start > 1800) {
        $('directProgress').textContent = 'Direct Browser mode is limited to 30 minutes per clip.';
        $('directProgress').classList.remove('hidden');
        return;
      }

      $('directProgress').classList.remove('hidden');
      $('directProgress').textContent = 'Loading browser video processor…';
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
            if (p && Number.isFinite(p.ratio)) $('directProgress').textContent = `Processing on your device… ${Math.max(0, Math.min(100, Math.round(p.ratio * 100)))}%`;
          }
        });
        await ffmpeg.load();

        const input = 'input' + (selectedFile.name.match(/\.[^.]+$/)?.[0] || '.mp4');
        const format = document.querySelector('input[name="directFormat"]:checked').value;
        const output = format === 'mp3' ? 'tainhacmp3-direct.mp3' : 'tainhacmp3-direct.mp4';
        ffmpeg.FS('writeFile', input, await fetchFile(selectedFile));
        $('directProgress').textContent = 'Processing on your device…';

        if (format === 'mp3') {
          await ffmpeg.run('-ss', String(start), '-i', input, '-t', String(end - start), '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', output);
        } else {
          await ffmpeg.run('-ss', String(start), '-i', input, '-t', String(end - start), '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-movflags', '+faststart', output);
        }

        const data = ffmpeg.FS('readFile', output);
        const mime = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        const url = URL.createObjectURL(new Blob([data.buffer], {type: mime}));
        $('directDownload').href = url;
        $('directDownload').textContent = 'Download';
        $('directDownload').classList.remove('hidden');
        $('directProgress').textContent = 'Done — the file stayed on your device.';

        try { ffmpeg.FS('unlink', input); ffmpeg.FS('unlink', output); } catch (_) {}
      } catch (err) {
        console.error(err);
        $('directProgress').textContent = 'Direct processing failed. Use Server mode instead.';
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
