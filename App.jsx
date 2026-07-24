import React, { useState, useMemo, useEffect } from "react";
import * as api from "./api.js";
import { jsPDF } from "jspdf";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, Users, FileText, ShieldAlert, CreditCard,
  Bell, UserCog, LogOut, Search, Plus, Car, Bike, Menu, X,
  ChevronRight, Check, AlertTriangle, Eye, RefreshCw, Trash2,
  Phone, Mail, MapPin, Calendar, Wallet, TrendingUp, FileCheck,
  Lock, ArrowRight, Building2, CheckCircle2, Clock, XCircle, Download,
} from "lucide-react";

/* ============================================================
   WAFA ASSURANCE — AHL AL KHAIR
   Espace de gestion — Assurance Automobile (Voitures & Motos)
   Front-office React (données de démonstration en mémoire)
   ============================================================ */

// ---- Identité visuelle -------------------------------------------------
const GOLD = "#F2B01E";
const GOLD_DARK = "#C98A0B";
const GREEN = "#3E8B41";
const GREEN_DARK = "#2E6E31";
const NAVY = "#0B2138";
const NAVY_SOFT = "#12304F";
const INK = "#0E1B2A";
const PAPER = "#F5F2EB";
const LINE = "#E7E1D4";

const fmtMAD = (n) =>
  new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " DH";
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("fr-MA", { day: "2-digit", month: "short", year: "numeric" });

const today = new Date("2026-07-24");
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// ---- Données de démonstration -----------------------------------------
const SEED_CLIENTS = [
  { id: 1, reference: "CLI-2022-0148", nom: "El Amrani", prenom: "Youssef", cin: "BK449120", email: "y.elamrani@gmail.com", telephone: "0661234501", ville: "Casablanca", adresse: "12 Rue Ibn Batouta", dateNaissance: "1988-03-14", depuis: "2022-01-10" },
  { id: 2, reference: "CLI-2022-0201", nom: "Benjelloun", prenom: "Salma", cin: "BE778211", email: "salma.benj@outlook.com", telephone: "0662345612", ville: "Rabat", adresse: "45 Av. Mohammed V", dateNaissance: "1992-07-22", depuis: "2022-05-03" },
  { id: 3, reference: "CLI-2021-0912", nom: "Ouazzani", prenom: "Karim", cin: "CD112390", email: "k.ouazzani@gmail.com", telephone: "0663456723", ville: "Marrakech", adresse: "8 Rue de la Liberté", dateNaissance: "1985-11-30", depuis: "2021-09-18" },
  { id: 4, reference: "CLI-2024-0033", nom: "Chraibi", prenom: "Nadia", cin: "AB556012", email: "nadia.ch@gmail.com", telephone: "0664567834", ville: "Fès", adresse: "23 Bd Hassan II", dateNaissance: "1990-02-08", depuis: "2024-01-20" },
  { id: 5, reference: "CLI-2023-0500", nom: "Tazi", prenom: "Mehdi", cin: "EE203417", email: "mehdi.tazi@gmail.com", telephone: "0665678945", ville: "Tanger", adresse: "5 Rue Al Massira", dateNaissance: "1995-09-12", depuis: "2023-07-11" },
  { id: 6, reference: "CLI-2023-0611", nom: "Bennani", prenom: "Imane", cin: "FG901233", email: "imane.bennani@gmail.com", telephone: "0666789056", ville: "Agadir", adresse: "17 Av. des FAR", dateNaissance: "1993-06-25", depuis: "2023-04-29" },
];

const SEED_CONTRATS = [
  { id: 1, numero: "WA-AUTO-2025-0148", clientId: 1, categorie: "voiture", marque: "Dacia", modele: "Logan", immatriculation: "45213-A-6", dateDebut: "2025-08-01", dateExpiration: "2026-08-01", primeAnnuelle: 3200, statut: "actif" },
  { id: 2, numero: "WA-AUTO-2025-0219", clientId: 2, categorie: "voiture", marque: "Renault", modele: "Clio", immatriculation: "78120-B-12", dateDebut: "2025-09-15", dateExpiration: "2026-08-10", primeAnnuelle: 4100, statut: "actif" },
  { id: 3, numero: "WA-AUTO-2024-0912", clientId: 3, categorie: "moto", marque: "Yamaha", modele: "NMAX 125", immatriculation: "11045-C-3", dateDebut: "2024-06-20", dateExpiration: "2025-06-20", primeAnnuelle: 1400, statut: "expire" },
  { id: 4, numero: "WA-AUTO-2026-0033", clientId: 4, categorie: "voiture", marque: "Peugeot", modele: "208", immatriculation: "90233-D-4", dateDebut: "2026-02-01", dateExpiration: "2027-02-01", primeAnnuelle: 5200, statut: "actif" },
  { id: 5, numero: "WA-AUTO-2025-0500", clientId: 5, categorie: "moto", marque: "Honda", modele: "PCX 150", immatriculation: "33781-E-1", dateDebut: "2025-07-30", dateExpiration: "2026-07-30", primeAnnuelle: 1750, statut: "actif" },
  { id: 6, numero: "WA-AUTO-2025-0611", clientId: 6, categorie: "voiture", marque: "Hyundai", modele: "Accent", immatriculation: "56090-F-10", dateDebut: "2025-05-12", dateExpiration: "2026-05-12", primeAnnuelle: 3800, statut: "actif" },
];

const SEED_SINISTRES = [
  { id: 1, numero: "SIN-2026-0071", contratId: 1, dateDeclaration: "2026-06-18", description: "Collision arrière au feu rouge, pare-chocs endommagé.", statut: "en_cours", montantIndemnisation: null },
  { id: 2, numero: "SIN-2026-0044", contratId: 4, dateDeclaration: "2026-04-02", description: "Bris de glace pare-brise suite à projection de gravier.", statut: "valide", montantIndemnisation: 2200 },
  { id: 3, numero: "SIN-2026-0088", contratId: 5, dateDeclaration: "2026-07-10", description: "Chute de la moto sur chaussée mouillée, rétroviseur cassé.", statut: "declare", montantIndemnisation: null },
];

const SEED_PAIEMENTS = [
  { id: 1, numeroFacture: "FAC-2025-1101", contratId: 1, montant: 3200, datePaiement: "2025-08-01", statut: "paye", modePaiement: "carte", reference: "TPE-778120" },
  { id: 2, numeroFacture: "FAC-2025-1188", contratId: 2, montant: 4100, datePaiement: "2025-09-15", statut: "paye", modePaiement: "cheque", reference: "CHQ-0045123" },
  { id: 3, numeroFacture: "FAC-2026-0102", contratId: 4, montant: 5200, datePaiement: "2026-02-01", statut: "paye", modePaiement: "especes", reference: "" },
  { id: 4, numeroFacture: "FAC-2026-0210", contratId: 6, montant: 3800, datePaiement: "2026-06-01", statut: "en_retard", modePaiement: "cheque", reference: "CHQ-0051980" },
  { id: 5, numeroFacture: "FAC-2025-0990", contratId: 5, montant: 1750, datePaiement: "2025-07-30", statut: "paye", modePaiement: "carte", reference: "TPE-660901" },
];

const SEED_USERS = [
  { id: 1, matricule: "AD-2015-001", nom: "Alaoui", prenom: "Rachid", email: "admin@wafa.ma", role: "admin", actif: true, agence: "Casablanca — Maârif" },
  { id: 2, matricule: "AG-2019-014", nom: "Fassi", prenom: "Leila", email: "employe@wafa.ma", role: "employe", actif: true, agence: "Rabat — Agdal" },
  { id: 3, matricule: "AG-2021-039", nom: "Berrada", prenom: "Omar", email: "o.berrada@wafa.ma", role: "employe", actif: false, agence: "Marrakech — Guéliz" },
];

const SEED_NOTIFS = [
  { id: 1, type: "expiration_contrat", titre: "Contrat proche de l'expiration", message: "Le contrat WA-AUTO-2025-0148 (Y. El Amrani) expire dans 8 jours.", lu: false },
  { id: 2, type: "nouveau_sinistre", titre: "Nouveau sinistre déclaré", message: "Sinistre SIN-2026-0088 déclaré sur le contrat WA-AUTO-2025-0500.", lu: false },
  { id: 3, type: "paiement_retard", titre: "Paiement en retard", message: "La facture FAC-2026-0210 (I. Bennani) est en retard de 53 jours.", lu: false },
  { id: 4, type: "contrat_expire", titre: "Contrat expiré", message: "Le contrat WA-AUTO-2024-0912 (K. Ouazzani) est expiré depuis le 20 juin 2025.", lu: true },
];

const REVENUS_MENSUELS = [
  { mois: "Août", montant: 22400 }, { mois: "Sep", montant: 31200 },
  { mois: "Oct", montant: 18700 }, { mois: "Nov", montant: 26500 },
  { mois: "Déc", montant: 29800 }, { mois: "Jan", montant: 34100 },
  { mois: "Fév", montant: 41200 }, { mois: "Mar", montant: 28900 },
  { mois: "Avr", montant: 37600 }, { mois: "Mai", montant: 33200 },
  { mois: "Juin", montant: 45800 }, { mois: "Juil", montant: 39400 },
];

const NOUVEAUX_CLIENTS = [
  { mois: "Fév", n: 4 }, { mois: "Mar", n: 6 }, { mois: "Avr", n: 3 },
  { mois: "Mai", n: 7 }, { mois: "Juin", n: 9 }, { mois: "Juil", n: 5 },
];

// ---- Métadonnées d'état ------------------------------------------------
const STATUT_CONTRAT = {
  actif: { label: "Actif", bg: "#E7F5EC", fg: "#1B7A43", dot: "#1B9E52" },
  expire: { label: "Expiré", bg: "#FBEAEA", fg: "#B23B3B", dot: "#D64545" },
  suspendu: { label: "Suspendu", bg: "#FEF4E2", fg: "#9A6A12", dot: "#E0A526" },
  resilie: { label: "Résilié", bg: "#EEE9F2", fg: "#6B4E86", dot: "#8B6BA8" },
};
const STATUT_SINISTRE = {
  declare: { label: "Déclaré", bg: "#EAF1FB", fg: "#2C5AA0", dot: "#3B76D1" },
  en_cours: { label: "En cours", bg: "#FEF4E2", fg: "#9A6A12", dot: "#E0A526" },
  valide: { label: "Validé", bg: "#E7F5EC", fg: "#1B7A43", dot: "#1B9E52" },
  cloture: { label: "Clôturé", bg: "#ECEEF1", fg: "#4B5563", dot: "#6B7280" },
  refuse: { label: "Refusé", bg: "#FBEAEA", fg: "#B23B3B", dot: "#D64545" },
};
const STATUT_PAIEMENT = {
  paye: { label: "Payé", bg: "#E7F5EC", fg: "#1B7A43" },
  en_retard: { label: "En retard", bg: "#FBEAEA", fg: "#B23B3B" },
  partiel: { label: "Partiel", bg: "#FEF4E2", fg: "#9A6A12" },
};
const MODE_PAIEMENT = {
  especes: { label: "Espèces", icon: Wallet, ref: false, refLabel: "" },
  carte: { label: "Carte bancaire (TPE)", icon: CreditCard, ref: true, refLabel: "N° de transaction TPE" },
  cheque: { label: "Chèque", icon: FileText, ref: true, refLabel: "N° de chèque" },
};

// ---- Petits composants -------------------------------------------------
function Badge({ meta }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: meta.bg, color: meta.fg }}>
      {meta.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />}
      {meta.label}
    </span>
  );
}

