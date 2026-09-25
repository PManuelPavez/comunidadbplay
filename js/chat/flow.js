// =========================================================
// FLOW — árbol de decisiones del bot de soporte.
// Data-driven: cada paso es { html, options:[{label, next|action}] }.
// `html` puede ser string o función (ctx) => string, con
// ctx = { province } (para respuestas que dependen de la zona).
// Acciones especiales: "human" (deriva a agente), "whatsapp".
// routeText() enruta texto libre del visitante a un paso.
// =========================================================
import { BANK, PROVINCES } from "../config.js";
import { VIDEOS, AUTOEXCLUSION, videoEmbedHTML } from "../videos.js";
import { promoSummaryHTML } from "../promosHome.js";

function cbuCard(prov) {
  const b = BANK[prov];
  if (!b) return "";
  return `
    <div class="chat-cbu">
      <div><strong>💳 ${prov}</strong></div>
      <div class="chat-cbu__num">${b.cbu}</div>
      <div class="chat-cbu__data">Alias: ${b.alias} · CUIT: ${b.cuit}</div>
      <button type="button" data-copy-text="${b.cbu}">📋 Copiar CBU</button>
    </div>`;
}

const back = { label: "⬅️ Problemas comunes", next: "problemas" };
const human = { label: "🧑‍💼 Hablar con una persona", action: "human", primary: true };

export function buildFlow() {
  const flow = {
    start: {
      html: "👋 ¡Hola! Soy el asistente de <b>BPLAY Soporte</b> 💚\n¿Con qué te ayudo?",
      options: [
        { label: "💰 Depositar dinero", next: "depositos" },
        { label: "💸 Retiros", next: "retiros" },
        { label: "🎁 Promociones", next: "promos" },
        { label: "⚠️ Problemas comunes", next: "problemas" },
        human,
      ],
    },
    depositos: {
      html: "💰 <b>Depósitos</b>\nElegí tu provincia para ver el CBU 👇",
      options: [
        ...PROVINCES.map((p) => ({ label: p, next: `cbu:${p}` })),
        { label: "🎥 ¿Cómo depositar? (video)", next: "video:depositar" },
        { label: "⬅️ Volver", next: "start" },
      ],
    },
    retiros: {
      html: `💸 <b>Retiros</b>\nSe hacen desde la plataforma (no por chat).\n\n✅ Saldo en efectivo\n✅ Cuenta validada\n✅ CBU cargado\n\n⏱ Pueden tardar hasta 24 hs.${videoEmbedHTML(VIDEOS.retirar)}`,
      options: [
        { label: "🔐 Validar mi cuenta", next: "prob_validacion" },
        human,
        { label: "⬅️ Volver", next: "start" },
      ],
    },
    promos: {
      html: ({ province }) => {
        const summary = promoSummaryHTML(province);
        return summary
          ? `🎁 <b>Promociones de hoy en tu zona</b>\n${summary}\n\nTe la activamos por acá 👇`
          : "🎁 <b>Promociones</b>\nTenemos promos todos los días 🔥\nTe activamos la mejor disponible ahora mismo.";
      },
      options: [
        { label: "💬 Quiero activar una promo", action: "human", primary: true },
        { label: "🎟️ Tengo un código promocional", next: "prob_codigo" },
        { label: "⬅️ Volver", next: "start" },
      ],
    },
    problemas: {
      html: "⚠️ <b>Problemas comunes</b>\nElegí el tuyo y te muestro cómo resolverlo 👇",
      options: [
        { label: "⏳ Mi depósito no se acreditó", next: "post_deposito" },
        { label: "💸 No puedo retirar", next: "retiros" },
        { label: "🔐 Validar mi cuenta", next: "prob_validacion" },
        { label: "🔑 No puedo ingresar", next: "prob_acceso" },
        { label: "📝 Registrarme", next: "prob_registro" },
        { label: "🚫 Autoexclusión", next: "prob_autoexclusion" },
        human,
        { label: "⬅️ Inicio", next: "start" },
      ],
    },
    prob_acceso: {
      html: "🔑 <b>No puedo ingresar</b>\n• Revisá usuario y contraseña\n• Verificá que estés en la plataforma de <b>tu provincia</b>\n• Probá de nuevo\n\n¿Seguís con el problema?",
      options: [human, back],
    },
    prob_validacion: {
      html: `🔐 <b>Validar mi cuenta</b>\nSeguí el paso a paso del video 👇${videoEmbedHTML(VIDEOS.validar)}`,
      options: [{ label: "💬 Me trabé, necesito ayuda", action: "human", primary: true }, back],
    },
    prob_registro: {
      html: `📝 <b>Registrarme</b>\nRegistrate en Bplay de tu provincia y escribinos para activar tus promos 👇${videoEmbedHTML(VIDEOS.registro)}`,
      options: [human, back],
    },
    prob_codigo: {
      html: `🎟️ <b>Código promocional</b>\nMirá cómo cargarlo en la plataforma 👇${videoEmbedHTML(VIDEOS.codigo)}`,
      options: [{ label: "💬 Quiero activar una promo", action: "human", primary: true }, back],
    },
    prob_autoexclusion: {
      html: ({ province }) => {
        const v = AUTOEXCLUSION[province];
        if (!v) return "🚫 <b>Autoexclusión</b>\nEl trámite depende de tu jurisdicción. Elegí la tuya 👇";
        return `🚫 <b>Autoexclusión — ${v.label}</b>\nEste es el trámite para tu jurisdicción 👇${videoEmbedHTML({ id: v.id, title: `¿Cómo autoexcluirme? — ${v.label}` })}`;
      },
      options: [
        ...Object.entries(AUTOEXCLUSION).map(([k, v]) => ({ label: v.label, next: `autoex:${k}` })),
        back,
      ],
    },
    post_deposito: {
      html: `⏳ <b>Perfecto 👍</b>\nLa acreditación es <b>automática</b>, suele tardar minutos.\nNo hace falta enviar comprobante.\n\nSolo escribinos si pasan más de 15 minutos.${videoEmbedHTML(VIDEOS.depositar)}`,
      options: [
        { label: "💬 Necesito ayuda", action: "human", primary: true },
        { label: "⬅️ Inicio", next: "start" },
      ],
    },
    "video:depositar": {
      html: `🎥 <b>¿Cómo depositar?</b>${videoEmbedHTML(VIDEOS.depositar)}`,
      options: [{ label: "⬅️ Volver", next: "depositos" }],
    },
    fuera_de_tema: {
      html: "No estoy seguro de haberte entendido 🤔\nProbá con una de estas opciones o hablá con una persona.",
      options: [
        { label: "⚠️ Problemas comunes", next: "problemas" },
        { label: "🎁 Promociones", next: "promos" },
        human,
      ],
    },
  };

  // CBU por provincia (generado desde config).
  PROVINCES.forEach((p) => {
    flow[`cbu:${p}`] = {
      html: `⚡ <b>La acreditación es automática.</b>\nNo necesitás avisar ni enviar comprobante.${cbuCard(p)}`,
      options: [
        { label: "✅ Ya transferí", next: "post_deposito" },
        { label: "⬅️ Volver", next: "depositos" },
      ],
    };
  });

  // Autoexclusión por jurisdicción elegida a mano.
  Object.entries(AUTOEXCLUSION).forEach(([k, v]) => {
    flow[`autoex:${k}`] = {
      html: `🚫 <b>Autoexclusión — ${v.label}</b>${videoEmbedHTML({ id: v.id, title: `¿Cómo autoexcluirme? — ${v.label}` })}`,
      options: [{ label: "⬅️ Otra jurisdicción", next: "prob_autoexclusion" }, human],
    };
  });

  return flow;
}

