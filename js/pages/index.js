import { initCommonUI, initReveal } from "../ui.js";
import { initJurisdiction, getWhatsappNumber } from "../geo.js";
import { renderHeroBanners } from "../promos.js";
import { initChatWidget } from "../chat/widget.js";

window.addEventListener("DOMContentLoaded", async () => {
  initCommonUI();
  initChatWidget();
  const wa = await getWhatsappNumber();
  await renderHeroBanners(document.getElementById("promoHero"), wa);
  initReveal();            // capta los banners recién insertados
  initJurisdiction();      // links de registro/login + WhatsApp dinámico
});
