// === Supabase config ===
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(
  "https://mkplcvwomznyyqniiwqt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcGxjdndvbXpueXlxbmlpd3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjY0MzMsImV4cCI6MjA3ODcwMjQzM30.Ckauv0DBuiHoXjFeZlmwgugtuuipw3VEYCA6lWuvYWo"
);

// === Registrar visita ===
async function registrarVisita(provincia) {
  try {
    const { error } = await supabase.from('visitas').insert([{ provincia }]);
    if (error) throw error;
    console.log('✅ Visita registrada:', provincia);
  } catch (err) {
    console.error('❌ Error al registrar visita:', err.message);
  }
}

// === Detectar provincia desde el DOM
function detectarProvincia() {
  const geoEl = document.getElementById("geo");
  const prov = geoEl?.textContent || "Argentina";
  return prov.trim().toUpperCase();
}

// === Slider Hero (autoplay + fade)
function iniciarSliderHero() {
  const slider = document.getElementById("heroSlider");
  if (!slider) return;
  const slides = [...slider.querySelectorAll(".hs-slide")];
  const dotsWrap = slider.querySelector(".hs-dots");
  const delay = parseInt(slider.dataset.autoplay || 5000, 10);
  let idx = 0, timer = null, isHover = false;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "hs-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Ir al slide " + (i + 1));
    dot.onclick = () => go(i, true);
    dotsWrap.appendChild(dot);
  });

  const dots = [...dotsWrap.children];

  function go(n, fromUser = false) {
    slides[idx].classList.remove("is-active");
    dots[idx].classList.remove("is-active");
    idx = (n + slides.length) % slides.length;
    slides[idx].classList.add("is-active");
    dots[idx].classList.add("is-active");
    if (fromUser) restart();
  }

  const next = () => go(idx + 1);
  const start = () => (timer = setInterval(() => !isHover && next(), delay));
  const stop = () => clearInterval(timer);
  const restart = () => { stop(); start(); };

  slider.addEventListener("mouseenter", () => (isHover = true));
  slider.addEventListener("mouseleave", () => (isHover = false));
  start();
}

// === Reloj en vivo
function iniciarReloj() {
  const clock = document.getElementById("clock");
  if (!clock) return;
  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };
  tick();
  setInterval(tick, 1000);
}

// === Login / Registro dinámico por provincia
function configurarLinksDinamicos() {
  const REG = {
    "BUENOS AIRES": "https://pba.bplay.bet.ar/register?memberid=10163&sourceid=73",
    "CABA": "https://caba.bplay.bet.ar/register?memberid=37&sourceid=14",
    "SANTA FE": "https://santafe.bplay.bet.ar/register?memberid=10154&sourceid=12",
    "CORDOBA": "https://cordoba.bplay.bet.ar/register?memberid=21&sourceid=6",
    "MENDOZA": "https://mendoza.bplay.bet.ar/register?memberid=33&sourceid=6",
  };
  const LOGIN = {
    "BUENOS AIRES": "https://pba.bplay.bet.ar/login",
    "CABA": "https://caba.bplay.bet.ar/login",
    "SANTA FE": "https://santafe.bplay.bet.ar/login",
    "CORDOBA": "https://cordoba.bplay.bet.ar/login",
    "MENDOZA": "https://mendoza.bplay.bet.ar/login",
  };
  const DEF_REG = "https://www.bplay.bet.ar/registro";
  const DEF_LOGIN = "https://www.bplay.bet.ar/login";

  const geoEl = document.getElementById("geo");

  function setJurisdictionLinks(key) {
    const rURL = REG[key] || DEF_REG;
    const lURL = LOGIN[key] || DEF_LOGIN;
    document.querySelectorAll('[data-register-link]').forEach(a => a.href = rURL);
    document.querySelectorAll('[data-login-link]').forEach(a => a.href = lURL);
  }

  const normalizeProvince = (prov) => {
    let p = prov.toUpperCase()
      .replace("Á", "A").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Ú", "U");
    if (p.includes("CABA") || (p.includes("AUTONOMA") && p.includes("BUENOS AIRES"))) return "CABA";
    if (p.includes("BUENOS AIRES")) return "BUENOS AIRES";
    if (p.includes("SANTA FE")) return "SANTA FE";
    if (p.includes("CORDOBA")) return "CORDOBA";
    if (p.includes("MENDOZA")) return "MENDOZA";
    return null;
  };

  function reverseGeocode(lat, lon) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&accept-language=es`, {
      headers: { "User-Agent": "bplay-help/1.0" }
    }).then(r => r.json()).then(d => {
      const prov = d.address.state || "";
      geoEl.textContent = prov || "Argentina";
      const key = normalizeProvince(prov);
      setJurisdictionLinks(key);
      registrarVisita(prov);
    }).catch(() => {
      geoEl.textContent = "Argentina";
      setJurisdictionLinks(null);
    });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
      () => { geoEl.textContent = "Argentina"; setJurisdictionLinks(null); }
    );
  } else {
    geoEl.textContent = "Argentina";
    setJurisdictionLinks(null);
  }
}
// === WhatsApp dinámico desde tabla contenido_dinamico ===
async function configurarWhatsappDinamico() {
  try {
    const { data, error } = await supabase
      .from('contenido_dinamico')     // 👈 TU TABLA REAL
      .select('valor')
      .eq('clave', 'whatsapp_num')    // 👈 TU CLAVE REAL
      .maybeSingle();

    if (error) {
      console.error('Error leyendo whatsapp_num desde Supabase:', error);
      return;
    }

    if (!data || !data.valor) {
      console.warn('No se encontró whatsapp_num en contenido_dinamico');
      return;
    }

    const num = String(data.valor).replace(/\D/g, ''); // solo dígitos
    if (!num) {
      console.warn('whatsapp_num vacío o inválido:', data.valor);
      return;
    }

    console.log('✅ whatsapp_num desde Supabase:', num);

    const baseWa = `https://wa.me/${num}`;

    // 1) Actualizar TODOS los links a wa.me, manteniendo el ?text=...
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      try {
        const url = new URL(link.href);
        const query = url.search; // conserva ?text=...
        link.href = baseWa + query;
      } catch (e) {
        link.href = baseWa;
      }
    });

    // 2) Actualizar TODOS los tel:+...
    document.querySelectorAll('a[href^="tel:+"]').forEach(link => {
      link.href = `tel:+${num}`;
    });

    // 3) (opcional) actualizar texto visible si lo marcás con data-role
    document.querySelectorAll('[data-role="wpp-visible-num"]').forEach(el => {
      el.textContent = formatearNumeroLindo(num);
    });

  } catch (e) {
    console.error('Excepción en configurarWhatsappDinamico:', e);
  }
}

function formatearNumeroLindo(num) {
  // Si guardás 5492617490523 → mostramos "261 7490523"
  const sinPrefijo = num.replace(/^549/, ''); // si no usás 9, ajustá a /^54/
  return sinPrefijo.replace(/^(\d{3})(\d+)/, '$1 $2');
}

// === Init ===
// === Init ===
// === Init ===
window.addEventListener("DOMContentLoaded", () => {
  iniciarSliderHero();
  iniciarReloj();
  configurarLinksDinamicos();
  configurarWhatsappDinamico();   // 👈 agregado
});

