<?php
$lang = 'vi';
?>
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#09090b">
  <title>Tải nhạc MP3 128kbps – Trình tải nhạc trực tuyến</title>
  <meta name="description" content="Công cụ trực tuyến giúp lấy thông tin và tải MP3 128kbps từ các liên kết Zing MP3 mà bạn có quyền sử dụng.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="author" content="Minh Dev">
  <meta name="keywords" content="tải nhạc MP3, tải nhạc 128kbps, Zing MP3 128kbps, download MP3">
  <link rel="canonical" href="https://tainhacmp3.online/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tainhacmp3.online/">
  <meta property="og:title" content="Tải nhạc MP3 128kbps">
  <meta property="og:description" content="Công cụ tải MP3 128kbps trực tuyến cho các liên kết bạn được phép sử dụng.">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Tải nhạc MP3 128kbps">
  <meta name="twitter:description" content="Tải MP3 128kbps trực tuyến.">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"TaiNhacMP3","url":"https://tainhacmp3.online/","applicationCategory":"MultimediaApplication","operatingSystem":"Web","description":"Online MP3 128kbps downloader for content the user is authorized to use.","author":{"@type":"Person","name":"Minh Dev"},"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}</script>
  <link rel="stylesheet" href="assets/style.css?v=6">
</head>
<body>
  <div class="bg-orb orb-one"></div><div class="bg-orb orb-two"></div>
  <header class="topbar">
    <div class="container nav">
      <a class="brand" href="/" aria-label="TaiNhacMP3 trang chủ"><span class="brand-icon">♪</span><span>TaiNhac<span>MP3</span></span></a>
      <div class="nav-right"><span class="quality-pill">MP3 · 128 KBPS</span><a href="#how">Hướng dẫn</a><a href="#faq">FAQ</a></div>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container hero-inner">
        <div class="eyebrow"><i></i> TRÌNH TẢI NHẠC TRỰC TUYẾN</div>
        <h1>Tải nhạc <span>MP3 128kbps</span><br>nhanh và đơn giản.</h1>
        <p class="hero-copy">Dán liên kết bài hát từ Zing MP3, lấy thông tin bài hát và tải phiên bản 128kbps khi nguồn cung cấp URL hợp lệ.</p>

        <form id="songForm" class="search-card" autocomplete="off">
          <div class="input-wrap">
            <span class="input-icon">↗</span>
            <input id="songUrl" type="url" inputmode="url" placeholder="Dán link bài hát Zing MP3..." aria-label="Link bài hát Zing MP3" required>
            <button id="pasteBtn" type="button" class="paste-btn">Dán</button>
          </div>
          <button id="getBtn" class="primary-btn" type="submit"><span>♪</span> LẤY LINK 128K</button>
        </form>
        <div id="message" class="message" role="status" aria-live="polite"></div>

        <div class="feature-row">
          <div><b>128 kbps</b><small>Chất lượng MP3</small></div>
          <div><b>1 liên kết</b><small>Dán và xử lý</small></div>
          <div><b>Không cài đặt</b><small>Chạy trên trình duyệt</small></div>
        </div>
      </div>
    </section>

    <section id="resultSection" class="result-section hidden">
      <div class="container">
        <div class="result-card">
          <div class="cover-wrap"><img id="cover" src="" alt="Ảnh bìa bài hát"><div class="cover-glow"></div></div>
          <div class="song-info">
            <div class="result-label">BÀI HÁT</div>
            <h2 id="songTitle">Tên bài hát</h2>
            <p id="songArtist">Nghệ sĩ</p>
            <div class="result-meta"><span>MP3</span><span>128 kbps</span></div>
            <div class="player-wrap"><audio id="player" controls preload="none"></audio></div>
            <a id="downloadBtn" class="download-btn" href="#" target="_blank" rel="noopener"><span>↓</span> TẢI MP3 128 KBPS</a>
            <p class="signed-note">Liên kết media có thể có thời hạn và được cấp theo phiên truy cập.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="how" class="section">
      <div class="container">
        <div class="section-head"><div class="eyebrow">CÁCH SỬ DỤNG</div><h2>Ba bước là xong.</h2></div>
        <div class="steps">
          <article><span>01</span><div><h3>Dán liên kết</h3><p>Sao chép URL của bài hát bạn được phép sử dụng và dán vào ô phía trên.</p></div></article>
          <article><span>02</span><div><h3>Lấy link</h3><p>Máy chủ kiểm tra liên kết và lấy thông tin phiên bản 128kbps nếu có.</p></div></article>
          <article><span>03</span><div><h3>Nghe hoặc tải</h3><p>Nghe thử trực tiếp hoặc mở liên kết tải MP3 128kbps.</p></div></article>
        </div>
      </div>
    </section>

    <section class="section dark-section">
      <div class="container split">
        <div><div class="eyebrow">128 KBPS</div><h2>Tập trung vào một định dạng.</h2></div>
        <p>Giao diện này được tối ưu riêng cho MP3 128kbps: ít nút, ít thao tác và hiển thị rõ thông tin bài hát trước khi tải.</p>
      </div>
    </section>

    <section id="faq" class="section faq-section">
      <div class="container narrow">
        <div class="section-head"><div class="eyebrow">FAQ</div><h2>Thông tin cần biết.</h2></div>
        <div class="faq">
          <details open><summary>Hỗ trợ chất lượng nào?</summary><p>Giao diện chỉ dành cho MP3 128kbps. Các chất lượng cao hơn không được xử lý.</p></details>
          <details><summary>Có cần cài phần mềm không?</summary><p>Không. Công cụ hoạt động trực tiếp trên trình duyệt.</p></details>
          <details><summary>Liên kết tải có cố định không?</summary><p>Không nhất thiết. URL media có thể là liên kết có chữ ký và thời hạn.</p></details>
          <details><summary>Có thể tải mọi bài hát không?</summary><p>Chỉ sử dụng nội dung và liên kết mà bạn có quyền truy cập, tải xuống hoặc xử lý. Công cụ không vượt qua VIP, DRM hoặc cơ chế bảo vệ truy cập.</p></details>
        </div>
      </div>
    </section>
  </main>

  <footer><div class="container footer-inner"><div><strong>TaiNhacMP3</strong><span>MP3 128kbps Downloader</span></div><p>© 2026 · Built by Minh Dev · Chỉ sử dụng nội dung bạn có quyền sử dụng.</p></div></footer>
  <script src="assets/app.js?v=6"></script>
</body>
</html>
