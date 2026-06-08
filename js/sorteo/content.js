// =========================================================
// SORTEO · contenido dinámico (reemplaza sorteos.js legacy).
// Lee la config del sorteo desde `contenido_dinamico` (slug='sorteo')
// usando el cliente compartido, aplica al DOM y maneja countdown,
// cupos (simulados) y feed (simulado) + tracking de click.
// =========================================================
import { db } from "../supabase.js";

async function loadConfig() {
  try {
    const { data, error } = await db
      .from("contenido_dinamico")
      .select("kicker,titulo,premio1_label,premio1_monto,premio2_label,premio2_monto,draw_end,slots_min,slots_total,cta_label,cta_url,legal,hero_image")
      .eq("slug", "sorteo").eq("is_active", true).limit(1);
    if (error || !data?.length) return {};
    return data[0];
  } catch { return {}; }
}

function applyConfig(cfg = {}) {
  const set = (sel, val, prop = "textContent") => { const el = document.querySelector(sel); if (el && val != null) el[prop] = val; };
  set(".sorteo-kicker", cfg.kicker);
  set("#sorteo-title", cfg.titulo);

  const money = (n) => { const v = Number(n); return Number.isNaN(v) ? null : `$${v.toLocaleString("es-AR")}`; };
  if (cfg.premio1_label) set(".prize-card--gold .prize-rank", cfg.premio1_label);
  if (money(cfg.premio1_monto)) set(".prize-card--gold .prize-amount", money(cfg.premio1_monto));
  if (cfg.premio2_label) set(".prize-card--silver .prize-rank", cfg.premio2_label);
  if (money(cfg.premio2_monto)) set(".prize-card--silver .prize-amount", money(cfg.premio2_monto));

  if (cfg.hero_image) set(".sorteo-hero__img img", cfg.hero_image, "src");
  const cta = document.querySelector(".sorteos-wa-main");
  if (cta) { if (cfg.cta_label) cta.textContent = cfg.cta_label; if (cfg.cta_url) cta.href = cfg.cta_url; }
  set(".sorteo-legal", cfg.legal);

  const cd = document.getElementById("drawCountdown");
  if (cd && cfg.draw_end) cd.dataset.end = cfg.draw_end;
  const slots = document.getElementById("slots");
  if (slots) { if (cfg.slots_total != null) slots.dataset.total = cfg.slots_total; if (cfg.slots_min != null) slots.dataset.min = cfg.slots_min; }
}

function trackClick() {
  const cta = document.querySelector(".sorteos-wa-main");
  cta?.addEventListener("click", () => {
    db.from("sorteo_clicks").insert({
      page: "sorteo", slug: "SORTEO_001",
      user_agent: navigator.userAgent || null, referrer: document.referrer || null,
    }).then(({ error }) => error && console.warn("sorteo click:", error.message));
  });
}

function setupCountdown(cfg = {}) {
  const el = document.getElementById("drawCountdown");
  const value = el?.querySelector(".cd-value");
  if (!value) return;
  const endStr = cfg.draw_end || el.dataset.end;
  if (!endStr) { value.textContent = "Próximamente"; return; }
  const end = new Date(endStr);
  const tick = () => {
    if (Number.isNaN(end.getTime())) { value.textContent = "Próximamente"; return; }
    const diff = end - Date.now();
    if (diff <= 0) { value.textContent = "Cierra hoy"; return; }
    const m = Math.floor(diff / 60000);
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), min = m % 60;
    value.textContent = d > 0 ? `${d}d ${h}h ${min}m` : `${h}h ${min}m`;
  };
  tick(); setInterval(tick, 60000);
}

// Cupos SIMULADOS (presión psicológica). Mantenido a pedido.
function setupSlots(cfg = {}) {
  const box = document.getElementById("slots");
  if (!box) return;
  const total = Number(cfg.slots_total ?? box.dataset.total) || 200;
  const min = Number(cfg.slots_min ?? box.dataset.min) || 150;
  const current = document.getElementById("slotsCurrent");
  const fill = document.getElementById("slotsFill");
  const fillText = document.getElementById("slotsFillText");
  let n = min;
  const render = () => {
    if (current) current.textContent = n;
    if (fill) fill.style.width = Math.min(100, (n / total) * 100) + "%";
    if (fillText) fillText.textContent = `${n} / ${total}`;
  };
  render();
  const id = setInterval(() => {
    if (n >= total) return clearInterval(id);
    n = Math.min(total, n + (Math.random() < 0.5 ? 1 : 2));
    render();
  }, 12000);
}

// Feed SIMULADO de participantes. Mantenido a pedido.
const PEOPLE = [
  "Agustina · CABA","Lautaro · CABA","Brenda · CABA","Sofía · CABA","Lucas · CABA","Camila · CABA","Martín · CABA","Julieta · CABA",
  "Valentina · PBA","Franco · PBA","Daniela · PBA","Tomás · PBA","Luciana · PBA","Federico · PBA","Candela · PBA","Rodrigo · PBA",
  "Bruno · Santa Fe","Morena · Santa Fe","Marcos · Santa Fe","Lara · Santa Fe","Ignacio · Santa Fe","Sol · Santa Fe",
  "Jeremías · Córdoba","Martina · Córdoba","Thiago · Córdoba","Catalina · Córdoba","Facundo · Córdoba","Celeste · Córdoba",
  "Joaquín · Mendoza","Renata · Mendoza","Agustín · Mendoza","Luna · Mendoza","Victoria · Mendoza","Gastón · Mendoza",
];
function setupFeed() {
  const list = document.getElementById("feedList");
  if (!list) return;
  const pool = PEOPLE.slice().sort(() => Math.random() - 0.5);
  let i = 0;
  const push = () => {
    if (i >= pool.length) i = 0;
    const li = document.createElement("li");
    li.textContent = `${pool[i++]} acaba de sumar chances`;
    list.prepend(li);
    while (list.children.length > 5) list.removeChild(list.lastChild);
  };
  push(); setTimeout(push, 8000); setInterval(push, 15000);
}

export async function initSorteoContent() {
  const cfg = await loadConfig();
  applyConfig(cfg);
  trackClick();
  setupCountdown(cfg);
  setupSlots(cfg);
  setupFeed();
}
