// =========================================================
// PROMOS HOME — arma las tarjetas de promo del index según la
// provincia detectada (ver geo.js) y el día de hoy. Cada mes se
// actualiza editando FIDE / DEPOSITOS acá y subiendo las placas
// (webp) a media/promos/<mes>/: no depende de la tabla `promos`.
// =========================================================
import { waLink } from "./config.js";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const PROV_LABEL = {
  "BUENOS AIRES": "Buenos Aires",
  "CABA": "CABA",
  "CORDOBA": "Córdoba",
  "MENDOZA": "Mendoza",
  "SANTA FE": "Santa Fe",
};

const IMG_DIR = "media/promos/nov/";   // placas de noviembre (full: <img>.webp · miniatura: <img>-sm.webp)

// PROMO FTD — no depende del día, solo de la provincia.
const FTD = {
  "BUENOS AIRES": { tag: "PBA", cash: true },
  "CABA":         { tag: "CABA", cash: true },
  "CORDOBA":      { tag: "COR", cash: true },
  "MENDOZA":      { tag: "MZA", cash: false },
};

// Fidelización — por provincia y día de la semana (1 = lunes, 3 = miércoles, 5 = viernes).
// Si una provincia no tiene promo un día, simplemente no figura ese día.
const STD_EXTRA = "Rollover x60, máximo conversión $50.000, duración 24hs.";
const std = (slot, img) => ({ deposit: "$10.000", reward: "200 tiros", slot, extra: STD_EXTRA, img, h: 427 });
const mza = (slot, img) => ({ deposit: "$10.000", reward: "25 tiros en EFECTIVO", slot, extra: "Sin rollover.", img, h: 427 });
const CABA_COR = {
  1: std("CORONADOS DE GLORIA MEGAWAYS", "caba-cor-lunes"),
  3: std("CASH VOLT", "caba-cor-miercoles"),
  5: std("EXTRA CHILLI", "caba-cor-viernes"),
};
const FIDE = {
  "BUENOS AIRES": {
    1: std("TROPHY FISH", "pba-lunes"),
    3: std("JACKPOT TRAIN", "pba-miercoles"),
    5: std("CAKE & ICE CREAM", "pba-viernes"),
  },
  "CABA": CABA_COR,
  "CORDOBA": CABA_COR,
  "MENDOZA": {
    1: mza("CORONADOS DE GLORIA MEGAWAYS", "mza-lunes"),
    3: mza("CASH VOLT", "mza-miercoles"),
    5: mza("EXTRA CHILLI", "mza-viernes"),
  },
  "SANTA FE": {
    3: { deposit: "$10.000", reward: "100 tiros", slot: "PHOENIX REIGN", extra: "Rollover x60.", img: "sfe-miercoles", h: 300 },
    5: { deposit: "$20.000", reward: "300 tiros", slot: "FIRE AND ROSES JOKER", extra: "Rollover x60.", img: "sfe-viernes", h: 300 },
  },
};

// 2º, 3º y 4º depósito — placas tal cual las diseñó marketing (alt = texto de la placa).
// Cada depósito tiene dos opciones según el monto.
const DEPOSITOS = [
  { n: 2, plates: [
    { img: "dep2-4000", alt: "2º depósito: depositá $4.000 y te llevás 30 giros gratis en 777 Strike más $1.500 en apuestas gratis para fútbol" },
    { img: "dep2-6000", alt: "2º depósito: depositá $6.000 y te llevás 200% en bonos para casino más $2.000 en apuestas gratis para fútbol" },
  ] },
  { n: 3, plates: [
    { img: "dep3-6000", alt: "3º depósito: depositá $6.000 y te llevás 30 giros gratis en Thor's Rage más $1.500 en apuestas gratis para fútbol" },
    { img: "dep3-8000", alt: "3º depósito: depositá $8.000 y te llevás 200% en bonos para casino más $2.000 en apuestas gratis para fútbol" },
  ] },
  { n: 4, plates: [
    { img: "dep4-8000",  alt: "4º depósito: depositá $8.000 y te llevás 30 giros gratis en Diamond Doggies más $1.500 en apuestas gratis para fútbol" },
    { img: "dep4-10000", alt: "4º depósito: depositá $10.000 y te llevás 200% en bonos para casino más $2.000 en apuestas gratis para fútbol" },
  ] },
];

const fideDays = (prov) => Object.keys(FIDE[prov] || {}).map(Number).sort((x, y) => x - y);
const nextFideDay = (prov, today) => { const d = fideDays(prov); return d.find((x) => x > today) ?? d[0]; };

