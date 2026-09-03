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

function parseCSV(text) {
  const rows = String(text || "").trim().split(/\r?\n/).map((r) => r.split(","));
  if (rows.length <= 1) return [];
  return rows.slice(1).map((c) => ({
    alias: (c[0] || "").trim(),
    provincia: (c[1] || "").trim(),
    puntos: Number((c[2] || "").trim().replace(",", ".")) || 0,
  })).filter((r) => r.alias);
}

function rowHTML(pos, j) {
  const badge = pos <= 3
    ? `<span class="rank-badge rank-badge--${["gold","silver","bronze"][pos - 1]}">${pos}° lugar</span>` : "";
  return `<tr>
    <td class="rank-pos">${pos}</td>
    <td class="rank-alias">${esc(j.alias)} ${badge}</td>
    <td class="rank-prov">${esc(j.provincia || "—")}</td>
    <td class="rank-pts">${fmtNum(j.puntos)}</td>
  </tr>`;
}

async function load() {
  const tbody = document.getElementById("rankingBody");
  const last = document.getElementById("rankingLastUpdate");
  const btn = document.getElementById("rankingReloadBtn");
  if (!tbody) return;
  try {
    if (btn) btn.disabled = true;
    const resp = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const players = parseCSV(await resp.text());
    if (!players.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="rank-empty">Todavía no hay jugadores en la tabla.</td></tr>`;
    } else {
      players.sort((a, b) => b.puntos - a.puntos || a.alias.localeCompare(b.alias));
      tbody.innerHTML = players.map((p, i) => rowHTML(i + 1, p)).join("");
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
  load();
  if (REFRESH_MS > 0) setInterval(load, REFRESH_MS);
}