// ---- Enrutado de texto libre (palabras clave) ----
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const RULES = [
  { re: /(persona|agente|humano|asesor|operador|hablar con)/, to: { action: "human" } },
  { re: /(no se acredit|no acredit|no me llego|no llego|no aparece.*(saldo|deposito))/, to: { next: "post_deposito" } },
  { re: /(retir|cobrar|sacar (la )?plata|premio)/, to: { next: "retiros" } },
  { re: /(valid|verific|dni|identidad)/, to: { next: "prob_validacion" } },
  { re: /(codigo|cupon|promocional)/, to: { next: "prob_codigo" } },
  { re: /(autoexcl|excluir)/, to: { next: "prob_autoexclusion" } },
  { re: /(promo|bono|tiros|giros|fidelizacion|ftd|primer deposito)/, to: { next: "promos" } },
  { re: /(deposit|cbu|alias|transfer|cargar|carga)/, to: { next: "depositos" } },
  { re: /(registr|crear (una )?cuenta|cuenta nueva)/, to: { next: "prob_registro" } },
  { re: /(contrasena|clave|password|no puedo (entrar|ingresar)|ingres|login|usuario)/, to: { next: "prob_acceso" } },
  { re: /(problema|ayuda|no funciona|error)/, to: { next: "problemas" } },
  { re: /^(hola|buenas|buen dia|buenas tardes|buenas noches)\b/, to: { next: "start" } },
];

export function routeText(text) {
  const t = norm(text);
  const hit = RULES.find((r) => r.re.test(t));
  return hit ? hit.to : { next: "fuera_de_tema" };
}
