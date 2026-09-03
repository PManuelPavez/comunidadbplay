// =========================================================
// UI — comportamientos de interfaz compartidos (una sola vez):
// menú hamburguesa, reloj, reveal on scroll, copiar al
// portapapeles y FAB de contacto.
// =========================================================

export function initMobileMenu() {
  const body = document.body;
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  const open = () => { body.classList.add("menu-open"); menu.hidden = false; toggle.setAttribute("aria-expanded", "true"); };
  const close = () => { body.classList.remove("menu-open"); menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); };

  toggle.addEventListener("click", () => body.classList.contains("menu-open") ? close() : open());
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("menu-open")) close(); });
}

export function initClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;
  const tick = () => { clock.textContent = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }); };
  tick();
  setInterval(tick, 30_000);
}

export function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

// Copiar al portapapeles. Soporta [data-copy="#sel"] o [data-copy-text="..."]
export function initClipboard() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy],[data-copy-text]");
    if (!btn) return;
    const text = btn.dataset.copyText
      ?? document.querySelector(btn.dataset.copy)?.textContent?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      document.execCommand("copy"); t.remove();
    }
    const prev = btn.textContent;
    btn.textContent = "Copiado ✓";
    setTimeout(() => (btn.textContent = prev), 1200);
  });
}

export function initContactFab() {
  const fab = document.getElementById("contactFab");
  if (!fab) return;
  const btn = fab.querySelector(".contact-fab__btn");
  btn.addEventListener("click", () => {
    const open = fab.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!fab.contains(e.target)) { fab.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  });
}

// Slider accesible por scroll-snap + dots (reemplaza initSlider de app.js).
export function initSlider(root) {
  const wrap = root.querySelector(".slides");
  if (!wrap) return;
  const slides = Array.from(wrap.querySelectorAll(".slide"));
  const dotsBox = root.querySelector(".dots");
  if (dotsBox) {
    dotsBox.innerHTML = slides.map((_, i) => `<button aria-label="Ir al slide ${i + 1}"></button>`).join("");
  }
  const dots = dotsBox ? Array.from(dotsBox.children) : [];
  dots.forEach((b, i) => b.addEventListener("click", () => wrap.scrollTo({ left: wrap.clientWidth * i, behavior: "smooth" })));
  const sync = () => {
    const i = Math.round(wrap.scrollLeft / wrap.clientWidth);
    dots.forEach((b, j) => b.classList.toggle("is-active", j === i));
  };
  wrap.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
  sync();
}

// Atajo: inicializa todo lo común de una página pública.
export function initCommonUI() {
  initMobileMenu();
  initClock();
  initReveal();
  initClipboard();
  initContactFab();
  document.querySelectorAll("[data-slider]").forEach(initSlider);
}
