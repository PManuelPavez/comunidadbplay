// =========================================================
// FAQ HOME — pestaña "Problemas comunes" del index. Cada tema
// tiene explicación corta + video oficial de Bplay + CTA al chat.
// Para agregar/editar un tema se edita TOPICS (sin tocar el HTML).
// =========================================================
import { VIDEOS, AUTOEXCLUSION, PLAYLIST_URL, videoEmbedHTML, initVideoEmbeds } from "./videos.js";

const TOPICS = [
  {
    id: "registro", icon: "📝", tab: "Registrarme", title: "No sé cómo registrarme",
    text: "Registrate en Bplay de tu provincia y escribinos por el chat para activar tus promos.",
    video: VIDEOS.registro, register: true,
  },
  {
    id: "deposito", icon: "⏳", tab: "Depósito no acreditado", title: "Mi depósito no se acreditó",
    text: "La acreditación es <b>automática</b> y suele tardar minutos. No hace falta enviar comprobante. Escribinos solo si pasaron más de 15 minutos.",
    video: VIDEOS.depositar, cbu: true,
  },
  {
    id: "retiro", icon: "💸", tab: "Retirar", title: "No puedo retirar",
    text: "Los retiros se piden desde la plataforma (no por chat). Necesitás: <b>saldo en efectivo</b>, <b>cuenta validada</b> y <b>CBU cargado</b>. Pueden tardar hasta 24 hs.",
    video: VIDEOS.retirar,
  },
  {
    id: "validacion", icon: "🔐", tab: "Validar cuenta", title: "¿Cómo valido mi cuenta?",
    text: "Seguí el paso a paso del video. Si te trabás en algún punto, te ayudamos por el chat.",
    video: VIDEOS.validar,
  },
  {
    id: "codigo", icon: "🎟️", tab: "Código promocional", title: "¿Cómo uso un código promocional?",
    text: "Mirá el video para cargarlo en la plataforma. Si querés activar una promo, escribinos y te la activamos.",
    video: VIDEOS.codigo,
  },
  {
    id: "autoexclusion", icon: "🚫", tab: "Autoexclusión", title: "Quiero autoexcluirme",
    text: "El trámite depende de tu jurisdicción. Elegí la tuya para ver el video correcto.",
    autoexclusion: true,
  },
  {
    id: "ayuda", icon: "🛟", tab: "Centro de ayuda", title: "¿Dónde está el centro de ayuda de Bplay?",
    text: "Mirá cómo llegar al centro de ayuda oficial desde la plataforma.",
    video: VIDEOS.ayuda,
  },
];

const openChat = (step) => window.dispatchEvent(new CustomEvent("bp:open-chat", { detail: { step } }));

function autoexclusionBlock(province) {
  const current = AUTOEXCLUSION[province] ? province : "BUENOS AIRES";
  const opts = Object.entries(AUTOEXCLUSION)
    .map(([k, v]) => `<option value="${k}" ${k === current ? "selected" : ""}>${v.label}</option>`).join("");
  return `
    <label class="faq-select">Jurisdicción
      <select id="faqAutoexSel">${opts}</select>
    </label>
    <div class="faq-video" id="faqAutoexVideo">${videoEmbedHTML({ id: AUTOEXCLUSION[current].id, title: `¿Cómo autoexcluirme? — ${AUTOEXCLUSION[current].label}` })}</div>`;
}

function panelHTML(t, province) {
  const media = t.autoexclusion
    ? autoexclusionBlock(province)
    : `<div class="faq-video">${videoEmbedHTML(t.video)}</div>`;
  return `
    <h3 class="faq-title">${t.icon} ${t.title}</h3>
    <p class="faq-text">${t.text}</p>
    ${media}
    <div class="faq-actions">
      <button type="button" class="btn btn-wpp" data-faq-chat="${t.id}">💬 Hablar con soporte</button>
      ${t.cbu ? `<a class="btn btn-ghost" href="cbu.html">Ver CBU</a>` : ""}
      ${t.register ? `<a class="btn btn-primary" data-register-link href="#registro">Registrarme</a>` : ""}
    </div>`;
}

export function renderFaq(root, province) {
  if (!root) return;
  initVideoEmbeds();
  root.innerHTML = `
    <div class="faq-tabs" role="tablist" aria-label="Problemas comunes">
      ${TOPICS.map((t, i) => `<button type="button" class="faq-tab" role="tab" id="faqTab-${t.id}"
        aria-controls="faqPanel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-topic="${t.id}">${t.icon} ${t.tab}</button>`).join("")}
    </div>
    <div class="card faq-panel" id="faqPanel" role="tabpanel" aria-labelledby="faqTab-${TOPICS[0].id}"></div>
    <p class="faq-more muted">Más tutoriales oficiales en la <a href="${PLAYLIST_URL}" target="_blank" rel="noopener">playlist de Bplay</a>.</p>`;

  const tabs = Array.from(root.querySelectorAll(".faq-tab"));
  const panel = root.querySelector("#faqPanel");

  function select(id) {
    const t = TOPICS.find((x) => x.id === id) || TOPICS[0];
    tabs.forEach((b) => {
      const on = b.dataset.topic === t.id;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `faqTab-${t.id}`);
    panel.innerHTML = panelHTML(t, province);
  }

  root.addEventListener("click", (e) => {
    const tab = e.target.closest(".faq-tab");
    if (tab) return select(tab.dataset.topic);
    const chat = e.target.closest("[data-faq-chat]");
    if (chat) openChat(chat.dataset.faqChat);
  });
  root.addEventListener("change", (e) => {
    if (e.target.id !== "faqAutoexSel") return;
    const v = AUTOEXCLUSION[e.target.value];
    root.querySelector("#faqAutoexVideo").innerHTML = videoEmbedHTML({ id: v.id, title: `¿Cómo autoexcluirme? — ${v.label}` });
  });
  // Navegación con flechas entre pestañas (patrón WAI-ARIA).
  root.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0 || !["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus(); select(next.dataset.topic);
  });

  select(TOPICS[0].id);
}
