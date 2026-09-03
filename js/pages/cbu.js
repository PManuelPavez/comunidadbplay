import { initCommonUI } from "../ui.js";
import { detectProvince, getWhatsappNumber } from "../geo.js";
import { BANK, waLink } from "../config.js";
import { initChatWidget } from "../chat/widget.js";

window.addEventListener("DOMContentLoaded", async () => {
  initCommonUI();
  initChatWidget();

  const provEl = document.getElementById("cbuProv");
  const cbuEl = document.getElementById("cbuVal");
  const aliasEl = document.getElementById("cbuAlias");
  const cuitEl = document.getElementById("cbuCuit");
  const sel = document.getElementById("provSel");
  const waBtn = document.getElementById("waBtn");
  const waNumber = await getWhatsappNumber();

  function fill(prov) {
    const b = BANK[prov];
    provEl.textContent = prov || "—";
    cbuEl.textContent = b ? b.cbu : "—";
    if (aliasEl) aliasEl.textContent = b ? b.alias : "—";
    if (cuitEl) cuitEl.textContent = b ? b.cuit : "—";
    if (sel) sel.value = prov || "";
    if (waBtn) waBtn.href = waLink(waNumber, `Hola, ya tengo el CBU de ${prov || "mi provincia"} y quiero transferir`);
  }

  sel?.addEventListener("change", (e) => fill(e.target.value || null));

  const prov = await detectProvince();
  fill(prov);
});
