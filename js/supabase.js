// =========================================================
// Cliente Supabase ÚNICO para todo el sitio.
// La anon key es pública por diseño; la seguridad real la dan
// las políticas RLS de cada tabla.
// =========================================================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const SUPABASE_URL = "https://mkplcvwomznyyqniiwqt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcGxjdndvbXpueXlxbmlpd3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjY0MzMsImV4cCI6MjA3ODcwMjQzM30.Ckauv0DBuiHoXjFeZlmwgugtuuipw3VEYCA6lWuvYWo";

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