// Reproduction du monogramme Wafa Assurance : carré doré, chevron vert,
// coin vert en triangle et losange bleu nuit.
function LogoMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 12px rgba(242,176,30,.30))" }} aria-label="Wafa Assurance">
      <defs><clipPath id="wafaClip"><rect width="48" height="48" rx="12" /></clipPath></defs>
      <g clipPath="url(#wafaClip)">
        <rect width="48" height="48" fill={GOLD} />
        <path d="M0 0H23L0 23Z" fill={GREEN} />
        <path d="M8 18L24 40L40 18H31.5L24 29L16.5 18Z" fill={GREEN} />
        <rect x="19" y="4" width="10" height="10" rx="2.2" transform="rotate(45 24 9)" fill={NAVY} />
      </g>
    </svg>
  );
}

function Logo({ light = false, compact = false, size = 38 }) {
  const fg = light ? "#fff" : NAVY;
  const tag = light ? GOLD : GOLD_DARK;
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {!compact && (
        <div className="leading-tight">
          <div className="font-extrabold tracking-tight" style={{ color: fg, fontFamily: "'Sora',sans-serif", fontSize: 16 }}>
            Wafa Assurance
          </div>
          <div className="font-bold" style={{ color: tag, fontSize: 9.5, letterSpacing: "0.14em" }}>
            ASSURANCES AHL AL KHAIR
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, tint }) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>{value}</div>
          {sub && <div className="mt-1 text-xs font-medium text-slate-400">{sub}</div>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: tint + "1A" }}>
          <Icon size={20} color={tint} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      style={{ background: "rgba(11,33,56,.45)" }} onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4" style={{ borderColor: LINE }}>
          <h3 className="text-lg font-bold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}
const inputCls =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

function PrimaryBtn({ children, onClick, type = "button", full }) {
  return (
    <button type={type} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95 active:scale-[.99] ${full ? "w-full" : ""}`}
      style={{ background: NAVY }}>
      {children}
    </button>
  );
}
function GoldBtn({ children, onClick, full }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:brightness-95 active:scale-[.99] ${full ? "w-full" : ""}`}
      style={{ background: GOLD, color: NAVY }}>
      {children}
    </button>
  );
}
function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      style={{ borderColor: LINE }}>
      {children}
    </button>
  );
}

