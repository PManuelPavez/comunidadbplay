// =========================================================
// PROMOS HOME — arma la(s) tarjeta(s) de promo del index según
// la provincia detectada (ver geo.js) y el día de hoy. Para
// actualizar montos, slots o condiciones se edita este archivo:
// no depende de imágenes ni de la tabla `promos` de Supabase.
// =========================================================
import { waLink } from "./config.js";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const FIDE_DAYS = [1, 3, 5]; // Lunes, Miércoles, Viernes

const PROV_LABEL = {
  "BUENOS AIRES": "Buenos Aires",
  "CABA": "CABA",
  "CORDOBA": "Córdoba",
  "MENDOZA": "Mendoza",
  "SANTA FE": "Santa Fe",
};

// PROMO FTD — no depende del día, solo de la provincia.
const FTD = {
  "BUENOS AIRES": { tag: "PBA", cash: true },
  "CABA":         { tag: "CABA", cash: true },
  "CORDOBA":      { tag: "COR", cash: true },
  "MENDOZA":      { tag: "MZA", cash: false },
};

// Fidelización lunes / miércoles / viernes — slot vigente por provincia y día.
const FIDE_SLOTS = {
  "BUENOS AIRES": { 1: "BIG CIRCUS MEGA FIRE BLAZE", 3: "RED WIZARD FIRE BLAZE CLASSICS", 5: "PHARAOHS DAUGHTER FIRE BLAZE" },
  "CABA":         { 1: "CORONADOS DE GLORIA MEGAWAYS", 3: "CASH VOLT", 5: "EXTRA CHILLI" },
  "CORDOBA":      { 1: "CORONADOS DE GLORIA MEGAWAYS", 3: "CASH VOLT", 5: "EXTRA CHILLI" },
  "MENDOZA":      { 1: "CORONADOS DE GLORIA MEGAWAYS", 3: "CASH VOLT", 5: "EXTRA CHILLI" },
};

function fideTerms(prov) {
  if (prov === "MENDOZA") return { reward: "25 tiros en EFECTIVO", extra: "Sin rollover." };
  return { reward: "200 tiros", extra: "Rollover x60, máximo conversión $50.000, duración 24hs." };
}

function nextFideDay(today) {
  return FIDE_DAYS.find((d) => d > today) ?? FIDE_DAYS[0];
}

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

function fideCardHTML(prov, today, waNumber) {
  const slots = FIDE_SLOTS[prov];
  if (!slots) return "";
  const terms = fideTerms(prov);

  if (FIDE_DAYS.includes(today)) {
    const slot = slots[today];
    const dayName = DAY_NAMES[today];
    return `
      <article class="card promo-card">
        <div class="promo-card__head"><span class="badge badge-gold">FIDELIZACIÓN · HOY ${dayName.toUpperCase()}</span></div>
        <h3 class="promo-card__title">${terms.reward} por depósito de $10.000</h3>
        <p class="promo-card__text">Depósito de <strong>$10.000</strong>, recibís ${terms.reward} en <strong>${slot}</strong>. ${terms.extra}</p>
        <a class="btn btn-wpp btn-full" target="_blank" rel="noopener"
           href="${waLink(waNumber, `Hola, quiero activar la promo de fidelización de hoy (${slot})`)}">Activar por WhatsApp</a>
      </article>`;
  }

  const nd = nextFideDay(today);
  const slot = slots[nd];
  return `
    <article class="card promo-card promo-card--teaser">
      <div class="promo-card__head"><span class="badge badge-gold">PRÓXIMA FIDELIZACIÓN</span></div>
      <h3 class="promo-card__title">${DAY_NAMES[nd]}: ${terms.reward} en ${slot}</h3>
      <p class="promo-card__text">Depósito de <strong>$10.000</strong> y recibís ${terms.reward} en <strong>${slot}</strong>. ${terms.extra}</p>
      <a class="btn btn-wpp btn-full" target="_blank" rel="noopener"
         href="${waLink(waNumber, `Hola, quiero más info de la promo de fidelización del ${DAY_NAMES[nd]}`)}">Consultar por WhatsApp</a>
    </article>`;
}

// index.html → tarjetas de promo + texto de contexto ("Promos de hoy, Lunes, para Buenos Aires").
export function renderHomePromos(cardsEl, metaEl, province, waNumber) {
  if (!cardsEl) return;
  const today = new Date().getDay();
  cardsEl.innerHTML = ftdCardHTML(province, waNumber) + fideCardHTML(province, today, waNumber);
  if (metaEl) {
    metaEl.textContent = province
      ? `Promos de hoy, ${DAY_NAMES[today]}, para ${PROV_LABEL[province] || province}.`
      : "Escribinos por WhatsApp y te contamos la promo vigente en tu zona.";
  }
}
