// =========================================================
// VIDEOS — tutoriales oficiales de Bplay (YouTube) embebidos
// "lite": se muestra la miniatura y el iframe recién se carga
// al hacer click (youtube-nocookie), así no pesa en el home ni
// en el chat. Se usan en "Problemas comunes" y en el bot.
// Playlist: https://www.youtube.com/playlist?list=PLJm83LikhjsghciGzshf0CrfqCc-OU-b3
// =========================================================
export const PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLJm83LikhjsghciGzshf0CrfqCc-OU-b3";

export const VIDEOS = {
  registro:  { id: "4SygNL1oOpw", title: "¿Cómo registrarme en Bplay?" },
  depositar: { id: "fOHKlUBGsaI", title: "¿Cómo depositar para jugar en Bplay?" },
  validar:   { id: "esIjo3nCNc8", title: "¿Cómo validar mi cuenta en Bplay?" },
  retirar:   { id: "cRu3etHQErw", title: "¿Cómo retirar tu premio en Bplay?" },
  codigo:    { id: "Y4oIwbRD6kk", title: "¿Cómo usar un código promocional en Bplay?" },
  ayuda:     { id: "iS-ZlYu470Y", title: "¿Cómo accedo al centro de ayuda?" },
};

// Autoexclusión: el trámite cambia por jurisdicción (claves = las de config.js).
export const AUTOEXCLUSION = {
  "BUENOS AIRES": { id: "f9hRaZZphiw", label: "Provincia de Buenos Aires" },
  "CABA":         { id: "eN20Oa8ROQg", label: "CABA" },
  "CORDOBA":      { id: "_uwdPt6Uxbk", label: "Córdoba" },
  "MENDOZA":      { id: "p6hMeeV7kV0", label: "Mendoza" },
  "SANTA FE":     { id: "G7kehDOnwQk", label: "Santa Fe" },
};

// HTML en una sola línea (el chat usa white-space: pre-line).
export function videoEmbedHTML({ id, title }) {
  return `<button type="button" class="yt-lite" data-yt="${id}" data-title="${title}" aria-label="Reproducir video: ${title}">`
    + `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async">`
    + `<span class="yt-lite__play" aria-hidden="true"></span>`
    + `<span class="yt-lite__title">${title}</span></button>`;
}

let _bound = false;
// Un solo listener delegado: reemplaza la miniatura por el iframe.
export function initVideoEmbeds() {
  if (_bound) return;
  _bound = true;
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".yt-lite");
    if (!btn) return;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`;
    iframe.title = btn.dataset.title || "Video tutorial";
    iframe.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.className = "yt-lite yt-lite--playing";
    btn.replaceWith(iframe);
  });
}
