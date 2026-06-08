// =========================================================
// FLOW — árbol de decisiones del bot de soporte.
// Migrado y depurado desde el viejo chat.js. Data-driven:
// cada paso es { html, options:[{label, next|action}] }.
// Las acciones especiales: "human" (deriva a agente),
// "whatsapp" (deriva a WhatsApp).
// =========================================================
import { BANK, PROVINCES } from "../config.js";

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

export function buildFlow() {
  const flow = {
    start: {
      html: "👋 ¡Hola! Soy el asistente de <b>BPLAY Soporte</b> 💚\n¿Con qué te ayudo?",
      options: [
        { label: "💰 Depositar dinero", next: "depositos" },
        { label: "💸 Retiros", next: "retiros" },
        { label: "🎁 Promociones", next: "promos" },
        { label: "⚠️ Tengo un problema", next: "problemas" },
        { label: "🧑‍💼 Hablar con una persona", action: "human", primary: true },
      ],
    },
    depositos: {
      html: "💰 <b>Depósitos</b>\nElegí tu provincia para ver el CBU 👇",
      options: [
        ...PROVINCES.map((p) => ({ label: p, next: `cbu:${p}` })),
        { label: "⬅️ Volver", next: "start" },
      ],
    },
    retiros: {
      html: "💸 <b>Retiros</b>\nSe hacen desde la plataforma (no por chat).\n\n✅ Saldo en efectivo\n✅ Cuenta validada\n✅ CBU cargado\n\n⏱ Pueden tardar hasta 24 hs.",
      options: [
        { label: "🔐 Ayuda con validación", action: "human" },
        { label: "⬅️ Volver", next: "start" },
      ],
    },
    promos: {
      html: "🎁 <b>Promociones</b>\nTenemos promos todos los días 🔥\nTe activamos la mejor disponible ahora mismo.",
      options: [
        { label: "💬 Quiero activar una promo", action: "human", primary: true },
        { label: "⬅️ Volver", next: "start" },
      ],
    },
    problemas: {
      html: "⚠️ Antes de seguir:\n• Revisá usuario y contraseña\n• Probá de nuevo\n\n¿Seguís con el problema?",
      options: [
        { label: "💬 Hablar con soporte", action: "human", primary: true },
        { label: "⬅️ Volver", next: "start" },
      ],
    },
    post_deposito: {
      html: "⏳ <b>Perfecto 👍</b>\nLa acreditación es <b>automática</b>, suele tardar minutos.\nNo hace falta enviar comprobante.\n\nSolo escribinos si pasan más de 15 minutos.",
      options: [
        { label: "💬 Necesito ayuda", action: "human" },
        { label: "⬅️ Inicio", next: "start" },
      ],
    },
  };

  // Pasos de CBU por provincia (generados desde config).
  PROVINCES.forEach((p) => {
    flow[`cbu:${p}`] = {
      html: `⚡ <b>La acreditación es automática.</b>\nNo necesitás avisar ni enviar comprobante.${cbuCard(p)}`,
      options: [
        { label: "✅ Ya transferí", next: "post_deposito" },
        { label: "⬅️ Volver", next: "depositos" },
      ],
    };
  });

  return flow;
}
