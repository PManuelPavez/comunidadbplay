import { initCommonUI, initReveal, initSlider } from "../ui.js";
import { initJurisdiction, getWhatsappNumber } from "../geo.js";
import { renderPromosPage } from "../promos.js";
import { initChatWidget } from "../chat/widget.js";

window.addEventListener("DOMContentLoaded", async () => {
  initCommonUI();
  initChatWidget();

  const wa = await getWhatsappNumber();
  const slider = document.getElementById("promoSlider");
  const info = document.getElementById("promoInfo");
  await renderPromosPage(slider, info, wa);

  initSlider(slider);

  // Sincroniza el panel de detalle con el slide visible.
  const slidesBox = slider.querySelector(".slides");
  const details = Array.from(info.querySelectorAll(".promo-detail"));
  const sync = () => {
    const i = Math.round(slidesBox.scrollLeft / slidesBox.clientWidth);
    details.forEach((d, j) => d.classList.toggle("is-active", j === i));
  };
  slidesBox.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });

  initReveal();
  initJurisdiction();
});
