/**
 * Client Supabase optionnel — ne plante pas sans VITE_SUPABASE_*.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_URL : "";
const supabaseAnonKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_ANON_KEY : "";

function texte(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function supabaseConfigure() {
  return Boolean(texte(supabaseUrl) && texte(supabaseAnonKey));
}

function clientManquant() {
  return new Proxy(
    {},
    {
      get(_cible, prop) {
        if (prop === "then") return undefined;
        throw new Error(
          "Supabase non configuré. Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env ou .env.local puis redémarrez Vite.",
        );
      },
    },
  );
}

export const supabase = (() => {
  if (!supabaseConfigure()) return clientManquant();
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    return clientManquant();
  }
})();

export function getSupabaseClient() {
  return supabaseConfigure() ? supabase : null;
}
