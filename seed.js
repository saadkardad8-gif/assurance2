// Données de démonstration (première initialisation de la base).
// Elles sont écrites dans server/db.json au premier démarrage, puis mises à jour par l'application.
export const seed = {
  clients: [
    { id: 1, reference: "CLI-2022-0148", nom: "El Amrani", prenom: "Youssef", cin: "BK449120", email: "y.elamrani@gmail.com", telephone: "0661234501", ville: "Casablanca", adresse: "12 Rue Ibn Batouta", dateNaissance: "1988-03-14", depuis: "2022-01-10" },
    { id: 2, reference: "CLI-2022-0201", nom: "Benjelloun", prenom: "Salma", cin: "BE778211", email: "salma.benj@outlook.com", telephone: "0662345612", ville: "Rabat", adresse: "45 Av. Mohammed V", dateNaissance: "1992-07-22", depuis: "2022-05-03" },
    { id: 3, reference: "CLI-2021-0912", nom: "Ouazzani", prenom: "Karim", cin: "CD112390", email: "k.ouazzani@gmail.com", telephone: "0663456723", ville: "Marrakech", adresse: "8 Rue de la Liberté", dateNaissance: "1985-11-30", depuis: "2021-09-18" },
    { id: 4, reference: "CLI-2024-0033", nom: "Chraibi", prenom: "Nadia", cin: "AB556012", email: "nadia.ch@gmail.com", telephone: "0664567834", ville: "Fès", adresse: "23 Bd Hassan II", dateNaissance: "1990-02-08", depuis: "2024-01-20" },
    { id: 5, reference: "CLI-2023-0500", nom: "Tazi", prenom: "Mehdi", cin: "EE203417", email: "mehdi.tazi@gmail.com", telephone: "0665678945", ville: "Tanger", adresse: "5 Rue Al Massira", dateNaissance: "1995-09-12", depuis: "2023-07-11" },
    { id: 6, reference: "CLI-2023-0611", nom: "Bennani", prenom: "Imane", cin: "FG901233", email: "imane.bennani@gmail.com", telephone: "0666789056", ville: "Agadir", adresse: "17 Av. des FAR", dateNaissance: "1993-06-25", depuis: "2023-04-29" },
  ],
  contrats: [
    { id: 1, numero: "WA-AUTO-2025-0148", clientId: 1, categorie: "voiture", marque: "Dacia", modele: "Logan", immatriculation: "45213-A-6", dateDebut: "2025-08-01", dateExpiration: "2026-08-01", primeAnnuelle: 3200, statut: "actif" },
    { id: 2, numero: "WA-AUTO-2025-0219", clientId: 2, categorie: "voiture", marque: "Renault", modele: "Clio", immatriculation: "78120-B-12", dateDebut: "2025-09-15", dateExpiration: "2026-08-10", primeAnnuelle: 4100, statut: "actif" },
    { id: 3, numero: "WA-AUTO-2024-0912", clientId: 3, categorie: "moto", marque: "Yamaha", modele: "NMAX 125", immatriculation: "11045-C-3", dateDebut: "2024-06-20", dateExpiration: "2025-06-20", primeAnnuelle: 1400, statut: "expire" },
    { id: 4, numero: "WA-AUTO-2026-0033", clientId: 4, categorie: "voiture", marque: "Peugeot", modele: "208", immatriculation: "90233-D-4", dateDebut: "2026-02-01", dateExpiration: "2027-02-01", primeAnnuelle: 5200, statut: "actif" },
    { id: 5, numero: "WA-AUTO-2025-0500", clientId: 5, categorie: "moto", marque: "Honda", modele: "PCX 150", immatriculation: "33781-E-1", dateDebut: "2025-07-30", dateExpiration: "2026-07-30", primeAnnuelle: 1750, statut: "actif" },
    { id: 6, numero: "WA-AUTO-2025-0611", clientId: 6, categorie: "voiture", marque: "Hyundai", modele: "Accent", immatriculation: "56090-F-10", dateDebut: "2025-05-12", dateExpiration: "2026-05-12", primeAnnuelle: 3800, statut: "actif" },
  ],
  sinistres: [
    { id: 1, numero: "SIN-2026-0071", contratId: 1, dateDeclaration: "2026-06-18", description: "Collision arrière au feu rouge, pare-chocs endommagé.", statut: "en_cours", montantIndemnisation: null },
    { id: 2, numero: "SIN-2026-0044", contratId: 4, dateDeclaration: "2026-04-02", description: "Bris de glace pare-brise suite à projection de gravier.", statut: "valide", montantIndemnisation: 2200 },
    { id: 3, numero: "SIN-2026-0088", contratId: 5, dateDeclaration: "2026-07-10", description: "Chute de la moto sur chaussée mouillée, rétroviseur cassé.", statut: "declare", montantIndemnisation: null },
  ],
  paiements: [
    { id: 1, numeroFacture: "FAC-2025-1101", contratId: 1, montant: 3200, datePaiement: "2025-08-01", statut: "paye", modePaiement: "carte", reference: "TPE-778120" },
    { id: 2, numeroFacture: "FAC-2025-1188", contratId: 2, montant: 4100, datePaiement: "2025-09-15", statut: "paye", modePaiement: "cheque", reference: "CHQ-0045123" },
    { id: 3, numeroFacture: "FAC-2026-0102", contratId: 4, montant: 5200, datePaiement: "2026-02-01", statut: "paye", modePaiement: "especes", reference: "" },
    { id: 4, numeroFacture: "FAC-2026-0210", contratId: 6, montant: 3800, datePaiement: "2026-06-01", statut: "en_retard", modePaiement: "cheque", reference: "CHQ-0051980" },
    { id: 5, numeroFacture: "FAC-2025-0990", contratId: 5, montant: 1750, datePaiement: "2025-07-30", statut: "paye", modePaiement: "carte", reference: "TPE-660901" },
  ],
  users: [
    { id: 1, matricule: "AD-2015-001", nom: "Alaoui", prenom: "Rachid", email: "admin@wafa.ma", role: "admin", actif: true, agence: "Casablanca — Maârif" },
    { id: 2, matricule: "AG-2019-014", nom: "Fassi", prenom: "Leila", email: "employe@wafa.ma", role: "employe", actif: true, agence: "Rabat — Agdal" },
    { id: 3, matricule: "AG-2021-039", nom: "Berrada", prenom: "Omar", email: "o.berrada@wafa.ma", role: "employe", actif: false, agence: "Marrakech — Guéliz" },
  ],
  notifs: [
    { id: 1, type: "expiration_contrat", titre: "Contrat proche de l'expiration", message: "Le contrat WA-AUTO-2025-0148 (Y. El Amrani) expire dans 8 jours.", lu: false },
    { id: 2, type: "nouveau_sinistre", titre: "Nouveau sinistre déclaré", message: "Sinistre SIN-2026-0088 déclaré sur le contrat WA-AUTO-2025-0500.", lu: false },
    { id: 3, type: "paiement_retard", titre: "Paiement en retard", message: "La facture FAC-2026-0210 (I. Bennani) est en retard de 53 jours.", lu: false },
    { id: 4, type: "contrat_expire", titre: "Contrat expiré", message: "Le contrat WA-AUTO-2024-0912 (K. Ouazzani) est expiré depuis le 20 juin 2025.", lu: true },
  ],
};
