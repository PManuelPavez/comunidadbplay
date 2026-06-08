// =========================================================
// PROMOS — fetch desde Supabase (tabla `promos`) + render.
// Una promo se actualiza editando su fila / imagen en Supabase:
// no requiere tocar código ni re-deploy. Las vencidas
// (ends_at < now) se ocultan solas. Si la red falla, usa el
// fallback estático de abajo para no dejar la página vacía.
// =========================================================
import { db } from "./supabase.js";
import { waLink } from "./config.js";

// Fallback estático (también sirve de "forma" esperada de cada promo).
const FALLBACK = [
  {
    slug: "joker",
    title: "Promo Jokers",
    badge: "PROMO JOKERS 🤡",
    image_url: "media/promos/opt/slide-joker.webp",
    wpp_text: "Hola, quiero activar la PROMO JOKERS",
    valid_days: ["LUNES", "JUEVES"],
    details: [
      { h: "¿Cómo accedo?", p: "Hacé una carga hoy. Según el monto, recibís tiros gratis." },
      { h: "Tiros por carga", list: ["$20.000 → 450 tiros", "$10.000 → 150 tiros", "$5.000 → 50 tiros"] },
      { h: "Ganancia", p: "Todo lo ganado se acredita como BONO CASINO 🎰." },
    ],
  },
  {
    slug: "primer-deposito",
    title: "Primer depósito",
    badge: "PRIMER DEPÓSITO",
    image_url: "media/promos/opt/slide-primer-deposito.webp",
    wpp_text: "Hola, quiero activar la PROMO PRIMER DEPÓSITO",
    valid_days: [],
    details: [
      { h: "¿Cuál es la promo?", p: "Con tu primer depósito de $5.000 accedés a 100 tiros gratis en Joker Jewels, ¡con ganancia retirable!" },
      { h: "Requisitos", list: ["Usuario nuevo (sin depósitos previos)", "Depósito mínimo $5.000"] },
    ],
  },
  {
    slug: "referidos",
    title: "Promo referidos",
    badge: "PROMO REFERIDOS 🤝",
    image_url: "media/promos/opt/slide-sorteos.webp",
    wpp_text: "Hola, quiero activar la PROMO REFERIDOS",
    valid_days: [],
    details: [
      { h: "¿Cómo califica?", list: ["Invitá a alguien no registrado en Bplay", "Debe contactarnos antes de registrarse", "Cuando deposite $5.000, recibís $10.000 para jugar"] },
    ],
  },
];

let _cache = null;

// Devuelve las promos vigentes (o el fallback).
export async function getPromos() {
  if (_cache) return _cache;
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await db
      .from("promos")
      .select("*")
      .eq("active", true)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) throw error || new Error("empty");
    _cache = data;
  } catch {
    _cache = FALLBACK;
  }
  return _cache;
}

function bannerHTML(p, waNumber) {
  const href = waLink(waNumber, p.wpp_text || `Hola, quiero info de ${p.title}`);
  return `
    <a class="promo-banner reveal" href="${href}" target="_blank" rel="noopener" data-promo="${p.slug}">
      <img src="${p.image_url}" alt="${p.title}" loading="lazy" decoding="async">
    </a>`;
}

// index.html → banners del hero
export async function renderHeroBanners(el, waNumber) {
  if (!el) return;
  const promos = await getPromos();
  el.innerHTML = promos.map((p) => bannerHTML(p, waNumber)).join("");
}

function detailHTML(block) {
  const body = block.list
    ? `<ul>${block.list.map((li) => `<li>${li}</li>`).join("")}</ul>`
    : `<p class="muted">${block.p || ""}</p>`;
  return `<h3>${block.h}</h3>${body}`;
}

// promos.html → slider + panel de detalle sincronizado
export async function renderPromosPage(sliderEl, infoEl, waNumber) {
  const promos = await getPromos();
  const slidesBox = sliderEl?.querySelector(".slides");
  if (slidesBox) {
    slidesBox.innerHTML = promos.map((p) => `
      <div class="slide" data-slug="${p.slug}"><img src="${p.image_url}" alt="${p.title}" loading="lazy"></div>`).join("");
  }
  if (infoEl) {
    infoEl.innerHTML = promos.map((p, i) => `
      <article class="promo-detail card ${i === 0 ? "is-active" : ""}" data-for="${p.slug}">
        <span class="badge badge-gold">${p.badge || p.title}</span>
        ${(p.details || []).map(detailHTML).join("")}
        ${p.valid_days?.length ? `<p class="muted"><strong>Válida ${p.valid_days.join(" y ")}.</strong></p>` : ""}
        <a class="btn btn-gold btn-full" href="${waLink(waNumber, p.wpp_text || `Hola, quiero activar ${p.title}`)}" target="_blank" rel="noopener">Activar esta promo</a>
      </article>`).join("");
  }
  return promos;
}
