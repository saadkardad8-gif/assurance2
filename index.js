// ============================================================
//  API Wafa Assurance — Ahl Al Khair
//  Backend Express + base de données fichier (server/db.json)
//  Aucune dépendance native : fonctionne partout avec Node 18+.
// ============================================================
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { seed } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "db.json");

// ---- Persistance ----------------------------------------------------------
function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
function load() {
  if (fs.existsSync(DB_PATH)) {
    try { return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); }
    catch { /* fichier corrompu : on réinitialise */ }
  }
  const data = JSON.parse(JSON.stringify(seed));
  save(data);
  console.log("Base initialisée depuis les données de démonstration → server/db.json");
  return data;
}
let db = load();
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);

// ---- Application ----------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ---- Authentification -----------------------------------------------------
// POST /api/login  { email, password }
app.post("/api/login", (req, res) => {
  const { email = "", password = "" } = req.body || {};
  if (!email || password.length < 4) {
    return res.status(422).json({ error: "Email ou mot de passe incorrect" });
  }
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  let role = "client";
  if (user) {
    if (!user.actif) return res.status(403).json({ error: "Votre compte a été désactivé, contactez l'administrateur" });
    role = user.role;
  } else if (email.includes("admin")) role = "admin";
  else if (email.includes("employe")) role = "employe";
  res.json({ token: "demo-token-" + Date.now(), role, email, user: user || null });
});

// ---- État global (utilisé par l'application React) ------------------------
// GET /api/state  -> renvoie toutes les collections
app.get("/api/state", (req, res) => res.json(db));
// PUT /api/state  -> remplace et sauvegarde toutes les collections
app.put("/api/state", (req, res) => {
  const b = req.body || {};
  db = {
    clients: b.clients ?? db.clients,
    contrats: b.contrats ?? db.contrats,
    sinistres: b.sinistres ?? db.sinistres,
    paiements: b.paiements ?? db.paiements,
    users: b.users ?? db.users,
    notifs: b.notifs ?? db.notifs,
  };
  save(db);
  res.json({ ok: true });
});

// ---- REST granulaire (mêmes routes que le backend Laravel du cahier) -------
// Génère automatiquement GET / POST / PUT / DELETE pour chaque ressource.
function resource(name) {
  app.get(`/api/${name}`, (req, res) => res.json(db[name]));
  app.get(`/api/${name}/:id`, (req, res) => {
    const item = db[name].find((x) => String(x.id) === req.params.id);
    return item ? res.json(item) : res.status(404).json({ error: "Ressource introuvable" });
  });
  app.post(`/api/${name}`, (req, res) => {
    const item = { ...req.body, id: nextId(db[name]) };
    db[name].push(item); save(db);
    res.status(201).json(item);
  });
  app.put(`/api/${name}/:id`, (req, res) => {
    const i = db[name].findIndex((x) => String(x.id) === req.params.id);
    if (i < 0) return res.status(404).json({ error: "Ressource introuvable" });
    db[name][i] = { ...db[name][i], ...req.body }; save(db);
    res.json(db[name][i]);
  });
  app.delete(`/api/${name}/:id`, (req, res) => {
    db[name] = db[name].filter((x) => String(x.id) !== req.params.id); save(db);
    res.json({ ok: true });
  });
}
["clients", "contrats", "sinistres", "paiements", "users", "notifs"].forEach(resource);

// ---- Tableau de bord ------------------------------------------------------
// GET /api/dashboard/stats
app.get("/api/dashboard/stats", (req, res) => {
  res.json({
    clients_count: db.clients.length,
    contrats_actifs: db.contrats.filter((c) => c.statut === "actif").length,
    contrats_expires: db.contrats.filter((c) => c.statut === "expire").length,
    sinistres_ouverts: db.sinistres.filter((s) => !["cloture", "refuse"].includes(s.statut)).length,
    revenus_mensuels: db.paiements.filter((p) => p.statut === "paye").reduce((a, p) => a + p.montant, 0),
  });
});

// ---- Réinitialisation (utile en démo) -------------------------------------
app.post("/api/reset", (req, res) => {
  db = JSON.parse(JSON.stringify(seed));
  save(db);
  res.json({ ok: true, message: "Base réinitialisée." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  API Wafa Assurance — Ahl Al Khair`);
  console.log(`  ➜  http://localhost:${PORT}/api\n`);
});
