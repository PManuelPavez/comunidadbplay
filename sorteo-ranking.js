// 1) En tu Google Sheets:
//    - Columna A: ALIAS
//    - Columna B: PROVINCIA
//    - Columna C: PUNTOS
// 2) Archivo → Compartir → Publicar en la Web → Hoja específica → Formato CSV
// 3) Copiá la URL que termina en export?format=csv&...

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1CAbS02OwWjmJNh2oShQxKytEqvx1_YV4P4hbBvE3o6w/export?format=csv&gid=0";

// Intervalo de auto-refresh en milisegundos (60000 = 1 min).
// Ponelo en 0 si NO querés auto-actualización.
const RANKING_REFRESH_MS = 60000;

// IDs usados en el HTML
const RANKING_TBODY_ID = "rankingBody";
const RANKING_LAST_UPDATE_ID = "rankingLastUpdate";
const RANKING_RELOAD_BTN_ID = "rankingReloadBtn";

document.addEventListener("DOMContentLoaded", () => {
  initSorteoRanking();
});

function initSorteoRanking() {
  const tbody = document.getElementById(RANKING_TBODY_ID);
  if (!tbody) return; // otra página, no hacemos nada

  const reloadBtn = document.getElementById(RANKING_RELOAD_BTN_ID);
  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      cargarRankingDesdeSheets();
    });
  }

  cargarRankingDesdeSheets();

  if (RANKING_REFRESH_MS && RANKING_REFRESH_MS > 0) {
    setInterval(cargarRankingDesdeSheets, RANKING_REFRESH_MS);
  }
}

// =========================
// LÓGICA PRINCIPAL
// =========================

async function cargarRankingDesdeSheets() {
  const tbody = document.getElementById(RANKING_TBODY_ID);
  const lastUpdateEl = document.getElementById(RANKING_LAST_UPDATE_ID);
  const reloadBtn = document.getElementById(RANKING_RELOAD_BTN_ID);

  if (!tbody) return;

  if (!SHEET_CSV_URL || typeof SHEET_CSV_URL !== "string") {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="sorteo-ranking__empty">
          Configurá la URL de Google Sheets en <code>SHEET_CSV_URL</code>.
        </td>
      </tr>
    `;
    if (lastUpdateEl) {
      lastUpdateEl.textContent = "Última actualización: –";
    }
    return;
  }

  try {
    if (reloadBtn) reloadBtn.disabled = true;

    const resp = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!resp.ok) {
      throw new Error("Error HTTP " + resp.status);
    }

    const text = await resp.text();
    const jugadores = srParseCSV(text);

    if (!jugadores.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="sorteo-ranking__empty">
            Todavía no hay filas válidas en el Google Sheets
            (recordá usar columnas: ALIAS, PROVINCIA, PUNTOS).
          </td>
        </tr>
      `;
      if (lastUpdateEl) {
        lastUpdateEl.textContent = "Última actualización: " + srFormatDateTime(new Date());
      }
      return;
    }

    // Ordenar por puntos descendente y, en empate, alfabético por alias
    jugadores.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return a.alias.localeCompare(b.alias);
    });

    const filasHTML = jugadores
      .map((jugador, idx) => srBuildRowHTML(idx + 1, jugador))
      .join("");

    tbody.innerHTML = filasHTML;

    if (lastUpdateEl) {
      lastUpdateEl.textContent = "Última actualización: " + srFormatDateTime(new Date());
    }
  } catch (err) {
    console.error("No se pudo leer el ranking desde Sheets:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="sorteo-ranking__empty">
          No pudimos leer los datos del Google Sheets.<br>
          Verificá que la hoja esté publicada como CSV y que la URL sea correcta.
        </td>
      </tr>
    `;
    if (lastUpdateEl) {
      lastUpdateEl.textContent = "Última actualización: error al actualizar";
    }
  } finally {
    if (reloadBtn) reloadBtn.disabled = false;
  }
}

// =========================
// HELPERS
// =========================

function srParseCSV(text) {
  const raw = String(text || "").trim();
  if (!raw) return [];

  const rows = raw
    .split(/\r?\n/)
    .map((row) => row.split(","));

  if (rows.length <= 1) return [];

  const [, ...dataRows] = rows;

  return dataRows
    .map((cols) => {
      const alias = (cols[0] || "").trim();
      const provincia = (cols[1] || "").trim();
      const puntosRaw = (cols[2] || "").trim();

      const puntos = Number(puntosRaw.replace(",", ".")) || 0;

      return { alias, provincia, puntos };
    })
    .filter((r) => r.alias);
}

function srFormatNumber(n) {
  try {
    return Number(n).toLocaleString("es-AR");
  } catch {
    return String(n);
  }
}

function srFormatDateTime(date) {
  try {
    return date.toLocaleString("es-AR", { hour12: false });
  } catch {
    return date.toISOString();
  }
}

function srBuildRowHTML(pos, jugador) {
  const alias = jugador.alias || "—";
  const provincia = jugador.provincia || "—";
  const puntos = srFormatNumber(jugador.puntos || 0);

  let badgeClass = "";
  let badgeLabel = "";

  if (pos === 1) {
    badgeClass = "sorteo-ranking__badge sorteo-ranking__badge--gold";
    badgeLabel = "1° lugar";
  } else if (pos === 2) {
    badgeClass = "sorteo-ranking__badge sorteo-ranking__badge--silver";
    badgeLabel = "2° lugar";
  } else if (pos === 3) {
    badgeClass = "sorteo-ranking__badge sorteo-ranking__badge--bronze";
    badgeLabel = "3° lugar";
  }

  const badgeHTML = badgeClass
    ? `<span class="${badgeClass}">${badgeLabel}</span>`
    : "";

  return `
    <tr>
      <td class="sorteo-ranking__pos">${pos}</td>
      <td class="sorteo-ranking__alias">
        ${srEscape(alias)}
        ${badgeHTML}
      </td>
      <td class="sorteo-ranking__provincia">${srEscape(provincia)}</td>
      <td class="sorteo-ranking__puntos">${puntos}</td>
    </tr>
  `;
}

function srEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
