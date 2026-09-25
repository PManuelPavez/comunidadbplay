// =========================================================
// WIDGET — chat del visitante. Arranca con el bot (flow.js) y
// puede escalar a un agente real vía Supabase Realtime.
// Identidad del visitante: auth anónima de Supabase (si está
// habilitada). Si el backend falla en cualquier punto, degrada
// elegantemente a WhatsApp.
// =========================================================
import { db } from "../supabase.js";
import { waLink } from "../config.js";
import { buildFlow, routeText } from "./flow.js";
import { applyDynamicWhatsapp, getWhatsappNumber, getSeedProvince } from "../geo.js";
import { escapeHTML } from "../ui.js";
import { initVideoEmbeds } from "../videos.js";

const STORE_CONVO = "bp.convo";

// Tema de "Problemas comunes" (home) → paso del bot.
const TOPIC_STEP = {
  registro: "prob_registro", deposito: "post_deposito", retiro: "retiros",
  validacion: "prob_validacion", codigo: "prob_codigo", autoexclusion: "prob_autoexclusion", ayuda: "problemas",
};

export function initChatWidget() {
  const flow = buildFlow();
  let mode = "bot";          // bot | live
  let convoId = null;
  let channel = null;
  let waNumber = null;
  let lastTopic = "";

  // ---- DOM ----
  const root = document.createElement("div");
  root.innerHTML = `
    <button class="chat-launcher" id="chatLauncher" aria-label="Abrir chat de soporte">
      💬<span class="chat-launcher__badge" id="chatBadge">1</span>
    </button>
    <section class="chat-panel" id="chatPanel" role="dialog" aria-label="Chat de soporte">
      <header class="chat-head">
        <div class="chat-head__avatar">B</div>
        <div>
          <div class="chat-head__title">Soporte BPLAY</div>
          <div class="chat-head__status" id="chatStatus">Asistente automático</div>
        </div>
        <button class="chat-head__close" id="chatClose" aria-label="Cerrar">✕</button>
      </header>
      <div class="chat-body" id="chatBody"></div>
      <div class="chat-options" id="chatOptions"></div>
      <form class="chat-input show" id="chatInput" autocomplete="off">
        <input id="chatField" placeholder="Escribí tu consulta…" aria-label="Mensaje" maxlength="500">
        <button type="submit" aria-label="Enviar">➤</button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const $ = (id) => root.querySelector(id);
  const panel = $("#chatPanel"), body = $("#chatBody"), optionsBox = $("#chatOptions");
  const inputForm = $("#chatInput"), field = $("#chatField"), statusEl = $("#chatStatus");
  const badge = $("#chatBadge");

  initVideoEmbeds();
  const ctx = () => ({ province: localStorage.getItem("bp.province") || getSeedProvince() });

  // ---- helpers UI ----
  // `html` solo para contenido propio del bot; todo texto escrito por personas va por addText().
  function addMessage(html, sender) {
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
  function addText(text, sender) { addMessage(escapeHTML(text), sender); }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "chat-msg bot chat-typing";
    el.setAttribute("aria-label", "El asistente está escribiendo");
    el.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }
  function renderOptions(options) {
    optionsBox.innerHTML = "";
    optionsBox.style.display = "flex";
    options.forEach((opt) => {
      const b = document.createElement("button");
      b.textContent = opt.label;
      if (opt.primary) b.classList.add("primary");
      b.addEventListener("click", () => handleOption(opt));
      optionsBox.appendChild(b);
    });
  }
  function goToStep(stepId) {
    const step = flow[stepId];
    if (!step) return;
    optionsBox.style.display = "none";
    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      addMessage(typeof step.html === "function" ? step.html(ctx()) : step.html, "bot");
      renderOptions(step.options);
    }, 450);
  }
  function handleOption(opt) {
    addText(opt.label, "visitor");
    if (opt.action === "human") return escalateToHuman();
    if (opt.action === "whatsapp") return goWhatsApp();
    goToStep(opt.next);
  }
  async function goWhatsApp() {
    const n = waNumber || (waNumber = await getWhatsappNumber());
    window.open(waLink(n, "Hola, necesito ayuda de soporte"), "_blank");
  }

  // ---- escalar a agente ----
  async function escalateToHuman() {
    optionsBox.style.display = "none";
    addMessage("Te estoy conectando con una persona del equipo… ⏳", "bot");
    try {
      // identidad anónima (si está habilitada en el proyecto)
      const { data: sess } = await db.auth.getSession();
      if (!sess?.session) await db.auth.signInAnonymously();

      const province = localStorage.getItem("bp.province") || null;
      const { data, error } = await db
        .from("chat_conversations")
        .insert({ province, status: "agent" })
        .select("id").single();
      if (error) throw error;

      convoId = data.id;
      localStorage.setItem(STORE_CONVO, convoId);
      mode = "live";
      statusEl.textContent = "Conectado con soporte";
      statusEl.classList.add("online");
      inputForm.classList.add("show");
      addMessage("¡Listo! Dejá tu consulta y un agente te responde acá mismo. 💬", "agent");
      await sendMessage(`Hola, vengo del asistente y quiero hablar con una persona.${lastTopic ? ` (Tema: ${lastTopic})` : ""}`, "visitor", true);
      subscribe();
    } catch (e) {
      console.warn("chat: backend no disponible, derivo a WhatsApp", e?.message);
      addMessage("No pude abrir el chat en vivo ahora. Te paso a WhatsApp 👇", "bot");
      renderOptions([{ label: "💬 Abrir WhatsApp", action: "whatsapp", primary: true }, { label: "⬅️ Volver", next: "start" }]);
    }
  }

  function subscribe() {
    channel = db.channel(`msgs:${convoId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${convoId}` },
        (payload) => {
          const m = payload.new;
          if (m.sender === "visitor") return; // ya lo mostramos al enviar
          addText(m.body, m.sender === "agent" ? "agent" : "bot");
          if (!panel.classList.contains("open")) showBadge();
        })
      .subscribe();
  }

  async function sendMessage(bodyText, sender = "visitor", silent = false) {
    if (!silent) addText(bodyText, sender);
    if (!convoId) return;
    await db.from("chat_messages").insert({ conversation_id: convoId, sender, body: bodyText });
    await db.from("chat_conversations").update({ last_at: new Date().toISOString() }).eq("id", convoId);
  }

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const txt = field.value.trim();
    if (!txt) return;
    field.value = "";
    if (mode === "live") return sendMessage(txt, "visitor");
    // Modo bot: enruta el texto libre por palabras clave.
    addText(txt, "visitor");
    lastTopic = txt.slice(0, 80);
    const route = routeText(txt);
    if (route.action === "human") return escalateToHuman();
    goToStep(route.next);
  });

  // Retoma una conversación en vivo abierta antes de recargar la página.
  async function resumeConvo() {
    const id = localStorage.getItem(STORE_CONVO);
    if (!id) return false;
    try {
      const { data: c } = await db.from("chat_conversations").select("id,status").eq("id", id).maybeSingle();
      if (!c || c.status === "closed") { localStorage.removeItem(STORE_CONVO); return false; }
      const { data: msgs, error } = await db.from("chat_messages")
        .select("sender,body").eq("conversation_id", id).order("created_at", { ascending: true });
      if (error) throw error;
      convoId = id; mode = "live";
      statusEl.textContent = "Conectado con soporte";
      statusEl.classList.add("online");
      optionsBox.style.display = "none";
      (msgs || []).forEach((m) => addText(m.body, m.sender === "agent" ? "agent" : "visitor"));
      subscribe();
      return true;
    } catch { localStorage.removeItem(STORE_CONVO); return false; }
  }

  // ---- open / close ----
  function showBadge() { badge.classList.add("show"); }
  async function open(step) {
    panel.classList.add("open"); badge.classList.remove("show");
    if (!body.childElementCount) {
      if (!(await resumeConvo())) goToStep(step || "start");
    } else if (step && mode === "bot") {
      goToStep(step);
    }
    if (mode === "bot") field.focus({ preventScroll: true });
  }
  function close() { panel.classList.remove("open"); }

  $("#chatLauncher").addEventListener("click", () => panel.classList.contains("open") ? close() : open());
  $("#chatClose").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) close(); });

  // Desde "Problemas comunes" (home): abre el chat directo en el tema elegido.
  window.addEventListener("bp:open-chat", (e) => {
    const step = TOPIC_STEP[e.detail?.step];
    if (step) lastTopic = e.detail.step;
    open(step);
  });

  // refresca el número visible de WhatsApp del sitio
  applyDynamicWhatsapp().then((n) => (waNumber = n));
}
