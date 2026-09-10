const API_BASE = "https://api.tainhacmp3.online";

const form = document.getElementById("songForm");
const urlInput = document.getElementById("songUrl");
const pasteBtn = document.getElementById("pasteBtn");
const getBtn = document.getElementById("getBtn");
const message = document.getElementById("message");
const resultSection = document.getElementById("resultSection");
const cover = document.getElementById("cover");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const player = document.getElementById("player");
const downloadBtn = document.getElementById("downloadBtn");

function setMessage(text = "", type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function setLoading(loading) {
  getBtn.disabled = loading;
  getBtn.classList.toggle("loading", loading);
  getBtn.innerHTML = loading ? '<span class="spinner"></span> ĐANG XỬ LÝ...' : '<span>♪</span> LẤY LINK 128K';
}

function normalizeResult(data) {
  const root = data?.data ?? data ?? {};
  const audio = root.audio ?? root;
  return {
    title: audio.title || root.title || "Bài hát",
    artist: audio.artist || audio.singer || root.artist || root.singer || "Nghệ sĩ",
    cover: audio.cover || root.thumbnail || root.thumbnailM || "",
    url: audio["128"] || audio["128kbps"] || root["128"] || root["128kbps"] || root.url || ""
  };
}

async function resolveSong(url) {
  const response = await fetch(`${API_BASE}/api/zing/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  let data = null;
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Không thể lấy link bài hát.");
  }
  return normalizeResult(data);
}

function showResult(song) {
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  cover.src = song.cover || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%2318181b'/%3E%3Ctext x='300' y='330' fill='%23a1a1aa' text-anchor='middle' font-size='110'%3E♪%3C/text%3E%3C/svg%3E";
  cover.alt = song.title;
  if (song.url) {
    player.src = song.url;
    downloadBtn.href = song.url;
    downloadBtn.classList.remove("disabled");
  } else {
    player.removeAttribute("src");
    downloadBtn.href = "#";
    downloadBtn.classList.add("disabled");
  }
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return setMessage("Vui lòng dán link bài hát.", "error");
  if (!/(zingmp3\.vn|zing\.mp3|zmp3\.vn)/i.test(url)) {
    return setMessage("Vui lòng nhập một liên kết Zing MP3 hợp lệ.", "error");
  }

  setMessage("Đang lấy thông tin và link 128kbps...", "loading-message");
  setLoading(true);
  resultSection.classList.add("hidden");
  try {
    const song = await resolveSong(url);
    if (!song.url) throw new Error("Nguồn không trả về link MP3 128kbps.");
    showResult(song);
    setMessage("Đã lấy link 128kbps.", "success");
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Không thể xử lý link này.", "error");
  } finally {
    setLoading(false);
  }
});

pasteBtn?.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      urlInput.value = text;
      urlInput.focus();
      setMessage("Đã dán liên kết.", "success");
    }
  } catch (_) {
    urlInput.focus();
  }
});

downloadBtn?.addEventListener("click", (event) => {
  if (downloadBtn.classList.contains("disabled")) event.preventDefault();
});
