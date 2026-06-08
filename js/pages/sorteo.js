// Entrypoint de sorteo.html (migrado a módulos ES).
import { initMobileMenu, initClock, initReveal, initClipboard } from "../ui.js";
import { initJurisdiction } from "../geo.js";
import { initChatWidget } from "../chat/widget.js";
import { initSorteoContent } from "../sorteo/content.js";
import { initRanking } from "../sorteo/ranking.js";

function hideLoader() {
  const loader = document.getElementById("sorteoLoader");
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add("is-hidden");
    document.body.classList.add("sorteo-ready");
  }, 1400);
}

window.addEventListener("DOMContentLoaded", () => {
  hideLoader();
  initMobileMenu();
  initClock();
  initReveal();
  initClipboard();
  initChatWidget();
  initJurisdiction();
  initSorteoContent();
  initRanking();
});
