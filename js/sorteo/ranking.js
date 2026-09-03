// =========================================================
// SORTEO · tabla de puntos (reemplaza sorteo-ranking.js legacy).
// Lee un Google Sheets publicado como CSV (columnas: ALIAS,
// PROVINCIA, PUNTOS). No usa Supabase.
// =========================================================
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1CAbS02OwWjmJNh2oShQxKytEqvx1_YV4P4hbBvE3o6w/export?format=csv&gid=0";
const REFRESH_MS = 60000;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtNum = (n) => { try { return Number(n).toLocaleString("es-AR"); } catch { return String(n); } };
const fmtTime = (d) => { try { return d.toLocaleString("es-AR", { hour12: false }); } catch { return d.toISOString(); } };

// Parser CSV que respeta comillas (soporta comas y comillas escapadas
// dentro de un campo, como exporta Google Sheets).
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  const str = String(text || "");
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inQuotes) {
      if (c === '"') {
        if (str[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && str[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  if (rows.length <= 1) return [];
  return rows.slice(1).map((c) => ({
    alias: (c[0] || "").trim(),
    provincia: (c[1] || "").trim(),
    puntos: Number((c[2] || "").trim().replace(",", ".")) || 0,
  })).filter((r) => r.alias);
}

function badgeHTML(pos) {
  if (pos === 1) return `<span class="rank-badge rank-badge--gold">1° lugar</span>`;
  if (pos === 2) return `<span class="rank-badge rank-badge--silver">2° lugar</span>`;
  if (pos === 3) return `<span class="rank-badge rank-badge--bronze">$10.000</span>`;
  if (pos <= 8) return `<span class="rank-badge rank-badge--prize">$10.000</span>`;
  return "";
}

function rowHTML(pos, j) {
  const badge = badgeHTML(pos);
  const prizeClass = pos <= 8 ? " rank-prize" : "";
  return `<tr data-alias="${esc(j.alias.toLowerCase())}" class="${prizeClass.trim()}">
    <td class="rank-pos">${pos}</td>
    <td class="rank-alias">${esc(j.alias)} ${badge}</td>
    <td class="rank-prov">${esc(j.provincia || "—")}</td>
    <td class="rank-pts">${fmtNum(j.puntos)}</td>
  </tr>`;
}

const MEDALS = ["🥇", "🥈", "🥉"];
function renderPodium(players) {
  const box = document.getElementById("rankingPodium");
  if (!box) return;
  const top3 = players.slice(0, 3);
  if (!top3.length) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = top3.map((p, i) => `
    <div class="podium-card podium-card--${i + 1}">
      <span class="podium-medal">${MEDALS[i]}</span>
      <span class="podium-alias">${esc(p.alias)}</span>
      <span class="podium-prov">${esc(p.provincia || "—")}</span>
      <span class="podium-pts">${fmtNum(p.puntos)} pts</span>
    </div>`).join("");
}

function filterRanking(query) {
  const tbody = document.getElementById("rankingBody");
  const empty = document.getElementById("rankingSearchEmpty");
  if (!tbody) return;
  const q = query.trim().toLowerCase();
  let matches = 0;
  tbody.querySelectorAll("tr[data-alias]").forEach((tr) => {
    const isMatch = !q || tr.dataset.alias.includes(q);
    tr.hidden = !isMatch;
    tr.classList.toggle("is-match", Boolean(q) && isMatch);
    if (isMatch) matches++;
  });
  if (empty) empty.hidden = matches !== 0 || !q;
}

function setupSearch() {
  const input = document.getElementById("rankingSearch");
  input?.addEventListener("input", () => filterRanking(input.value));
}

async function load() {
  const tbody = document.getElementById("rankingBody");
  const last = document.getElementById("rankingLastUpdate");
  const count = document.getElementById("rankingCount");
  const btn = document.getElementById("rankingReloadBtn");
  const search = document.getElementById("rankingSearch");
  if (!tbody) return;
  try {
    if (btn) btn.disabled = true;
    const resp = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const players = parseCSV(await resp.text());
    if (!players.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="rank-empty">Todavía no hay jugadores en la tabla.</td></tr>`;
      document.getElementById("rankingPodium")?.setAttribute("hidden", "");
      if (count) count.textContent = "";
    } else {
      players.sort((a, b) => b.puntos - a.puntos || a.alias.localeCompare(b.alias));
      tbody.innerHTML = players.map((p, i) => rowHTML(i + 1, p)).join("");
      renderPodium(players);
      if (count) count.textContent = `${players.length} jugador${players.length === 1 ? "" : "es"}`;
      if (search?.value) filterRanking(search.value);
    }
    if (last) last.textContent = "Última actualización: " + fmtTime(new Date());
  } catch (err) {
    console.error("ranking:", err);
    tbody.innerHTML = `<tr><td colspan="4" class="rank-empty">No pudimos leer la tabla ahora. Probá de nuevo en un rato.</td></tr>`;
    if (last) last.textContent = "Última actualización: error";
  } finally {
    if (btn) btn.disabled = false;
  }
}

export function initRanking() {
  if (!document.getElementById("rankingBody")) return;
  document.getElementById("rankingReloadBtn")?.addEventListener("click", load);
  setupSearch();
  load();
  if (REFRESH_MS > 0) setInterval(load, REFRESH_MS);
}
