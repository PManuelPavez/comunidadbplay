// =========================================================
// CONFIG — única fuente de verdad para datos de negocio:
// WhatsApp, provincias, links de registro/login y CBU.
// El número de WhatsApp puede overridearse en runtime desde
// la tabla `contenido_dinamico` (clave `whatsapp_num`).
// =========================================================

// Fallback si Supabase no responde (solo dígitos, formato 549...).
export const WHATSAPP_FALLBACK = "5492617490475";

export const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb3o9ai77qVPdzOk0w3o";
export const EMAIL = "atencionbplayperg@gmail.com";

// Links de registro/login por jurisdicción.
export const REG = {
  "BUENOS AIRES": "https://pba.bplay.bet.ar/register?memberid=10163&sourceid=73",
  "CABA":         "https://caba.bplay.bet.ar/register?memberid=37&sourceid=14",
  "SANTA FE":     "https://santafe.bplay.bet.ar/register?memberid=10154&sourceid=12",
  "CORDOBA":      "https://cordoba.bplay.bet.ar/register?memberid=21&sourceid=6",
  "MENDOZA":      "https://mendoza.bplay.bet.ar/register?memberid=33&sourceid=6",
};
export const LOGIN = {
  "BUENOS AIRES": "https://pba.bplay.bet.ar/login",
  "CABA":         "https://caba.bplay.bet.ar/login",
  "SANTA FE":     "https://santafe.bplay.bet.ar/login",
  "CORDOBA":      "https://cordoba.bplay.bet.ar/login",
  "MENDOZA":      "https://mendoza.bplay.bet.ar/login",
};
export const DEF_REG = "https://www.bplay.bet.ar/registro";
export const DEF_LOGIN = "https://www.bplay.bet.ar/login";

// CBU por provincia + alias/CUIT (para chat y página CBU).
export const BANK = {
  "BUENOS AIRES": { cbu: "0000061100000000014997", alias: "PBA.BPLAY.TC",     cuit: "30-71760639-2" },
  "CABA":         { cbu: "0000061100000000008059", alias: "CABA.BPLAY.TC",    cuit: "33-71708423-9" },
  "SANTA FE":     { cbu: "0000061100000000008387", alias: "SANTAFE.BPLAY.TC", cuit: "30-70975366-1" },
  "CORDOBA":      { cbu: "0000061100000000025021", alias: "cordoba.bplay.tc", cuit: "30-71766501-1" },
  "MENDOZA":      { cbu: "0000061100000000049650", alias: "mendoza.bplay.tc", cuit: "30-71806689-8" },
};

export const PROVINCES = Object.keys(REG);

// Construye una URL de WhatsApp con texto prellenado.
export function waLink(number, text = "") {
  const n = String(number || WHATSAPP_FALLBACK).replace(/\D/g, "");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${n}${q}`;
}