function ftdCardHTML(prov, waNumber) {
  const data = FTD[prov];
  if (!data) {
    return `
      <article class="card promo-card promo-card--teaser">
        <div class="promo-card__head"><span class="badge badge-green">PROMO DE BIENVENIDA</span></div>
        <h3 class="promo-card__title">Consultá tu promo FTD</h3>
        <p class="promo-card__text">Escribinos por WhatsApp y te contamos la promo de primer depósito vigente en tu zona.</p>
        <a class="btn btn-wpp btn-full" target="_blank" rel="noopener"
           href="${waLink(waNumber, "Hola, quiero saber la promo FTD vigente en mi zona")}">Consultar por WhatsApp</a>
      </article>`;
  }
  const body = data.cash
    ? `<p class="promo-card__text">Recibís el <strong>100% de tu depósito en EFECTIVO</strong>, hasta <strong>$8.000</strong>.</p>
       <p class="promo-card__note muted">*Se excluye la promo FTD de la plataforma.</p>`
    : `<p class="promo-card__text">Se mantiene igual a los meses anteriores.</p>
       <p class="promo-card__note muted">Escribinos por WhatsApp y te contamos el detalle vigente.</p>`;
  return `
    <article class="card promo-card">
      <div class="promo-card__head">
        <span class="badge badge-green">PROMO FTD</span>
        <div class="promo-card__tags"><span class="tag">${data.tag}</span></div>
      </div>
      <h3 class="promo-card__title">${data.cash ? "100% de tu depósito en EFECTIVO" : "Promo de primer depósito"}</h3>
      ${body}
      <a class="btn btn-wpp btn-full" target="_blank" rel="noopener"
         href="${waLink(waNumber, `Hola, quiero activar la PROMO FTD (${data.tag})`)}">Activar por WhatsApp</a>
    </article>`;
}

function thumbHTML(p, label) {
  return `<a class="promo-card__thumb" href="${IMG_DIR}${p.img}.webp" target="_blank" rel="noopener" aria-label="Ver la placa completa: ${label}">
      <img src="${IMG_DIR}${p.img}-sm.webp" alt="Placa de la promo: ${label}" width="240" height="${p.h}" loading="lazy" decoding="async">
    </a>`;
}

// kind: "today" (promo de hoy) · "next" (teaser de la próxima) · "day" (listado de la semana)
function fideDayCardHTML(prov, day, kind, waNumber) {
  const p = FIDE[prov][day];
  const dn = DAY_NAMES[day];
  const label = `${p.reward} en ${p.slot}`;
  const badge = kind === "today" ? `FIDELIZACIÓN · HOY ${dn.toUpperCase()}`
    : kind === "next" ? "PRÓXIMA FIDELIZACIÓN" : `FIDELIZACIÓN · ${dn.toUpperCase()}`;
  const title = kind === "today" ? `${p.reward} por depósito de ${p.deposit}` : `${dn}: ${p.reward} en ${p.slot}`;
  const msg = kind === "today"
    ? `Hola, quiero activar la promo de fidelización de hoy (${p.slot})`
    : `Hola, quiero ${kind === "next" ? "más info de" : "activar"} la promo de fidelización del ${dn} (${p.slot})`;
  return `
    <article class="card promo-card promo-card--media${kind === "next" ? " promo-card--teaser" : ""}">
      ${thumbHTML(p, label)}
      <div class="promo-card__body">
        <div class="promo-card__head"><span class="badge badge-gold">${badge}</span></div>
        <h3 class="promo-card__title">${title}</h3>
        <p class="promo-card__text">Depósito de <strong>${p.deposit}</strong>, recibís ${p.reward} en el slot <strong>${p.slot}</strong>. ${p.extra}</p>
        <a class="btn btn-wpp btn-full" target="_blank" rel="noopener" href="${waLink(waNumber, msg)}">${kind === "next" ? "Consultar por WhatsApp" : "Activar por WhatsApp"}</a>
      </div>
    </article>`;
}

function fideCardHTML(prov, today, waNumber) {
  if (!FIDE[prov]) return "";
  const isToday = !!FIDE[prov][today];
  return fideDayCardHTML(prov, isToday ? today : nextFideDay(prov, today), isToday ? "today" : "next", waNumber);
}

function depositosCardHTML(waNumber) {
  const groups = DEPOSITOS.map((g) => `
      <section class="promo-dep" aria-label="Promo del ${g.n}º depósito">
        <h4 class="promo-dep__title"><span class="promo-dep__num">${g.n}º</span> depósito</h4>
        ${g.plates.map((d) => `
        <a href="${IMG_DIR}${d.img}.webp" target="_blank" rel="noopener">
          <img src="${IMG_DIR}${d.img}.webp" alt="${d.alt}" width="600" height="300" loading="lazy" decoding="async">
        </a>`).join("")}
        <a class="btn btn-wpp btn-sm btn-full" target="_blank" rel="noopener"
           href="${waLink(waNumber, `Hola, quiero activar la promo del ${g.n}º depósito`)}">Activar ${g.n}º depósito</a>
      </section>`).join("");
  return `
    <article class="card promo-card promo-card--wide">
      <div class="promo-card__head"><span class="badge badge-green">2º · 3º · 4º DEPÓSITO</span></div>
      <h3 class="promo-card__title">Seguí depositando y seguí ganando</h3>
      <p class="promo-card__text">Cada depósito tiene su propio bono: elegí el monto y activalo con soporte.</p>
      <div class="promo-deposits">${groups}</div>
    </article>`;
}

