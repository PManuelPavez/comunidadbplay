// =========================================================
// GEO — detección de provincia y pintado de links de
// registro/login + WhatsApp dinámico. Consolida la lógica
// que antes estaba duplicada en app.js / script.js / script_index.js.
// =========================================================
import { db } from "./supabase.js";
import { REG, LOGIN, DEF_REG, DEF_LOGIN, WHATSAPP_FALLBACK, waLink } from "./config.js";

const KEY_PROV = "bp.province";
const KEY_TS = "bp.province.ts";
const TTL = 12 * 60 * 60 * 1000;

const $$ = (sel) => Array.from(document.querySelectorAll(sel));

export function normalizeProvince(raw = "") {
  const k = String(raw).toUpperCase()
    .replace(/[ÁÀÄ]/g, "A").replace(/[ÉÈ]/g, "E").replace(/[ÍÌ]/g, "I")
    .replace(/[ÓÒ]/g, "O").replace(/[ÚÙ]/g, "U").trim();
  if (k.includes("AUTONOMA") || k.includes("CABA")) return "CABA";
  if (k.includes("BUENOS AIRES")) return "BUENOS AIRES";
  if (k.includes("SANTA FE")) return "SANTA FE";
  if (k.includes("CORDOBA")) return "CORDOBA";
  if (k.includes("MENDOZA")) return "MENDOZA";
  return null;
}

function fromHost() {
  const H = location.host.toUpperCase();
  if (H.includes("CABA")) return "CABA";
  if (H.includes("SANTAFE")) return "SANTA FE";
  if (H.includes("CORDOBA")) return "CORDOBA";
  if (H.includes("MENDOZA")) return "MENDOZA";
  if (H.includes("PBA") || H.includes("BUENOSAIRES")) return "BUENOS AIRES";
  return null;
}

function cacheProv(prov) {
  if (!prov) return;
  localStorage.setItem(KEY_PROV, prov);
  localStorage.setItem(KEY_TS, String(Date.now()));
}

export function paintJurisdictionLinks(prov) {
  const reg = REG[prov] || DEF_REG;
  const log = LOGIN[prov] || DEF_LOGIN;
  $$("[data-register-link]").forEach((a) => (a.href = reg));
  $$("[data-login-link]").forEach((a) => (a.href = log));
}

async function reverseGeocode(lat, lon) {
  const u = new URL("https://nominatim.openstreetmap.org/reverse");
  u.search = new URLSearchParams({ format: "jsonv2", lat, lon, zoom: "10", "accept-language": "es" });
  const r = await fetch(u, { headers: { "Referer": location.origin } });
  if (!r.ok) throw new Error("geocode");
  const d = await r.json();
  const a = d.address || {};
  return {
    prov: a.state || a.region || a.province || "",
    city: a.city || a.town || a.village || "",
  };
}

// Resuelve la provincia: cache → host → geolocalización.
export async function detectProvince() {
  const ts = +(localStorage.getItem(KEY_TS) || 0);
  const cached = localStorage.getItem(KEY_PROV);
  if (cached && Date.now() - ts < TTL) return cached;

  const host = fromHost();
  if (host) { cacheProv(host); return host; }

  if (location.protocol === "https:" && navigator.geolocation) {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3500, maximumAge: 6e5 }));
      const { prov, city } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      const geoEl = document.getElementById("geo");
      if (geoEl) geoEl.textContent = prov ? (city ? `${city}, ${prov}` : prov) : "Argentina";
      const key = normalizeProvince(prov);
      if (key) { cacheProv(key); return key; }
    } catch { /* ignora */ }
  }
  return cached || null;
}

// Lee el número de WhatsApp vigente desde Supabase (fallback a config).
export async function getWhatsappNumber() {
  try {
    const { data } = await db.from("contenido_dinamico")
      .select("valor").eq("clave", "whatsapp_num").maybeSingle();
    const num = String(data?.valor || "").replace(/\D/g, "");
    return num || WHATSAPP_FALLBACK;
  } catch {
    return WHATSAPP_FALLBACK;
  }
}

// Repinta todos los wa.me / tel: con el número vigente, conservando ?text=.
export async function applyDynamicWhatsapp() {
  const num = await getWhatsappNumber();
  document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
    try {
      const url = new URL(a.href);
      a.href = `https://wa.me/${num}${url.search}`;
    } catch { a.href = waLink(num); }
  });
  document.querySelectorAll('a[href^="tel:"]').forEach((a) => { a.href = `tel:+${num}`; });
  document.querySelectorAll('[data-role="wpp-visible-num"]').forEach((el) => {
    el.textContent = num.replace(/^549?/, "").replace(/^(\d{3})(\d+)/, "$1 $2");
  });
  return num;
}

// Inicializa todo lo relacionado a jurisdicción en una página pública.
export async function initJurisdiction() {
  const seed = localStorage.getItem(KEY_PROV) || fromHost();
  paintJurisdictionLinks(seed);
  const prov = await detectProvince();
  paintJurisdictionLinks(prov);
  applyDynamicWhatsapp();
  return prov;
}
