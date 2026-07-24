// ============================================================
//  Service d'accès à l'API backend (Express)
//  En développement, Vite redirige /api vers http://localhost:3001
// ============================================================
const BASE = "/api";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error("Erreur API " + res.status);
  return res.json();
}

// Charge l'ensemble des données (clients, contrats, sinistres, paiements, utilisateurs, notifications)
export async function getState() {
  try {
    return await req("/state");
  } catch {
    return null; // l'app basculera sur les données de démonstration
  }
}

// Persiste l'état complet dans la base
export async function saveState(state) {
  try {
    return await req("/state", { method: "PUT", body: JSON.stringify(state) });
  } catch {
    return null;
  }
}

// Authentification
export async function login(email, password) {
  return req("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

// --- Exemples d'appels REST granulaires (mêmes routes que le backend Laravel du cahier) ---
export const clients = {
  list: () => req("/clients"),
  create: (c) => req("/clients", { method: "POST", body: JSON.stringify(c) }),
  update: (id, c) => req(`/clients/${id}`, { method: "PUT", body: JSON.stringify(c) }),
  remove: (id) => req(`/clients/${id}`, { method: "DELETE" }),
};
export const dashboard = {
  stats: () => req("/dashboard/stats"),
};
