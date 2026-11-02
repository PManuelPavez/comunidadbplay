import { initCommonUI, initReveal } from "../ui.js";
import { initJurisdiction, getSeedProvince, getWhatsappNumber } from "../geo.js";
import { WHATSAPP_FALLBACK } from "../config.js";
import { renderVipPromos } from "../promosHome.js";
import { initChatWidget } from "../chat/widget.js";

window.addEventListener("DOMContentLoaded", async () => {
  initCommonUI();
  initChatWidget();

  const vip = renderVipPromos(document.getElementById("vipRoot"), getSeedProvince(), WHATSAPP_FALLBACK);
  initReveal();

  // Una vez resuelta la provincia real y el WhatsApp vigente, se refina (sin pisar una elección manual).
  const [prov, wa] = await Promise.all([initJurisdiction(), getWhatsappNumber()]);
  vip.update(prov, wa);
});