// ============================================================
//  ÉCRAN DE CONNEXION
// ============================================================
function Login({ onLogin, onBack }) {
  const roles = [
    { key: "admin", label: "Administrateur", icon: UserCog, desc: "Accès total & pilotage", demo: "admin@wafa.ma" },
    { key: "employe", label: "Employé", icon: Building2, desc: "Gestion opérationnelle", demo: "employe@wafa.ma" },
    { key: "client", label: "Client", icon: Users, desc: "Mon espace assuré", demo: "y.elamrani@gmail.com" },
  ];
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("admin@wafa.ma");
  const [pwd, setPwd] = useState("wafa2026");
  const [err, setErr] = useState("");

  const pickRole = (r) => { setRole(r.key); setEmail(r.demo); setErr(""); };
  const submit = () => {
    if (!email.trim() || pwd.length < 4) { setErr("Saisissez un email et un mot de passe (min. 4 caractères)."); return; }
    onLogin(role, email);
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2" style={{ background: PAPER }}>
      {/* Panneau marque */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-12"
        style={{ background: `radial-gradient(120% 120% at 0% 0%, ${NAVY_SOFT} 0%, ${NAVY} 55%, ${INK} 100%)` }}>
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full" style={{ background: GOLD, opacity: 0.14, filter: "blur(8px)" }} />
        <div className="absolute right-16 bottom-24 h-40 w-40 rounded-full" style={{ background: GOLD, opacity: 0.08 }} />
        <Logo light />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: "rgba(242,176,30,.16)", color: GOLD }}>
            <Car size={14} /> Assurance Automobile · Voitures & Motos
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white" style={{ fontFamily: "'Sora',sans-serif" }}>
            La gestion de vos contacts,<br />contrats et sinistres<br />
            <span style={{ color: GOLD }}>en un seul endroit.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
            Fini les fichiers Excel dispersés. Centralisez clients, polices auto,
            sinistres et paiements dans une plateforme sécurisée et suivie en temps réel.
          </p>
          <div className="mt-8 flex gap-8">
            {[["+1 200", "Contrats gérés"], ["24/7", "Accès sécurisé"], ["-70%", "Temps de saisie"]].map(([a, b]) => (
              <div key={b}>
                <div className="text-2xl font-extrabold" style={{ color: GOLD, fontFamily: "'Sora',sans-serif" }}>{a}</div>
                <div className="text-xs font-medium text-slate-400">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-slate-400">© 2026 Wafa Assurance — Ahl Al Khair · Espace de gestion</div>
      </div>

      {/* Formulaire */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="lg:hidden"><Logo /></div>
            {onBack && (
              <button onClick={onBack} className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800">
                <ChevronRight size={16} className="rotate-180" /> Retour à l'accueil
              </button>
            )}
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>Connexion à votre espace</h2>
          <p className="mt-1 text-sm text-slate-500">Choisissez votre profil pour continuer.</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {roles.map((r) => {
              const on = role === r.key;
              return (
                <button key={r.key} onClick={() => pickRole(r)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3.5 transition"
                  style={{ borderColor: on ? GOLD : LINE, background: on ? "#FFFBF0" : "#fff" }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: on ? GOLD : "#F1EEE6" }}>
                    <r.icon size={18} color={on ? NAVY : "#8A8272"} strokeWidth={2.2} />
                  </span>
                  <span className="text-xs font-bold" style={{ color: on ? NAVY : "#6B6659" }}>{r.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            {roles.find((r) => r.key === role).desc}
          </p>

          <div className="mt-6 space-y-4">
            <Field label="Adresse e-mail">
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={inputCls + " pl-10"} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.ma" />
              </div>
            </Field>
            <Field label="Mot de passe">
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className={inputCls + " pl-10"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" />
              </div>
            </Field>
            {err && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium"
                style={{ background: "#FBEAEA", color: "#B23B3B" }}>
                <AlertTriangle size={16} /> {err}
              </div>
            )}
            <GoldBtn full onClick={submit}>
              Se connecter <ArrowRight size={16} />
            </GoldBtn>
          </div>

          <div className="mt-5 rounded-xl border border-dashed px-4 py-3 text-xs text-slate-500" style={{ borderColor: LINE }}>
            <span className="font-bold text-slate-600">Démo :</span> l'e-mail est pré-rempli selon le profil.
            Mot de passe : <span className="font-mono font-semibold">wafa2026</span> (n'importe quel mot de passe ≥ 4 caractères fonctionne).
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  APPLICATION PRINCIPALE
// ============================================================
export default function WafaAssurance() {
  const [session, setSession] = useState(null); // {role, email}
  const [screen, setScreen] = useState("landing"); // landing | login (quand déconnecté)
  const [view, setView] = useState("dashboard");
  const [sidebar, setSidebar] = useState(false);
  const [toast, setToast] = useState(null);

  // Données (état en mémoire)
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [contrats, setContrats] = useState(SEED_CONTRATS);
  const [sinistres, setSinistres] = useState(SEED_SINISTRES);
  const [paiements, setPaiements] = useState(SEED_PAIEMENTS);
  const [users, setUsers] = useState(SEED_USERS);
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const [loaded, setLoaded] = useState(false); // données chargées depuis l'API

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const clientById = (id) => clients.find((c) => c.id === id);
  const contratById = (id) => contrats.find((c) => c.id === id);

  // Le client connecté = client #1 (démo)
  const currentClient = session?.role === "client" ? clients[0] : null;

  // 1) Chargement initial depuis l'API (repli sur les données de démo si l'API est absente)
  useEffect(() => {
    api.getState().then((data) => {
      if (data) {
        setClients(data.clients ?? SEED_CLIENTS);
        setContrats(data.contrats ?? SEED_CONTRATS);
        setSinistres(data.sinistres ?? SEED_SINISTRES);
        setPaiements(data.paiements ?? SEED_PAIEMENTS);
        setUsers(data.users ?? SEED_USERS);
        setNotifs(data.notifs ?? SEED_NOTIFS);
      }
    }).finally(() => setLoaded(true));
  }, []);

  // 2) Sauvegarde automatique (débouncée) dans la base dès qu'une donnée change
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      api.saveState({ clients, contrats, sinistres, paiements, users, notifs });
    }, 600);
    return () => clearTimeout(t);
  }, [loaded, clients, contrats, sinistres, paiements, users, notifs]);

  const login = (role, email) => { api.login(email, "demo").catch(() => {}); setSession({ role, email }); setView("dashboard"); };
  const logout = () => { setSession(null); setView("dashboard"); setScreen("landing"); };

  if (!session) {
    return screen === "landing"
      ? <Landing onEnter={() => setScreen("login")} />
      : <Login onLogin={login} onBack={() => setScreen("landing")} />;
  }

  const role = session.role;
  const isAdmin = role === "admin";
  const isStaff = role === "admin" || role === "employe";

  // Menu selon le rôle
  const staffMenu = [
    { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { key: "clients", label: "Clients", icon: Users },
    { key: "contrats", label: "Contrats", icon: FileText },
    { key: "sinistres", label: "Sinistres", icon: ShieldAlert },
    { key: "paiements", label: "Paiements", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];
  if (isAdmin) staffMenu.push({ key: "utilisateurs", label: "Utilisateurs", icon: UserCog });

  const clientMenu = [
    { key: "dashboard", label: "Accueil", icon: LayoutDashboard },
    { key: "mes-contrats", label: "Mes contrats", icon: FileText },
    { key: "mes-sinistres", label: "Mes sinistres", icon: ShieldAlert },
    { key: "mes-paiements", label: "Mes paiements", icon: CreditCard },
    { key: "mon-profil", label: "Mon profil", icon: UserCog },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];
  const menu = isStaff ? staffMenu : clientMenu;
  const unread = notifs.filter((n) => !n.lu).length;

  const goto = (k) => { setView(k); setSidebar(false); };

  const roleLabel = { admin: "Administrateur", employe: "Employé", client: "Client" }[role];
  const userName = isStaff
    ? (users.find((u) => u.email === session.email) || users[0])
    : currentClient;

  return (
    <div className="min-h-screen" style={{ background: PAPER, fontFamily: "'Manrope',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar{width:10px;height:10px}
        ::-webkit-scrollbar-thumb{background:#D9D3C6;border-radius:8px}
      `}</style>

      {/* Overlay mobile */}
      {sidebar && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebar(false)} />}

      {/* ---- SIDEBAR ---- */}
      <aside className={`fixed z-40 flex h-screen w-64 flex-col transition-transform lg:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: NAVY }}>
        <div className="flex items-center justify-between px-5 py-5">
          <Logo light />
          <button className="lg:hidden text-slate-300" onClick={() => setSidebar(false)}><X size={20} /></button>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {menu.map((m) => {
            const on = view === m.key || (m.key === "notifications" && view === "notifications");
            return (
              <button key={m.key} onClick={() => goto(m.key)}
                className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition"
                style={{ background: on ? "rgba(242,176,30,.14)" : "transparent", color: on ? GOLD : "#AEB9C7" }}>
                <m.icon size={18} strokeWidth={2.1} />
                <span className="flex-1 text-left">{m.label}</span>
                {m.key === "notifications" && unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white" style={{ background: "#D64545" }}>{unread}</span>
                )}
                {on && <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />}
              </button>
            );
          })}
        </nav>
        <div className="border-t p-3" style={{ borderColor: "rgba(255,255,255,.08)" }}>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,.04)" }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ background: GOLD, color: NAVY }}>
              {(userName?.prenom?.[0] || "U") + (userName?.nom?.[0] || "")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-white">{userName?.prenom} {userName?.nom}</div>
              <div className="text-[11px] font-medium" style={{ color: GOLD }}>
                {roleLabel}{(isStaff ? userName?.matricule : userName?.reference) ? ` · ${isStaff ? userName.matricule : userName.reference}` : ""}
              </div>
            </div>
            <button onClick={logout} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" title="Se déconnecter">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ---- CONTENU ---- */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white/85 px-4 py-3 backdrop-blur sm:px-6" style={{ borderColor: LINE }}>
          <button className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100" onClick={() => setSidebar(true)}><Menu size={20} /></button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold sm:text-xl" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>
              {menu.find((m) => m.key === view)?.label || "Espace"}
            </h1>
          </div>
          <button onClick={() => goto("notifications")} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
            <Bell size={19} />
            {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: "#D64545" }} />}
          </button>
          <div className="hidden items-center gap-2.5 rounded-xl border px-3 py-1.5 sm:flex" style={{ borderColor: LINE }}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: NAVY }}>
              {(userName?.prenom?.[0] || "U") + (userName?.nom?.[0] || "")}
            </div>
            <span className="text-sm font-semibold text-slate-700">{userName?.prenom}</span>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {/* ROUTES */}
          {view === "dashboard" && (isStaff
            ? <StaffDashboard clients={clients} contrats={contrats} sinistres={sinistres} paiements={paiements} goto={goto} />
            : <ClientDashboard client={currentClient} contrats={contrats.filter(c => c.clientId === currentClient.id)} sinistres={sinistres} goto={goto} />
          )}

          {view === "clients" && isStaff &&
            <ClientsPage clients={clients} contrats={contrats} sinistres={sinistres} paiements={paiements} setClients={setClients} isAdmin={isAdmin} notify={notify} />}

          {view === "contrats" && isStaff &&
            <ContratsPage contrats={contrats} setContrats={setContrats} clients={clients} clientById={clientById} isAdmin={isAdmin} notify={notify} />}

          {view === "sinistres" && isStaff &&
            <SinistresPage sinistres={sinistres} setSinistres={setSinistres} contrats={contrats} clientById={clientById} contratById={contratById} notify={notify} />}

          {view === "paiements" && isStaff &&
            <PaiementsPage paiements={paiements} setPaiements={setPaiements} contrats={contrats} clientById={clientById} contratById={contratById} notify={notify} />}

          {view === "utilisateurs" && isAdmin &&
            <UsersPage users={users} setUsers={setUsers} notify={notify} />}

          {view === "notifications" &&
            <NotificationsPage notifs={notifs} setNotifs={setNotifs} />}

          {/* Espace client */}
          {view === "mes-contrats" && role === "client" &&
            <MesContrats contrats={contrats.filter(c => c.clientId === currentClient.id)} />}
          {view === "mes-sinistres" && role === "client" &&
            <MesSinistres client={currentClient} contrats={contrats} sinistres={sinistres} setSinistres={setSinistres} setNotifs={setNotifs} notify={notify} />}
          {view === "mes-paiements" && role === "client" &&
            <MesPaiements client={currentClient} contrats={contrats.filter(c => c.clientId === currentClient.id)} paiements={paiements} />}
          {view === "mon-profil" && role === "client" &&
            <MonProfil client={currentClient} contrats={contrats.filter(c => c.clientId === currentClient.id)} sinistres={sinistres} paiements={paiements} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl"
          style={{ background: NAVY }}>
          <CheckCircle2 size={17} color={GOLD} /> {toast}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  TABLEAU DE BORD — STAFF
// ============================================================
function StaffDashboard({ clients, contrats, sinistres, paiements, goto }) {
  const actifs = contrats.filter((c) => c.statut === "actif").length;
  const expires = contrats.filter((c) => c.statut === "expire").length;
  const sinistresOuverts = sinistres.filter((s) => s.statut !== "cloture" && s.statut !== "refuse").length;
  const revenusMois = paiements.filter((p) => p.statut === "paye" && new Date(p.datePaiement) >= new Date("2026-07-01")).reduce((a, p) => a + p.montant, 0);

  const parCategorie = [
    { name: "Voitures", value: contrats.filter((c) => c.categorie === "voiture").length, color: NAVY },
    { name: "Motos", value: contrats.filter((c) => c.categorie === "moto").length, color: GOLD },
  ];
  const etatSinistres = Object.keys(STATUT_SINISTRE).map((k) => ({
    name: STATUT_SINISTRE[k].label, value: sinistres.filter((s) => s.statut === k).length, color: STATUT_SINISTRE[k].dot,
  })).filter((x) => x.value > 0);

  const expirantBientot = contrats.filter((c) => {
    const d = daysBetween(today, c.dateExpiration); return d >= 0 && d <= 30;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Clients" value={clients.length} sub="portefeuille total" tint={NAVY} />
        <StatCard icon={FileCheck} label="Contrats actifs" value={actifs} sub={`${expires} expiré(s)`} tint="#1B9E52" />
        <StatCard icon={ShieldAlert} label="Sinistres ouverts" value={sinistresOuverts} sub="en traitement" tint="#E0A526" />
        <StatCard icon={Wallet} label="Revenus du mois" value={fmtMAD(revenusMois)} sub="primes encaissées" tint={GOLD_DARK} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 lg:col-span-2" style={{ borderColor: LINE }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>Évolution des revenus (12 mois)</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp size={14} /> +18% vs. an dernier</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={REVENUS_MENSUELS} margin={{ left: -18, right: 6, top: 4 }}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEADD" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#94918A" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94918A" }} axisLine={false} tickLine={false} tickFormatter={(v) => v / 1000 + "k"} />
              <Tooltip formatter={(v) => fmtMAD(v)} contentStyle={{ borderRadius: 12, border: "1px solid " + LINE, fontSize: 13 }} />
              <Area type="monotone" dataKey="montant" stroke={GOLD_DARK} strokeWidth={2.5} fill="url(#gold)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <h3 className="mb-2 font-bold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>Contrats par catégorie</h3>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={parCategorie} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={3}>
                {parCategorie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid " + LINE, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {parCategorie.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />{e.name}
                </span>
                <span className="font-bold" style={{ color: INK }}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <h3 className="mb-3 font-bold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>État des sinistres</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={etatSinistres} dataKey="value" outerRadius={72}>
                {etatSinistres.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid " + LINE, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {etatSinistres.map((e) => (
              <span key={e.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />{e.name} · {e.value}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <h3 className="mb-3 font-bold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>Nouveaux clients</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={NOUVEAUX_CLIENTS} margin={{ left: -22, right: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEADD" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#94918A" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94918A" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#F5F2EB" }} contentStyle={{ borderRadius: 12, border: "1px solid " + LINE, fontSize: 13 }} />
              <Bar dataKey="n" fill={NAVY} radius={[6, 6, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>Échéances proches</h3>
            <button onClick={() => goto("contrats")} className="text-xs font-bold" style={{ color: GOLD_DARK }}>Tout voir</button>
          </div>
          {expirantBientot.length === 0
            ? <p className="text-sm text-slate-400">Aucun contrat n'expire dans les 30 jours.</p>
            : <div className="space-y-2.5">
              {expirantBientot.map((c) => {
                const d = daysBetween(today, c.dateExpiration);
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: LINE }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#FEF4E2" }}>
                      <Clock size={16} color="#9A6A12" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold" style={{ color: INK }}>{c.numero}</div>
                      <div className="text-xs text-slate-500">{c.marque} {c.modele}</div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#9A6A12" }}>J-{d}</span>
                  </div>
                );
              })}
            </div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  PAGE CLIENTS
// ============================================================
function ClientsPage({ clients, contrats, sinistres, paiements, setClients, isAdmin, notify }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const empty = { nom: "", prenom: "", cin: "", email: "", telephone: "", ville: "", adresse: "" };
  const [form, setForm] = useState(empty);

  const filtered = clients.filter((c) =>
    `${c.reference} ${c.nom} ${c.prenom} ${c.email} ${c.telephone} ${c.ville}`.toLowerCase().includes(q.toLowerCase())
  );
  const contratsOf = (id) => contrats.filter((c) => c.clientId === id);

  const save = () => {
    if (!form.nom || !form.prenom || !form.email || !form.telephone) { notify("Nom, prénom, e-mail et téléphone sont obligatoires."); return; }
    const ref = `CLI-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setClients((cs) => [...cs, { ...form, id: Math.max(0, ...cs.map((c) => c.id)) + 1, reference: ref, depuis: "2026-07-24" }]);
    setOpen(false); setForm(empty);
    notify(`Client créé — référence ${ref}.`);
  };
  const remove = (c) => {
    if (contratsOf(c.id).some((x) => x.statut === "actif")) { notify("Impossible : ce client a des contrats actifs."); return; }
    setClients((cs) => cs.filter((x) => x.id !== c.id)); setDetail(null);
    notify("Client supprimé.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={inputCls + " pl-10"} placeholder="Rechercher un client…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <GoldBtn onClick={() => setOpen(true)}><Plus size={16} /> Nouveau client</GoldBtn>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <div className="hidden grid-cols-12 gap-3 border-b px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 sm:grid" style={{ borderColor: LINE }}>
          <div className="col-span-4">Client</div><div className="col-span-3">Contact</div>
          <div className="col-span-2">Ville</div><div className="col-span-2">Contrats</div><div className="col-span-1 text-right">Action</div>
        </div>
        {filtered.map((c) => (
          <div key={c.id} className="grid grid-cols-1 gap-2 border-b px-5 py-3.5 sm:grid-cols-12 sm:items-center sm:gap-3" style={{ borderColor: LINE }}>
            <div className="col-span-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: NAVY }}>
                {c.prenom[0]}{c.nom[0]}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: INK }}>{c.prenom} {c.nom}</div>
                <div className="font-mono text-xs font-semibold" style={{ color: GOLD_DARK }}>{c.reference}</div>
              </div>
            </div>
            <div className="col-span-3 text-sm text-slate-600">
              <div className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" />{c.email}</div>
              <div className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" />{c.telephone}</div>
            </div>
            <div className="col-span-2 text-sm text-slate-600">{c.ville}</div>
            <div className="col-span-2"><span className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: "#F1EEE6", color: NAVY }}>{contratsOf(c.id).length} contrat(s)</span></div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => setDetail(c)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Voir la fiche"><Eye size={16} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">Aucun client ne correspond à votre recherche.</div>}
      </div>

      {/* Modal création */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau client" wide>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom *"><input className={inputCls} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></Field>
          <Field label="Prénom *"><input className={inputCls} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></Field>
          <Field label="CIN"><input className={inputCls} value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} placeholder="AB123456" /></Field>
          <Field label="Téléphone *"><input className={inputCls} value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="06XXXXXXXX" /></Field>
          <Field label="E-mail *" full><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@exemple.ma" /></Field>
          <Field label="Ville"><input className={inputCls} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} /></Field>
          <Field label="Adresse"><input className={inputCls} value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <GhostBtn onClick={() => setOpen(false)}>Annuler</GhostBtn>
          <PrimaryBtn onClick={save}><Check size={16} /> Enregistrer</PrimaryBtn>
        </div>
      </Modal>

      {/* Profil client */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Profil client" wide>
        {detail && (
          <ClientProfileBody
            client={detail}
            contrats={contratsOf(detail.id)}
            sinistres={sinistres}
            paiements={paiements}
            isAdmin={isAdmin}
            onRemove={() => remove(detail)}
          />
        )}
      </Modal>
    </div>
  );
}

// ---- Corps du profil client (réutilisé côté staff) --------------------
function ClientProfileBody({ client, contrats, sinistres, paiements, isAdmin, onRemove }) {
  const [tab, setTab] = useState("contrats");
  const contratIds = contrats.map((c) => c.id);
  const sins = sinistres.filter((s) => contratIds.includes(s.contratId));
  const pays = paiements.filter((p) => contratIds.includes(p.contratId));
  const primesAn = contrats.filter((c) => c.statut === "actif").reduce((a, c) => a + c.primeAnnuelle, 0);
  const age = client.dateNaissance ? Math.floor(daysBetween(client.dateNaissance, today) / 365) : null;

  const tabs = [
    ["contrats", `Contrats (${contrats.length})`],
    ["sinistres", `Sinistres (${sins.length})`],
    ["paiements", `Paiements (${pays.length})`],
  ];

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center"
        style={{ background: `linear-gradient(120deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold" style={{ background: GOLD, color: NAVY }}>
          {client.prenom[0]}{client.nom[0]}
        </div>
        <div className="flex-1">
          <div className="text-xl font-extrabold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>{client.prenom} {client.nom}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md px-2 py-0.5 font-mono font-bold" style={{ background: "rgba(242,176,30,.18)", color: GOLD }}>{client.reference}</span>
            <span className="text-slate-300">CIN {client.cin}</span>
            {age && <span className="text-slate-300">· {age} ans</span>}
            {client.depuis && <span className="text-slate-300">· client depuis {new Date(client.depuis).getFullYear()}</span>}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [FileCheck, "Contrats actifs", contrats.filter((c) => c.statut === "actif").length, "#1B9E52"],
          [ShieldAlert, "Sinistres", sins.length, "#E0A526"],
          [Wallet, "Primes / an", fmtMAD(primesAn), GOLD_DARK],
          [CreditCard, "Paiements", pays.length, NAVY],
        ].map(([Ic, l, v, tint]) => (
          <div key={l} className="rounded-xl border p-3" style={{ borderColor: LINE }}>
            <Ic size={16} color={tint} />
            <div className="mt-1.5 text-lg font-extrabold" style={{ color: INK }}>{v}</div>
            <div className="text-xs text-slate-400">{l}</div>
          </div>
        ))}
      </div>

      {/* Coordonnées */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[[Mail, "E-mail", client.email], [Phone, "Téléphone", client.telephone], [MapPin, "Ville", client.ville], [Building2, "Adresse", client.adresse || "—"]].map(([Ic, l, v]) => (
          <div key={l} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: LINE }}>
            <Ic size={16} className="text-slate-400" />
            <div><div className="text-xs font-semibold text-slate-400">{l}</div><div className="text-sm font-medium text-slate-700">{v}</div></div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="flex-1 rounded-lg px-3 py-2 text-xs font-bold transition"
            style={{ background: tab === k ? "#fff" : "transparent", color: tab === k ? NAVY : "#7A7364", boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {tab === "contrats" && (contrats.length ? contrats.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: LINE }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: c.categorie === "moto" ? "#FFF6E0" : "#EAF1FB" }}>
              {c.categorie === "moto" ? <Bike size={16} color={GOLD_DARK} /> : <Car size={16} color={NAVY} />}
            </span>
            <div className="flex-1"><div className="text-sm font-bold" style={{ color: INK }}>{c.numero}</div><div className="text-xs text-slate-500">{c.marque} {c.modele} · {c.immatriculation}</div></div>
            <span className="text-sm font-bold" style={{ color: GOLD_DARK }}>{fmtMAD(c.primeAnnuelle)}</span>
            <Badge meta={STATUT_CONTRAT[c.statut]} />
          </div>
        )) : <p className="py-4 text-center text-sm text-slate-400">Aucun contrat.</p>)}

        {tab === "sinistres" && (sins.length ? sins.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: LINE }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#FBEAEA" }}><ShieldAlert size={16} color="#B23B3B" /></span>
            <div className="flex-1"><div className="text-sm font-bold" style={{ color: INK }}>{s.numero}</div><div className="line-clamp-1 text-xs text-slate-500">{s.description}</div></div>
            <Badge meta={STATUT_SINISTRE[s.statut]} />
          </div>
        )) : <p className="py-4 text-center text-sm text-slate-400">Aucun sinistre.</p>)}

        {tab === "paiements" && (pays.length ? pays.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: LINE }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#F1EEE6" }}><CreditCard size={16} color={NAVY} /></span>
            <div className="flex-1"><div className="font-mono text-sm font-bold" style={{ color: INK }}>{p.numeroFacture}</div><div className="text-xs text-slate-500">{fmtDate(p.datePaiement)}</div></div>
            <span className="text-sm font-bold" style={{ color: GOLD_DARK }}>{fmtMAD(p.montant)}</span>
            <Badge meta={STATUT_PAIEMENT[p.statut]} />
          </div>
        )) : <p className="py-4 text-center text-sm text-slate-400">Aucun paiement.</p>)}
      </div>

      {isAdmin && (
        <div className="mt-5 flex justify-end">
          <button onClick={onRemove} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "#F0C9C9", color: "#B23B3B" }}>
            <Trash2 size={15} /> Supprimer le client
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  PAGE CONTRATS
// ============================================================
function ContratsPage({ contrats, setContrats, clients, clientById, isAdmin, notify }) {
  const [fCat, setFCat] = useState("tous");
  const [fStatut, setFStatut] = useState("tous");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const blank = { clientId: "", categorie: "voiture", marque: "", modele: "", immatriculation: "", dateDebut: "", dateExpiration: "", primeAnnuelle: "" };
  const [form, setForm] = useState(blank);

  const filtered = contrats.filter((c) => {
    const cl = clientById(c.clientId);
    const okCat = fCat === "tous" || c.categorie === fCat;
    const okStat = fStatut === "tous" || c.statut === fStatut;
    const okQ = `${c.numero} ${c.marque} ${c.modele} ${c.immatriculation} ${cl?.nom} ${cl?.prenom}`.toLowerCase().includes(q.toLowerCase());
    return okCat && okStat && okQ;
  });

  const calcStatut = (deb, exp) => {
    if (!deb || !exp) return "actif";
    if (new Date(exp) < today) return "expire";
    return "actif";
  };
  const save = () => {
    if (!form.clientId || !form.marque || !form.dateDebut || !form.dateExpiration || !form.primeAnnuelle) { notify("Client, véhicule, dates et prime sont obligatoires."); return; }
    if (new Date(form.dateExpiration) <= new Date(form.dateDebut)) { notify("La date d'expiration doit être postérieure au début."); return; }
    const num = `WA-AUTO-${new Date(form.dateDebut).getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setContrats((cs) => [...cs, {
      ...form, id: Math.max(0, ...cs.map((c) => c.id)) + 1, numero: num,
      clientId: Number(form.clientId), primeAnnuelle: Number(form.primeAnnuelle),
      statut: calcStatut(form.dateDebut, form.dateExpiration),
    }]);
    setOpen(false); setForm(blank); notify("Contrat créé avec succès.");
  };
  const renew = (c) => {
    const newExp = new Date(c.dateExpiration); newExp.setFullYear(newExp.getFullYear() + 1);
    setContrats((cs) => cs.map((x) => x.id === c.id ? { ...x, dateDebut: c.dateExpiration, dateExpiration: newExp.toISOString().slice(0, 10), statut: "actif" } : x));
    setDetail(null); notify("Contrat renouvelé pour 12 mois.");
  };

  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick} className="rounded-lg px-3 py-1.5 text-xs font-bold transition"
      style={{ background: active ? NAVY : "#fff", color: active ? "#fff" : "#5B5647", border: `1px solid ${active ? NAVY : LINE}` }}>{children}</button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={fCat === "tous"} onClick={() => setFCat("tous")}>Tous</Chip>
          <Chip active={fCat === "voiture"} onClick={() => setFCat("voiture")}>🚗 Voitures</Chip>
          <Chip active={fCat === "moto"} onClick={() => setFCat("moto")}>🏍️ Motos</Chip>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          {["tous", "actif", "expire", "suspendu"].map((s) => (
            <Chip key={s} active={fStatut === s} onClick={() => setFStatut(s)}>{s === "tous" ? "Tous statuts" : STATUT_CONTRAT[s]?.label}</Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full lg:w-56">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={inputCls + " pl-10"} placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <GoldBtn onClick={() => setOpen(true)}><Plus size={16} /> Contrat</GoldBtn>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const cl = clientById(c.clientId);
          const d = daysBetween(today, c.dateExpiration);
          return (
            <div key={c.id} className="rounded-2xl border bg-white p-4 transition hover:shadow-md" style={{ borderColor: LINE }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: c.categorie === "moto" ? "#FFF6E0" : "#EAF1FB" }}>
                    {c.categorie === "moto" ? <Bike size={20} color={GOLD_DARK} /> : <Car size={20} color={NAVY} />}
                  </span>
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: INK }}>{c.marque} {c.modele}</div>
                    <div className="text-xs text-slate-400">{c.immatriculation}</div>
                  </div>
                </div>
                <Badge meta={STATUT_CONTRAT[c.statut]} />
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-mono font-semibold text-slate-500">{c.numero}</div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Assuré</span><span className="font-semibold text-slate-700">{cl?.prenom} {cl?.nom}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Échéance</span><span className="font-semibold text-slate-700">{fmtDate(c.dateExpiration)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Prime / an</span><span className="font-extrabold" style={{ color: GOLD_DARK }}>{fmtMAD(c.primeAnnuelle)}</span></div>
              </div>
              {c.statut === "actif" && d >= 0 && d <= 30 && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: "#FEF4E2", color: "#9A6A12" }}>
                  <Clock size={13} /> Expire dans {d} jour(s)
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => setDetail(c)} className="flex-1 rounded-lg border py-2 text-xs font-bold text-slate-600 hover:bg-slate-50" style={{ borderColor: LINE }}>Détails</button>
                {(c.statut === "expire" || (d >= 0 && d <= 30)) && (
                  <button onClick={() => renew(c)} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold" style={{ background: GOLD, color: NAVY }}><RefreshCw size={13} /> Renouveler</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="rounded-2xl border bg-white px-5 py-12 text-center text-sm text-slate-400" style={{ borderColor: LINE }}>Aucun contrat ne correspond aux filtres.</div>}

      {/* Modal création */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau contrat auto" wide>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client *" full>
            <select className={inputCls} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">— Sélectionner un client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom} ({c.ville})</option>)}
            </select>
          </Field>
          <Field label="Catégorie *" full>
            <div className="grid grid-cols-2 gap-3">
              {[["voiture", "Voiture", Car], ["moto", "Moto", Bike]].map(([v, l, Ic]) => (
                <button key={v} onClick={() => setForm({ ...form, categorie: v })}
                  className="flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition"
                  style={{ borderColor: form.categorie === v ? GOLD : LINE, background: form.categorie === v ? "#FFFBF0" : "#fff", color: NAVY }}>
                  <Ic size={18} /> {l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Marque *"><input className={inputCls} value={form.marque} onChange={(e) => setForm({ ...form, marque: e.target.value })} placeholder="Dacia, Yamaha…" /></Field>
          <Field label="Modèle"><input className={inputCls} value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })} placeholder="Logan, NMAX…" /></Field>
          <Field label="Immatriculation" full><input className={inputCls} value={form.immatriculation} onChange={(e) => setForm({ ...form, immatriculation: e.target.value })} placeholder="12345-A-6" /></Field>
          <Field label="Date de début *"><input type="date" className={inputCls} value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} /></Field>
          <Field label="Date d'expiration *"><input type="date" className={inputCls} value={form.dateExpiration} onChange={(e) => setForm({ ...form, dateExpiration: e.target.value })} /></Field>
          <Field label="Prime annuelle (DH) *" full><input type="number" className={inputCls} value={form.primeAnnuelle} onChange={(e) => setForm({ ...form, primeAnnuelle: e.target.value })} placeholder="3200" /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <GhostBtn onClick={() => setOpen(false)}>Annuler</GhostBtn>
          <PrimaryBtn onClick={save}><Check size={16} /> Créer le contrat</PrimaryBtn>
        </div>
      </Modal>

      {/* Détail contrat */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Détail du contrat">
        {detail && (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: detail.categorie === "moto" ? "#FFF6E0" : "#EAF1FB" }}>
                  {detail.categorie === "moto" ? <Bike size={22} color={GOLD_DARK} /> : <Car size={22} color={NAVY} />}
                </span>
                <div>
                  <div className="text-lg font-extrabold" style={{ color: INK, fontFamily: "'Sora',sans-serif" }}>{detail.marque} {detail.modele}</div>
                  <div className="text-sm text-slate-500">{detail.immatriculation}</div>
                </div>
              </div>
              <Badge meta={STATUT_CONTRAT[detail.statut]} />
            </div>
            <div className="mt-4 space-y-2">
              {[["N° de contrat", detail.numero], ["Assuré", `${clientById(detail.clientId)?.prenom} ${clientById(detail.clientId)?.nom}`],
              ["Catégorie", detail.categorie === "moto" ? "Moto" : "Voiture"], ["Début", fmtDate(detail.dateDebut)],
              ["Expiration", fmtDate(detail.dateExpiration)], ["Prime annuelle", fmtMAD(detail.primeAnnuelle)]].map(([l, v]) => (
                <div key={l} className="flex justify-between border-b py-2 text-sm" style={{ borderColor: LINE }}>
                  <span className="text-slate-400">{l}</span><span className="font-bold text-slate-700">{v}</span>
                </div>
              ))}
            </div>
            {(detail.statut === "expire" || (daysBetween(today, detail.dateExpiration) <= 30)) && (
              <div className="mt-4"><GoldBtn full onClick={() => renew(detail)}><RefreshCw size={16} /> Renouveler ce contrat</GoldBtn></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================================
//  PAGE SINISTRES
// ============================================================
function SinistresPage({ sinistres, setSinistres, contrats, clientById, contratById, notify }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [f, setF] = useState("tous");
  const blank = { contratId: "", dateDeclaration: "2026-07-24", description: "" };
  const [form, setForm] = useState(blank);

  const list = sinistres.filter((s) => f === "tous" || s.statut === f);
  const infos = (s) => { const ct = contratById(s.contratId); const cl = ct ? clientById(ct.clientId) : null; return { ct, cl }; };

  const declare = () => {
    if (!form.contratId || form.description.length < 20) { notify("Contrat requis et description ≥ 20 caractères."); return; }
    const num = `SIN-2026-${String(Math.floor(Math.random() * 9000) + 100)}`;
    setSinistres((s) => [{ id: Math.max(0, ...s.map((x) => x.id)) + 1, numero: num, contratId: Number(form.contratId), dateDeclaration: form.dateDeclaration, description: form.description, statut: "declare", montantIndemnisation: null }, ...s]);
    setOpen(false); setForm(blank); notify("Sinistre déclaré. Notification envoyée aux agents.");
  };
  const setStatut = (s, statut, montant) => {
    setSinistres((arr) => arr.map((x) => x.id === s.id ? { ...x, statut, montantIndemnisation: montant ?? x.montantIndemnisation } : x));
    setDetail((d) => d ? { ...d, statut, montantIndemnisation: montant ?? d.montantIndemnisation } : d);
    notify("Statut du sinistre mis à jour.");
  };

  const actifsContrats = contrats.filter((c) => c.statut === "actif");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["tous", ...Object.keys(STATUT_SINISTRE)].map((k) => (
            <button key={k} onClick={() => setF(k)} className="rounded-lg px-3 py-1.5 text-xs font-bold transition"
              style={{ background: f === k ? NAVY : "#fff", color: f === k ? "#fff" : "#5B5647", border: `1px solid ${f === k ? NAVY : LINE}` }}>
              {k === "tous" ? "Tous" : STATUT_SINISTRE[k].label}
            </button>
          ))}
        </div>
        <GoldBtn onClick={() => setOpen(true)}><Plus size={16} /> Déclarer un sinistre</GoldBtn>
      </div>

      <div className="space-y-3">
        {list.map((s) => {
          const { ct, cl } = infos(s);
          return (
            <div key={s.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center" style={{ borderColor: LINE }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#FBEAEA" }}>
                <ShieldAlert size={20} color="#B23B3B" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold" style={{ color: INK }}>{s.numero}</span>
                  <Badge meta={STATUT_SINISTRE[s.statut]} />
                </div>
                <div className="text-xs text-slate-500">{ct?.numero} · {cl?.prenom} {cl?.nom} · déclaré le {fmtDate(s.dateDeclaration)}</div>
                <p className="mt-1 line-clamp-1 text-sm text-slate-600">{s.description}</p>
              </div>
              {s.montantIndemnisation && <div className="text-right"><div className="text-xs text-slate-400">Indemnisation</div><div className="font-extrabold" style={{ color: "#1B7A43" }}>{fmtMAD(s.montantIndemnisation)}</div></div>}
              <button onClick={() => setDetail(s)} className="rounded-lg border px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50" style={{ borderColor: LINE }}>Traiter</button>
            </div>
          );
        })}
        {list.length === 0 && <div className="rounded-2xl border bg-white px-5 py-12 text-center text-sm text-slate-400" style={{ borderColor: LINE }}>Aucun sinistre pour ce filtre.</div>}
      </div>

      {/* Déclaration */}
      <Modal open={open} onClose={() => setOpen(false)} title="Déclarer un sinistre">
        <div className="space-y-4">
          <Field label="Contrat concerné (actif) *">
            <select className={inputCls} value={form.contratId} onChange={(e) => setForm({ ...form, contratId: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {actifsContrats.map((c) => { const cl = clientById(c.clientId); return <option key={c.id} value={c.id}>{c.numero} · {cl?.prenom} {cl?.nom} · {c.marque} {c.modele}</option>; })}
            </select>
          </Field>
          <Field label="Date de déclaration *"><input type="date" className={inputCls} value={form.dateDeclaration} onChange={(e) => setForm({ ...form, dateDeclaration: e.target.value })} /></Field>
          <Field label="Description (min. 20 caractères) *">
            <textarea rows={4} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez les circonstances du sinistre…" />
            <span className="mt-1 block text-right text-xs text-slate-400">{form.description.length}/20</span>
          </Field>
          <div className="rounded-xl border border-dashed px-4 py-4 text-center text-xs text-slate-400" style={{ borderColor: LINE }}>
            📎 Documents justificatifs (PDF, JPG, PNG · max 5 Mo) — zone d'upload à connecter au backend
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <GhostBtn onClick={() => setOpen(false)}>Annuler</GhostBtn>
          <PrimaryBtn onClick={declare}><Check size={16} /> Déclarer</PrimaryBtn>
        </div>
      </Modal>

      {/* Traitement */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Sinistre ${detail?.numero || ""}`}>
        {detail && <SinistreTraitement s={detail} infos={infos} setStatut={setStatut} />}
      </Modal>
    </div>
  );
}

function SinistreTraitement({ s, infos, setStatut }) {
  const { ct, cl } = infos(s);
  const [montant, setMontant] = useState(s.montantIndemnisation || "");
  const flow = { declare: ["en_cours"], en_cours: ["valide", "refuse"], valide: ["cloture"], refuse: [], cloture: [] };
  return (
    <div>
      <div className="flex items-center justify-between">
        <Badge meta={STATUT_SINISTRE[s.statut]} />
        <span className="text-xs text-slate-400">Déclaré le {fmtDate(s.dateDeclaration)}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between border-b py-2" style={{ borderColor: LINE }}><span className="text-slate-400">Contrat</span><span className="font-bold text-slate-700">{ct?.numero}</span></div>
        <div className="flex justify-between border-b py-2" style={{ borderColor: LINE }}><span className="text-slate-400">Assuré</span><span className="font-bold text-slate-700">{cl?.prenom} {cl?.nom}</span></div>
        <div className="flex justify-between border-b py-2" style={{ borderColor: LINE }}><span className="text-slate-400">Véhicule</span><span className="font-bold text-slate-700">{ct?.marque} {ct?.modele}</span></div>
      </div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{s.description}</div>

      {(s.statut === "en_cours" || s.statut === "valide") && (
        <Field label="Montant d'indemnisation (DH)">
          <input type="number" className={inputCls} value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0" />
        </Field>
      )}

      <div className="mt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Faire évoluer le dossier</div>
        <div className="flex flex-wrap gap-2">
          {flow[s.statut].length === 0 && <span className="text-sm text-slate-400">Dossier finalisé — aucune action supplémentaire.</span>}
          {flow[s.statut].map((next) => (
            <button key={next} onClick={() => setStatut(s, next, next === "valide" ? Number(montant) || 0 : undefined)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
              style={{ background: next === "refuse" ? "#D64545" : next === "valide" ? "#1B9E52" : NAVY }}>
              {next === "valide" && <CheckCircle2 size={15} />}{next === "refuse" && <XCircle size={15} />}
              Passer à « {STATUT_SINISTRE[next].label} »
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  PAGE PAIEMENTS
// ============================================================
function PaiementsPage({ paiements, setPaiements, contrats, clientById, contratById, notify }) {
  const [open, setOpen] = useState(false);
  const [facture, setFacture] = useState(null);
  const [tab, setTab] = useState("tous");
  const blank = { contratId: "", montant: "", datePaiement: "2026-07-24", modePaiement: "especes", reference: "" };
  const [form, setForm] = useState(blank);

  const list = paiements.filter((p) => tab === "tous" ? true : tab === "impayes" ? p.statut === "en_retard" : true);
  const infos = (p) => { const ct = contratById(p.contratId); const cl = ct ? clientById(ct.clientId) : null; return { ct, cl }; };
  const totalEncaisse = paiements.filter((p) => p.statut === "paye").reduce((a, p) => a + p.montant, 0);
  const impayes = paiements.filter((p) => p.statut === "en_retard");

  const enregistrer = () => {
    if (!form.contratId || !form.montant) { notify("Contrat et montant obligatoires."); return; }
    if (MODE_PAIEMENT[form.modePaiement].ref && !form.reference.trim()) { notify(`${MODE_PAIEMENT[form.modePaiement].refLabel} obligatoire.`); return; }
    const num = `FAC-2026-${String(Math.floor(Math.random() * 9000) + 100)}`;
    const np = { id: Math.max(0, ...paiements.map((p) => p.id)) + 1, numeroFacture: num, contratId: Number(form.contratId), montant: Number(form.montant), datePaiement: form.datePaiement, statut: "paye", modePaiement: form.modePaiement, reference: form.reference.trim() };
    setPaiements((p) => [np, ...p]); setOpen(false); setForm(blank); notify("Paiement enregistré, facture générée.");
  };
  const marquerPaye = (p) => { setPaiements((arr) => arr.map((x) => x.id === p.id ? { ...x, statut: "paye" } : x)); notify("Paiement marqué comme réglé."); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Total encaissé" value={fmtMAD(totalEncaisse)} tint="#1B9E52" />
        <StatCard icon={AlertTriangle} label="Impayés" value={impayes.length} sub={fmtMAD(impayes.reduce((a, p) => a + p.montant, 0))} tint="#D64545" />
        <StatCard icon={CreditCard} label="Paiements enregistrés" value={paiements.length} tint={NAVY} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {[["tous", "Tous"], ["impayes", "Impayés"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="rounded-lg px-3 py-1.5 text-xs font-bold transition"
              style={{ background: tab === k ? NAVY : "#fff", color: tab === k ? "#fff" : "#5B5647", border: `1px solid ${tab === k ? NAVY : LINE}` }}>{l}</button>
          ))}
        </div>
        <GoldBtn onClick={() => setOpen(true)}><Plus size={16} /> Enregistrer un paiement</GoldBtn>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <div className="hidden grid-cols-12 gap-3 border-b px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 sm:grid" style={{ borderColor: LINE }}>
          <div className="col-span-3">Facture</div><div className="col-span-2">Assuré</div><div className="col-span-2">Mode</div><div className="col-span-1">Date</div>
          <div className="col-span-2">Montant</div><div className="col-span-2 text-right">Statut / Action</div>
        </div>
        {list.map((p) => {
          const { ct, cl } = infos(p);
          const mode = MODE_PAIEMENT[p.modePaiement] || MODE_PAIEMENT.especes;
          return (
            <div key={p.id} className="grid grid-cols-1 gap-2 border-b px-5 py-3.5 sm:grid-cols-12 sm:items-center sm:gap-3" style={{ borderColor: LINE }}>
              <div className="col-span-3"><div className="font-mono text-sm font-bold" style={{ color: INK }}>{p.numeroFacture}</div><div className="text-xs text-slate-400">{ct?.numero}</div></div>
              <div className="col-span-2 text-sm font-semibold text-slate-700">{cl?.prenom} {cl?.nom}</div>
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold" style={{ background: "#F1EEE6", color: NAVY }}>
                  <mode.icon size={13} /> {mode.label.replace(" (TPE)", "")}
                </span>
                {p.reference && <div className="mt-0.5 font-mono text-[11px] text-slate-400">{p.reference}</div>}
              </div>
              <div className="col-span-1 text-sm text-slate-600">{fmtDate(p.datePaiement)}</div>
              <div className="col-span-2 text-sm font-extrabold" style={{ color: GOLD_DARK }}>{fmtMAD(p.montant)}</div>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <Badge meta={STATUT_PAIEMENT[p.statut]} />
                {p.statut === "en_retard"
                  ? <button onClick={() => marquerPaye(p)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-white" style={{ background: "#1B9E52" }}>Régler</button>
                  : <>
                      <button onClick={() => setFacture(p)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" title="Voir la facture"><Eye size={16} /></button>
                      <button onClick={() => genererFacturePDF(p, infos)} className="rounded-lg p-1.5 hover:bg-slate-100" title="Télécharger le PDF" style={{ color: GOLD_DARK }}><Download size={16} /></button>
                    </>}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">Aucun paiement.</div>}
      </div>

      {/* Enregistrer */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau paiement">
        <div className="space-y-4">
          <Field label="Contrat *">
            <select className={inputCls} value={form.contratId} onChange={(e) => { const ct = contrats.find(c => c.id === Number(e.target.value)); setForm({ ...form, contratId: e.target.value, montant: ct ? ct.primeAnnuelle : "" }); }}>
              <option value="">— Sélectionner —</option>
              {contrats.map((c) => { const cl = clientById(c.clientId); return <option key={c.id} value={c.id}>{c.numero} · {cl?.prenom} {cl?.nom}</option>; })}
            </select>
          </Field>
          <Field label="Montant (DH) *"><input type="number" className={inputCls} value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} /></Field>
          <Field label="Date de paiement *"><input type="date" className={inputCls} value={form.datePaiement} onChange={(e) => setForm({ ...form, datePaiement: e.target.value })} /></Field>
          <Field label="Mode de paiement *">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(MODE_PAIEMENT).map(([k, m]) => (
                <button key={k} onClick={() => setForm({ ...form, modePaiement: k, reference: "" })}
                  className="flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-bold transition"
                  style={{ borderColor: form.modePaiement === k ? GOLD : LINE, background: form.modePaiement === k ? "#FFFBF0" : "#fff", color: NAVY }}>
                  <m.icon size={18} /> {m.label.replace(" (TPE)", "")}
                </button>
              ))}
            </div>
          </Field>
          {MODE_PAIEMENT[form.modePaiement].ref && (
            <Field label={`${MODE_PAIEMENT[form.modePaiement].refLabel} *`}>
              <input className={inputCls} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder={form.modePaiement === "cheque" ? "CHQ-0000000" : "TPE-000000"} />
            </Field>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <GhostBtn onClick={() => setOpen(false)}>Annuler</GhostBtn>
          <PrimaryBtn onClick={enregistrer}><Check size={16} /> Enregistrer & facturer</PrimaryBtn>
        </div>
      </Modal>

      {/* Facture PDF (aperçu) */}
      <Modal open={!!facture} onClose={() => setFacture(null)} title="Aperçu de la facture" wide>
        {facture && <FactureView p={facture} infos={infos} />}
      </Modal>
    </div>
  );
}

function FactureView({ p, infos }) {
  const { ct, cl } = infos(p);
  const mode = MODE_PAIEMENT[p.modePaiement] || MODE_PAIEMENT.especes;
  return (
    <div>
      <div className="rounded-2xl border p-6" style={{ borderColor: LINE }}>
        <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: LINE }}>
          <Logo />
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Facture</div>
            <div className="font-mono text-sm font-extrabold" style={{ color: INK }}>{p.numeroFacture}</div>
            <div className="text-xs text-slate-500">{fmtDate(p.datePaiement)}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 py-4 text-sm">
          <div><div className="text-xs font-bold uppercase text-slate-400">Assuré</div><div className="font-bold text-slate-700">{cl?.prenom} {cl?.nom}</div><div className="text-slate-500">{cl?.email}</div><div className="text-slate-500">{cl?.ville}</div></div>
          <div className="text-right"><div className="text-xs font-bold uppercase text-slate-400">Contrat</div><div className="font-bold text-slate-700">{ct?.numero}</div><div className="text-slate-500">{ct?.marque} {ct?.modele} · {ct?.immatriculation}</div></div>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Prime d'assurance automobile ({ct?.categorie})</span><span className="font-semibold text-slate-700">{fmtMAD(p.montant)}</span></div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-slate-500">Mode de règlement</span>
            <span className="font-semibold text-slate-700">{mode.label}{p.reference ? ` · ${p.reference}` : ""}</span>
          </div>
          <div className="mt-3 flex justify-between border-t pt-3" style={{ borderColor: LINE }}><span className="font-bold" style={{ color: INK }}>Total réglé</span><span className="text-lg font-extrabold" style={{ color: GOLD_DARK }}>{fmtMAD(p.montant)}</span></div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">Wafa Assurance — Ahl Al Khair · Merci de votre confiance</p>
      </div>
      <div className="mt-4 flex justify-center">
        <GoldBtn onClick={() => genererFacturePDF(p, infos)}><Download size={16} /> Télécharger la facture PDF</GoldBtn>
      </div>
    </div>
  );
}

// ---- Génération de la facture PDF (jsPDF) -----------------------------
function genererFacturePDF(p, infos) {
  const { ct, cl } = infos(p);
  const mode = MODE_PAIEMENT[p.modePaiement] || MODE_PAIEMENT.especes;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  const money = (n) => new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 }).format(n) + " DH";

  // Bandeau haut
  doc.setFillColor(11, 33, 56); doc.rect(0, 0, W, 96, "F");
  // Monogramme (carré doré + chevron vert)
  doc.setFillColor(242, 176, 30); doc.roundedRect(M, 28, 40, 40, 8, 8, "F");
  doc.setFillColor(62, 139, 65);
  doc.triangle(M, 28, M + 20, 28, M, 48, "F");
  doc.triangle(M + 6, 46, M + 20, 62, M + 34, 46, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
  doc.text("Wafa Assurance", M + 54, 46);
  doc.setTextColor(242, 176, 30); doc.setFontSize(8.5);
  doc.text("ASSURANCES AHL AL KHAIR", M + 54, 60);
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text("FACTURE", W - M, 44, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(p.numeroFacture, W - M, 62, { align: "right" });
  doc.text("Date : " + fmtDate(p.datePaiement), W - M, 76, { align: "right" });

  // Parties
  let y = 140;
  doc.setTextColor(150, 145, 135); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("ASSURÉ", M, y);
  doc.text("CONTRAT", W / 2 + 10, y);
  doc.setTextColor(40, 40, 45); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text(`${cl?.prenom || ""} ${cl?.nom || ""}`, M, y + 18);
  doc.text(ct?.numero || "", W / 2 + 10, y + 18);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(90, 90, 95);
  doc.text(cl?.email || "", M, y + 33);
  doc.text([cl?.adresse, cl?.ville].filter(Boolean).join(", "), M, y + 46);
  doc.text(`${ct?.marque || ""} ${ct?.modele || ""}`, W / 2 + 10, y + 33);
  doc.text(`Immatriculation : ${ct?.immatriculation || ""}`, W / 2 + 10, y + 46);
  doc.text(`Réf. client : ${cl?.reference || ""}`, W / 2 + 10, y + 59);

  // Tableau
  y = 232;
  doc.setFillColor(11, 33, 56); doc.rect(M, y, W - 2 * M, 26, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
  doc.text("DÉSIGNATION", M + 12, y + 17);
  doc.text("MONTANT", W - M - 12, y + 17, { align: "right" });
  y += 26;
  doc.setDrawColor(231, 225, 212); doc.setLineWidth(1);
  doc.setTextColor(50, 50, 55); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const cat = ct?.categorie === "moto" ? "moto" : "voiture";
  doc.text(`Prime annuelle d'assurance automobile (${cat})`, M + 12, y + 20);
  doc.text(money(p.montant), W - M - 12, y + 20, { align: "right" });
  doc.line(M, y + 34, W - M, y + 34);
  y += 34;
  doc.setFontSize(9.5); doc.setTextColor(90, 90, 95);
  doc.text(`Mode de règlement : ${mode.label}${p.reference ? " (" + p.reference + ")" : ""}`, M + 12, y + 20);
  y += 46;

  // Total
  doc.setFillColor(245, 242, 235); doc.roundedRect(W / 2, y, W / 2 - M, 40, 6, 6, "F");
  doc.setTextColor(11, 33, 56); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("TOTAL RÉGLÉ", W / 2 + 16, y + 25);
  doc.setTextColor(201, 138, 11); doc.setFontSize(14);
  doc.text(money(p.montant), W - M - 12, y + 25, { align: "right" });

  // Pied
  doc.setDrawColor(231, 225, 212); doc.line(M, 760, W - M, 760);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(150, 145, 135);
  doc.text("Wafa Assurance — Ahl Al Khair · Casablanca, Maroc · contact@wafa-ahlalkhair.ma", W / 2, 778, { align: "center" });
  doc.text("Merci de votre confiance.", W / 2, 792, { align: "center" });

  doc.save(`${p.numeroFacture}.pdf`);
}

// ============================================================
//  PAGE UTILISATEURS (admin)
// ============================================================
function UsersPage({ users, setUsers, notify }) {
  const [open, setOpen] = useState(false);
  const blank = { matricule: "", nom: "", prenom: "", email: "", role: "employe", agence: "" };
  const [form, setForm] = useState(blank);

  const toggle = (u) => { setUsers((us) => us.map((x) => x.id === u.id ? { ...x, actif: !x.actif } : x)); notify(u.actif ? "Compte désactivé." : "Compte activé."); };
  const add = () => {
    if (!form.nom || !form.prenom || !form.email) { notify("Nom, prénom et e-mail sont requis."); return; }
    const prefix = form.role === "admin" ? "AD" : "AG";
    const mat = form.matricule.trim() || `${prefix}-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    setUsers((us) => [...us, { ...form, matricule: mat, id: Math.max(0, ...us.map((u) => u.id)) + 1, actif: true }]);
    setOpen(false); setForm(blank); notify(`Utilisateur créé — matricule ${mat}.`);
  };
  const roleMeta = { admin: { label: "Administrateur", bg: "#EEE9F2", fg: "#6B4E86" }, employe: { label: "Employé", bg: "#EAF1FB", fg: "#2C5AA0" } };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><GoldBtn onClick={() => setOpen(true)}><Plus size={16} /> Nouvel utilisateur</GoldBtn></div>
      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <div className="hidden grid-cols-12 gap-3 border-b px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 sm:grid" style={{ borderColor: LINE }}>
          <div className="col-span-3">Utilisateur</div><div className="col-span-2">Matricule</div><div className="col-span-3">E-mail</div><div className="col-span-2">Rôle</div><div className="col-span-2 text-right">Statut</div>
        </div>
        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-1 gap-2 border-b px-5 py-3.5 sm:grid-cols-12 sm:items-center sm:gap-3" style={{ borderColor: LINE }}>
            <div className="col-span-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: NAVY }}>{u.prenom[0]}{u.nom[0]}</div>
              <div><span className="block text-sm font-bold" style={{ color: INK }}>{u.prenom} {u.nom}</span><span className="text-xs text-slate-400">{u.agence}</span></div>
            </div>
            <div className="col-span-2"><span className="rounded-md px-2 py-1 font-mono text-xs font-bold" style={{ background: "#F1EEE6", color: GOLD_DARK }}>{u.matricule}</span></div>
            <div className="col-span-3 text-sm text-slate-600">{u.email}</div>
            <div className="col-span-2"><Badge meta={roleMeta[u.role]} /></div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <span className="text-xs font-bold" style={{ color: u.actif ? "#1B7A43" : "#B23B3B" }}>{u.actif ? "Actif" : "Désactivé"}</span>
              <button onClick={() => toggle(u)} className="relative h-5 w-9 rounded-full transition" style={{ background: u.actif ? "#1B9E52" : "#D1CCBF" }}>
                <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" style={{ left: u.actif ? "18px" : "2px" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvel utilisateur">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom *"><input className={inputCls} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></Field>
          <Field label="Prénom *"><input className={inputCls} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></Field>
          <Field label="Matricule"><input className={inputCls} value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} placeholder="Auto si vide (AG-2026-…)" /></Field>
          <Field label="Agence"><input className={inputCls} value={form.agence} onChange={(e) => setForm({ ...form, agence: e.target.value })} placeholder="Casablanca — Maârif" /></Field>
          <Field label="E-mail *" full><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="agent@wafa.ma" /></Field>
          <Field label="Rôle *" full>
            <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employe">Employé</option><option value="admin">Administrateur</option>
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2"><GhostBtn onClick={() => setOpen(false)}>Annuler</GhostBtn><PrimaryBtn onClick={add}><Check size={16} /> Créer</PrimaryBtn></div>
      </Modal>
    </div>
  );
}

// ============================================================
//  PAGE NOTIFICATIONS
// ============================================================
function NotificationsPage({ notifs, setNotifs }) {
  const meta = {
    expiration_contrat: { icon: Clock, tint: "#9A6A12", bg: "#FEF4E2" },
    contrat_expire: { icon: XCircle, tint: "#B23B3B", bg: "#FBEAEA" },
    paiement_retard: { icon: CreditCard, tint: "#B23B3B", bg: "#FBEAEA" },
    nouveau_sinistre: { icon: ShieldAlert, tint: "#2C5AA0", bg: "#EAF1FB" },
  };
  const markAll = () => setNotifs((ns) => ns.map((n) => ({ ...n, lu: true })));
  const markOne = (n) => setNotifs((ns) => ns.map((x) => x.id === n.id ? { ...x, lu: true } : x));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex justify-end"><GhostBtn onClick={markAll}><Check size={15} /> Tout marquer comme lu</GhostBtn></div>
      <div className="space-y-2.5">
        {notifs.map((n) => {
          const m = meta[n.type] || meta.nouveau_sinistre;
          return (
            <div key={n.id} onClick={() => markOne(n)}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition hover:shadow-sm"
              style={{ borderColor: n.lu ? LINE : GOLD }}>
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: m.bg }}>
                <m.icon size={18} color={m.tint} />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: INK }}>{n.titre}</span>
                  {!n.lu && <span className="h-2 w-2 rounded-full" style={{ background: GOLD }} />}
                </div>
                <p className="text-sm text-slate-600">{n.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
//  ESPACE CLIENT
// ============================================================
function ClientDashboard({ client, contrats, sinistres, goto }) {
  const actifs = contrats.filter((c) => c.statut === "actif");
  const mesContratIds = contrats.map((c) => c.id);
  const mesSinistres = sinistres.filter((s) => mesContratIds.includes(s.contratId));
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(120deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}>
        <div className="text-sm font-medium" style={{ color: GOLD }}>Bienvenue,</div>
        <div className="text-2xl font-extrabold" style={{ fontFamily: "'Sora',sans-serif" }}>{client.prenom} {client.nom}</div>
        <p className="mt-1 text-sm text-slate-300">Voici un aperçu de vos contrats et démarches en cours.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={FileCheck} label="Contrats actifs" value={actifs.length} tint="#1B9E52" />
        <StatCard icon={ShieldAlert} label="Sinistres en cours" value={mesSinistres.filter((s) => s.statut !== "cloture" && s.statut !== "refuse").length} tint="#E0A526" />
        <StatCard icon={Wallet} label="Primes / an" value={fmtMAD(actifs.reduce((a, c) => a + c.primeAnnuelle, 0))} tint={GOLD_DARK} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button onClick={() => goto("mes-contrats")} className="flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition hover:shadow-md" style={{ borderColor: LINE }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#EAF1FB" }}><FileText size={22} color={NAVY} /></span>
          <div className="flex-1"><div className="font-bold" style={{ color: INK }}>Mes contrats</div><div className="text-sm text-slate-500">Consulter mes polices auto</div></div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button onClick={() => goto("mes-sinistres")} className="flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition hover:shadow-md" style={{ borderColor: LINE }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#FBEAEA" }}><ShieldAlert size={22} color="#B23B3B" /></span>
          <div className="flex-1"><div className="font-bold" style={{ color: INK }}>Déclarer un sinistre</div><div className="text-sm text-slate-500">Signaler un incident</div></div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      </div>
    </div>
  );
}

function MesContrats({ contrats }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {contrats.map((c) => (
        <div key={c.id} className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: c.categorie === "moto" ? "#FFF6E0" : "#EAF1FB" }}>
                {c.categorie === "moto" ? <Bike size={22} color={GOLD_DARK} /> : <Car size={22} color={NAVY} />}
              </span>
              <div><div className="font-extrabold" style={{ color: INK }}>{c.marque} {c.modele}</div><div className="text-xs text-slate-400">{c.immatriculation}</div></div>
            </div>
            <Badge meta={STATUT_CONTRAT[c.statut]} />
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs font-semibold text-slate-500">{c.numero}</div>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Valable jusqu'au</span><span className="font-semibold text-slate-700">{fmtDate(c.dateExpiration)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Prime annuelle</span><span className="font-extrabold" style={{ color: GOLD_DARK }}>{fmtMAD(c.primeAnnuelle)}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MesSinistres({ client, contrats, sinistres, setSinistres, setNotifs, notify }) {
  const mesContrats = contrats.filter((c) => c.clientId === client.id);
  const ids = mesContrats.map((c) => c.id);
  const mine = sinistres.filter((s) => ids.includes(s.contratId));
  const [open, setOpen] = useState(false);
  const blank = { contratId: "", dateDeclaration: "2026-07-24", description: "" };
  const [form, setForm] = useState(blank);

  const declare = () => {
    if (!form.contratId || form.description.length < 20) { notify("Contrat requis et description ≥ 20 caractères."); return; }
    const num = `SIN-2026-${String(Math.floor(Math.random() * 9000) + 100)}`;
    setSinistres((s) => [{ id: Math.max(0, ...s.map((x) => x.id)) + 1, numero: num, contratId: Number(form.contratId), dateDeclaration: form.dateDeclaration, description: form.description, statut: "declare", montantIndemnisation: null }, ...s]);
    setNotifs((ns) => [{ id: Math.max(0, ...ns.map((n) => n.id)) + 1, type: "nouveau_sinistre", titre: "Nouveau sinistre déclaré", message: `${client.prenom} ${client.nom} a déclaré le sinistre ${num}.`, lu: false }, ...ns]);
    setOpen(false); setForm(blank); notify("Sinistre déclaré. Nos équipes vous recontacteront.");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><GoldBtn onClick={() => setOpen(true)}><Plus size={16} /> Déclarer un sinistre</GoldBtn></div>
      <div className="space-y-3">
        {mine.map((s) => {
          const ct = contrats.find((c) => c.id === s.contratId);
          return (
            <div key={s.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold" style={{ color: INK }}>{s.numero}</span>
                <Badge meta={STATUT_SINISTRE[s.statut]} />
              </div>
              <div className="text-xs text-slate-400">{ct?.marque} {ct?.modele} · déclaré le {fmtDate(s.dateDeclaration)}</div>
              <p className="mt-2 text-sm text-slate-600">{s.description}</p>
              {s.montantIndemnisation != null && s.statut === "valide" && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: "#E7F5EC", color: "#1B7A43" }}>
                  <CheckCircle2 size={13} /> Indemnisation : {fmtMAD(s.montantIndemnisation)}
                </div>
              )}
            </div>
          );
        })}
        {mine.length === 0 && <div className="rounded-2xl border bg-white px-5 py-12 text-center text-sm text-slate-400" style={{ borderColor: LINE }}>Vous n'avez déclaré aucun sinistre.</div>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Déclarer un sinistre">
        <div className="space-y-4">
          <Field label="Contrat concerné *">
            <select className={inputCls} value={form.contratId} onChange={(e) => setForm({ ...form, contratId: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {mesContrats.filter((c) => c.statut === "actif").map((c) => <option key={c.id} value={c.id}>{c.marque} {c.modele} · {c.numero}</option>)}
            </select>
          </Field>
          <Field label="Date *"><input type="date" className={inputCls} value={form.dateDeclaration} onChange={(e) => setForm({ ...form, dateDeclaration: e.target.value })} /></Field>
          <Field label="Description (min. 20 caractères) *">
            <textarea rows={4} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez ce qui s'est passé…" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2"><GhostBtn onClick={() => setOpen(false)}>Annuler</GhostBtn><PrimaryBtn onClick={declare}><Check size={16} /> Envoyer</PrimaryBtn></div>
      </Modal>
    </div>
  );
}

function MesPaiements({ client, contrats, paiements }) {
  const ids = contrats.map((c) => c.id);
  const mine = paiements.filter((p) => ids.includes(p.contratId));
  const infos = (p) => ({ ct: contrats.find((c) => c.id === p.contratId), cl: client });
  return (
    <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
      {mine.map((p) => {
        const ct = contrats.find((c) => c.id === p.contratId);
        const mode = MODE_PAIEMENT[p.modePaiement] || MODE_PAIEMENT.especes;
        return (
          <div key={p.id} className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: LINE }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#F1EEE6" }}><CreditCard size={18} color={NAVY} /></span>
            <div className="flex-1">
              <div className="font-mono text-sm font-bold" style={{ color: INK }}>{p.numeroFacture}</div>
              <div className="text-xs text-slate-400">{ct?.marque} {ct?.modele} · {fmtDate(p.datePaiement)} · {mode.label.replace(" (TPE)", "")}</div>
            </div>
            <div className="text-sm font-extrabold" style={{ color: GOLD_DARK }}>{fmtMAD(p.montant)}</div>
            <Badge meta={STATUT_PAIEMENT[p.statut]} />
            {p.statut !== "en_retard" && (
              <button onClick={() => genererFacturePDF(p, infos)} className="rounded-lg p-1.5 hover:bg-slate-100" title="Télécharger la facture PDF" style={{ color: GOLD_DARK }}><Download size={16} /></button>
            )}
          </div>
        );
      })}
      {mine.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-400">Aucun paiement enregistré.</div>}
    </div>
  );
}

// ============================================================
//  MON PROFIL (client connecté)
// ============================================================
function MonProfil({ client, contrats, sinistres, paiements }) {
  return (
    <div className="mx-auto max-w-3xl">
      <ClientProfileBody client={client} contrats={contrats} sinistres={sinistres} paiements={paiements} isAdmin={false} onRemove={() => {}} />
      <p className="mt-4 text-center text-xs text-slate-400">
        Pour modifier vos informations personnelles, contactez votre agence ou votre conseiller Wafa Assurance.
      </p>
    </div>
  );
}

// ============================================================
//  PAGE D'ACCUEIL (publique)
// ============================================================
function Landing({ onEnter }) {
  const nav = [["#offres", "Nos offres"], ["#avantages", "Avantages"], ["#etapes", "Souscription"], ["#contact", "Contact"]];
  const offres = [
    {
      icon: Car, tag: "Voiture", from: "1 900 DH/an", tint: NAVY, bg: "#EAF1FB",
      pts: ["Responsabilité civile obligatoire", "Dommages, vol & incendie en option", "Bris de glace et assistance 24/7", "Véhicule de remplacement (formule Tous risques)"],
    },
    {
      icon: Bike, tag: "Moto & scooter", from: "850 DH/an", tint: GOLD_DARK, bg: "#FFF6E0",
      pts: ["Cylindrées 50 à 1000+ cc", "Garantie conducteur incluse", "Vol et incendie en option", "Assistance dépannage sur route"],
    },
  ];
  const avantages = [
    { icon: Clock, t: "Indemnisation rapide", d: "Un sinistre traité et suivi en ligne, sans paperasse inutile." },
    { icon: Building2, t: "Réseau d'agences", d: "Un conseiller Ahl Al Khair proche de vous, partout au Maroc." },
    { icon: LayoutDashboard, t: "Espace 100% digital", d: "Contrats, attestations et paiements accessibles à tout moment." },
    { icon: ShieldAlert, t: "Éthique Takaful", d: "Une couverture fondée sur l'entraide et la transparence." },
  ];
  const etapes = [
    { n: "01", icon: FileText, t: "Demandez un devis", d: "Renseignez votre véhicule et recevez une estimation immédiate." },
    { n: "02", icon: CheckCircle2, t: "Souscrivez en ligne", d: "Validez la formule adaptée et réglez votre prime en toute sécurité." },
    { n: "03", icon: FileCheck, t: "Recevez votre attestation", d: "Votre attestation auto est disponible aussitôt dans votre espace." },
  ];

  return (
    <div style={{ background: PAPER, fontFamily: "'Manrope',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        html { scroll-behavior: smooth; }`}</style>

      {/* NAV */}
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur" style={{ borderColor: LINE }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo size={40} />
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map(([href, label]) => (
              <a key={label} href={href} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={onEnter} className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:block">Se connecter</button>
            <button onClick={onEnter} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:brightness-95" style={{ background: GOLD, color: NAVY }}>
              Demander un devis <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: "#E7F0E8", color: GREEN_DARK }}>
              <Car size={14} /> Assurance automobile · Takaful Ahl Al Khair
            </div>
            <h1 className="mt-5 font-extrabold leading-[1.05]" style={{ color: INK, fontFamily: "'Sora',sans-serif", fontSize: "clamp(2.1rem, 5vw, 3.4rem)" }}>
              Votre voiture et votre moto,<br />assurées en <span style={{ color: GOLD_DARK }}>toute confiance</span>.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-600">
              Wafa Assurance — Ahl Al Khair vous accompagne à chaque kilomètre : devis immédiat,
              souscription en ligne et gestion de vos sinistres depuis un espace unique et sécurisé.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={onEnter} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:brightness-95" style={{ background: NAVY }}>
                Souscrire maintenant <ArrowRight size={16} />
              </button>
              <button onClick={onEnter} className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-white" style={{ borderColor: LINE }}>
                Accéder à mon espace
              </button>
            </div>
            <div className="mt-9 flex flex-wrap gap-8">
              {[["+1 200", "Véhicules assurés"], ["48h", "Traitement sinistre"], ["30+", "Agences au Maroc"]].map(([a, b]) => (
                <div key={b}>
                  <div className="text-2xl font-extrabold" style={{ color: NAVY, fontFamily: "'Sora',sans-serif" }}>{a}</div>
                  <div className="text-xs font-medium text-slate-500">{b}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visuel : carte attestation */}
          <div className="relative">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full" style={{ background: GOLD, opacity: 0.16 }} />
            <div className="absolute -bottom-8 -left-4 h-32 w-32 rounded-full" style={{ background: GREEN, opacity: 0.12 }} />
            <div className="relative rounded-3xl border bg-white p-6 shadow-xl" style={{ borderColor: LINE }}>
              <div className="flex items-center justify-between">
                <Logo size={38} />
                <span className="rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: "#E7F5EC", color: GREEN_DARK }}>Active</span>
              </div>
              <div className="mt-5 rounded-2xl p-5 text-white" style={{ background: `linear-gradient(120deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}>
                <div className="text-xs font-medium" style={{ color: GOLD }}>Attestation d'assurance auto</div>
                <div className="mt-1 font-mono text-lg font-extrabold">WA-AUTO-2026-0148</div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div><div className="text-slate-400">Assuré</div><div className="font-bold">Youssef El Amrani</div></div>
                  <div><div className="text-slate-400">Véhicule</div><div className="font-bold">Dacia Logan</div></div>
                  <div><div className="text-slate-400">Immatriculation</div><div className="font-bold">45213-A-6</div></div>
                  <div><div className="text-slate-400">Valable jusqu'au</div><div className="font-bold">01 août 2026</div></div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border p-3" style={{ borderColor: LINE }}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Wallet size={16} color={GOLD_DARK} /> Prime annuelle</div>
                <div className="font-extrabold" style={{ color: NAVY }}>3 200 DH</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFRES */}
      <section id="offres" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: GOLD_DARK }}>Nos formules auto</div>
          <h2 className="mt-2 font-extrabold" style={{ color: INK, fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}>Une couverture pour chaque véhicule</h2>
          <p className="mt-3 text-[15px] text-slate-600">Que vous rouliez en voiture ou à moto, choisissez la protection qui vous ressemble.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {offres.map((o) => (
            <div key={o.tag} className="rounded-3xl border bg-white p-7 transition hover:shadow-lg" style={{ borderColor: LINE }}>
              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: o.bg }}>
                  <o.icon size={26} color={o.tint} />
                </span>
                <div className="text-right">
                  <div className="text-xs text-slate-400">à partir de</div>
                  <div className="text-xl font-extrabold" style={{ color: GOLD_DARK, fontFamily: "'Sora',sans-serif" }}>{o.from}</div>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-extrabold" style={{ color: INK }}>Assurance {o.tag}</h3>
              <ul className="mt-4 space-y-2.5">
                {o.pts.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 size={17} color={GREEN} className="mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <button onClick={onEnter} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-95" style={{ background: NAVY }}>
                Obtenir un devis {o.tag.toLowerCase()} <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* AVANTAGES */}
      <section id="avantages" style={{ background: NAVY }}>
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>Pourquoi Ahl Al Khair</div>
            <h2 className="mt-2 font-extrabold text-white" style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}>Une assurance pensée pour vous</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {avantages.map((a) => (
              <div key={a.t} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(242,176,30,.16)" }}>
                  <a.icon size={20} color={GOLD} />
                </span>
                <h3 className="mt-4 font-bold text-white">{a.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ETAPES */}
      <section id="etapes" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: GOLD_DARK }}>En 3 étapes</div>
          <h2 className="mt-2 font-extrabold" style={{ color: INK, fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}>Souscrire n'a jamais été aussi simple</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {etapes.map((s) => (
            <div key={s.n} className="relative rounded-3xl border bg-white p-7" style={{ borderColor: LINE }}>
              <div className="absolute right-6 top-5 text-3xl font-extrabold" style={{ color: "#EEE8DA", fontFamily: "'Sora',sans-serif" }}>{s.n}</div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#E7F0E8" }}>
                <s.icon size={22} color={GREEN_DARK} />
              </span>
              <h3 className="mt-4 font-bold" style={{ color: INK }}>{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="overflow-hidden rounded-3xl px-8 py-12 text-center" style={{ background: `linear-gradient(120deg, ${GREEN_DARK} 0%, ${GREEN} 100%)` }}>
          <h2 className="font-extrabold text-white" style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>Prêt à assurer votre véhicule ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/90">Rejoignez les milliers d'assurés qui font confiance à Wafa Assurance — Ahl Al Khair.</p>
          <button onClick={onEnter} className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition hover:brightness-95" style={{ background: "#fff", color: GREEN_DARK }}>
            Commencer mon devis <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t" style={{ borderColor: LINE, background: "#fff" }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size={40} />
            <p className="mt-4 max-w-xs text-sm text-slate-500">Assurance automobile et services Takaful pour particuliers et professionnels au Maroc.</p>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: INK }}>Assurances</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Assurance voiture</li><li>Assurance moto</li><li>Assistance & dépannage</li><li>Garantie conducteur</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: INK }}>Espace assuré</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><button onClick={onEnter} className="hover:text-slate-800">Se connecter</button></li>
              <li><button onClick={onEnter} className="hover:text-slate-800">Demander un devis</button></li>
              <li>Déclarer un sinistre</li><li>Suivre mon dossier</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: INK }}>Contact</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2"><Phone size={14} /> 05 22 00 00 00</li>
              <li className="flex items-center gap-2"><Mail size={14} /> contact@wafa-ahlalkhair.ma</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Casablanca, Maroc</li>
            </ul>
          </div>
        </div>
        <div className="border-t px-5 py-5 text-center text-xs text-slate-400" style={{ borderColor: LINE }}>
          © 2026 Wafa Assurance — Ahl Al Khair. Interface de démonstration. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