// Resumen en texto de las promos de hoy para una provincia (lo usa el bot del chat).
// Devuelve "" si no hay datos para esa provincia.
export function promoSummaryHTML(province) {
  const lines = [];
  const ftd = FTD[province];
  if (ftd) {
    lines.push(ftd.cash
      ? "• <b>PROMO FTD:</b> 100% de tu depósito en EFECTIVO, hasta $8.000."
      : "• <b>PROMO FTD:</b> se mantiene igual a los meses anteriores.");
  }
  if (FIDE[province]) {
    const today = new Date().getDay();
    const isToday = !!FIDE[province][today];
    const day = isToday ? today : nextFideDay(province, today);
    const p = FIDE[province][day];
    lines.push(`• <b>Fidelización ${isToday ? "de hoy" : DAY_NAMES[day]}:</b> depósito de ${p.deposit} → ${p.reward} en <b>${p.slot}</b>. ${p.extra}`);
  }
  if (lines.length) lines.push("• <b>2º, 3º y 4º depósito:</b> giros o bono de casino + apuestas gratis de fútbol. Pedinos el detalle.");
  return lines.join("\n");
}

// index.html → tarjetas de promo + texto de contexto ("Promos de hoy, Lunes, para Buenos Aires").
export function renderHomePromos(cardsEl, metaEl, province, waNumber) {
  if (!cardsEl) return;
  const today = new Date().getDay();
  cardsEl.innerHTML = ftdCardHTML(province, waNumber) + fideCardHTML(province, today, waNumber) + depositosCardHTML(waNumber);
  if (metaEl) {
    metaEl.textContent = province
      ? `Promos de hoy, ${DAY_NAMES[today]}, para ${PROV_LABEL[province] || province}.`
      : "Escribinos por WhatsApp y te contamos la promo vigente en tu zona.";
  }
}

// ---------------------------------------------------------
// promos.html (Promos VIP) — todas las promos del mes, con
// selector de provincia. 100% front: mismos datos que el home.
// ---------------------------------------------------------
const MONTH_LABEL = "Noviembre";
const PROV_ORDER = ["BUENOS AIRES", "CABA", "CORDOBA", "MENDOZA", "SANTA FE"];

function vipContentHTML(prov, waNumber) {
  const today = new Date().getDay();
  const days = fideDays(prov);
  const dayCards = days.map((d) => fideDayCardHTML(prov, d, d === today ? "today" : "day", waNumber)).join("");
  return `
    <div class="promo-cards">
      ${ftdCardHTML(prov, waNumber)}
      ${dayCards ? `<h2 class="promo-section-title">Fidelización semanal <span class="muted">· ${days.map((d) => DAY_NAMES[d].toLowerCase()).join(", ")}</span></h2>${dayCards}` : ""}
      ${depositosCardHTML(waNumber)}
    </div>`;
}

// Devuelve { update(provincia, whatsapp) } para refinar cuando termina la geolocalización
// (sin pisar la provincia si la persona ya eligió una a mano).
export function renderVipPromos(root, province, waNumber) {
  if (!root) return { update() {} };
  const state = { prov: PROV_LABEL[province] ? province : null, wa: waNumber, picked: false };
  root.innerHTML = `
    <p class="promo-cards__meta muted" id="vipMeta"></p>
    <div class="pill-tabs" role="group" aria-label="Elegí tu provincia">
      ${PROV_ORDER.map((k) => `<button type="button" class="pill-tab" data-prov="${k}">${PROV_LABEL[k]}</button>`).join("")}
    </div>
    <div id="vipContent" aria-live="polite"></div>`;
  const tabs = Array.from(root.querySelectorAll(".pill-tab"));
  const meta = root.querySelector("#vipMeta");
  const content = root.querySelector("#vipContent");

  function draw() {
    tabs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.prov === state.prov)));
    meta.textContent = state.prov
      ? `Promos de ${MONTH_LABEL} para ${PROV_LABEL[state.prov]}. Hoy es ${DAY_NAMES[new Date().getDay()]}.`
      : "Elegí tu provincia para ver las promos vigentes.";
    content.innerHTML = state.prov ? vipContentHTML(state.prov, state.wa) : "";
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest(".pill-tab");
    if (!b) return;
    state.prov = b.dataset.prov; state.picked = true; draw();
  });
  draw();
  return {
    update(prov, wa) {
      if (wa) state.wa = wa;
      if (!state.picked && PROV_LABEL[prov]) state.prov = prov;
      draw();
    },
  };
}
