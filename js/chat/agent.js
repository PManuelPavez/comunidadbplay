// =========================================================
// AGENT — bandeja de agente (agente.html). Requiere login con
// Supabase Auth (email/password). Lista conversaciones, muestra
// el hilo en tiempo real y permite responder / cerrar.
// =========================================================
import { db } from "../supabase.js";

const fmt = (iso) => new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

export function initAgentConsole() {
  const shell = document.getElementById("agentShell");
  const loginBox = document.getElementById("agentLogin");
  const convosEl = document.getElementById("agentConvos");
  const threadEl = document.getElementById("agentThread");
  const headEl = document.getElementById("agentMainHead");
  const form = document.getElementById("agentReply");
  const field = document.getElementById("agentField");

  let activeId = null;
  let convos = [];

  // ---- AUTH ----
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPass").value;
    const err = document.getElementById("loginErr");
    err.textContent = "";
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) { err.textContent = "No se pudo ingresar: " + error.message; return; }
    boot();
  });
  document.getElementById("agentLogout")?.addEventListener("click", async () => {
    await db.auth.signOut();
    location.reload();
  });

  async function start() {
    const { data } = await db.auth.getSession();
    if (data?.session) boot(); else show(loginBox);
  }
  function show(el) { [loginBox, shell].forEach((x) => x.hidden = true); el.hidden = false; }

  // ---- CONSOLA ----
  async function boot() {
    show(shell);
    await loadConvos();
    db.channel("agent:convos")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, loadConvos)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        if (p.new.conversation_id === activeId) appendMsg(p.new);
        loadConvos();
      })
      .subscribe();
  }

  async function loadConvos() {
    const { data } = await db.from("chat_conversations")
      .select("*").in("status", ["open", "agent"]).order("last_at", { ascending: false });
    convos = data || [];
    convosEl.innerHTML = convos.map((c) => `
      <button class="agent-convo ${c.id === activeId ? "is-active" : ""}" data-id="${c.id}">
        <span class="agent-convo__top">${c.province || "Visitante"} <span class="agent-convo__dot"></span></span>
        <span class="agent-convo__sub">${fmt(c.last_at || c.created_at)} · ${c.status}</span>
      </button>`).join("") || `<p class="agent-empty">Sin conversaciones abiertas</p>`;
    convosEl.querySelectorAll(".agent-convo").forEach((b) =>
      b.addEventListener("click", () => openConvo(b.dataset.id)));
  }

  async function openConvo(id) {
    activeId = id;
    shell.classList.add("viewing");
    const c = convos.find((x) => x.id === id);
    headEl.innerHTML = `<div><strong>${c?.province || "Visitante"}</strong>
      <div class="agent-convo__sub">${c?.status}</div></div>
      <button class="btn btn-sm" id="closeConvo">Cerrar caso</button>`;
    headEl.querySelector("#closeConvo").addEventListener("click", () => closeConvo(id));
    form.hidden = false;
    loadConvos();
    const { data } = await db.from("chat_messages")
      .select("*").eq("conversation_id", id).order("created_at", { ascending: true });
    threadEl.innerHTML = "";
    (data || []).forEach(appendMsg);
  }

  function appendMsg(m) {
    const div = document.createElement("div");
    div.className = `chat-msg ${m.sender === "agent" ? "visitor" : "agent"}`;
    div.innerHTML = `${m.body}<div class="chat-msg__meta">${m.sender} · ${fmt(m.created_at)}</div>`;
    threadEl.appendChild(div);
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const txt = field.value.trim();
    if (!txt || !activeId) return;
    field.value = "";
    await db.from("chat_messages").insert({ conversation_id: activeId, sender: "agent", body: txt });
    await db.from("chat_conversations").update({ last_at: new Date().toISOString() }).eq("id", activeId);
  });

  async function closeConvo(id) {
    await db.from("chat_conversations").update({ status: "closed" }).eq("id", id);
    activeId = null; threadEl.innerHTML = ""; form.hidden = true;
    shell.classList.remove("viewing");
    loadConvos();
  }

  document.getElementById("agentBack")?.addEventListener("click", () => shell.classList.remove("viewing"));

  start();
}
