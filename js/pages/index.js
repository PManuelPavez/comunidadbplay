import { initCommonUI, initReveal } from "../ui.js";
import { initJurisdiction, getSeedProvince, getWhatsappNumber } from "../geo.js";
import { WHATSAPP_FALLBACK } from "../config.js";
import { renderHomePromos } from "../promosHome.js";
import { initChatWidget } from "../chat/widget.js";

window.addEventListener("DOMContentLoaded", async () => {
  initCommonUI();
  initChatWidget();

  const cardsEl = document.getElementById("promoCards");
  const metaEl = document.getElementById("promoMeta");

  // Pintado inmediato con lo que ya sabemos (cache/host), sin esperar geolocalización.
  renderHomePromos(cardsEl, metaEl, getSeedProvince(), WHATSAPP_FALLBACK);
  initReveal();

  // Una vez resuelta la provincia real (y el WhatsApp vigente), se repinta la promo.
  const [prov, wa] = await Promise.all([initJurisdiction(), getWhatsappNumber()]);
  renderHomePromos(cardsEl, metaEl, prov, wa);
});
