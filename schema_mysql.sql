-- ============================================================
--  Wafa Assurance — Ahl Al Khair
--  Base de données MySQL (pour le backend Laravel de production)
--  Assurance automobile : voitures & motos
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_assurance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE gestion_assurance;

-- ---- Utilisateurs (admin / employé) -----------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  matricule VARCHAR(30) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin','employe') NOT NULL DEFAULT 'employe',
  agence VARCHAR(120),
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- ---- Clients ----------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(30) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  cin VARCHAR(20),
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(20) NOT NULL,
  adresse VARCHAR(255),
  ville VARCHAR(100),
  date_naissance DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nom (nom, prenom),
  INDEX idx_reference (reference)
) ENGINE=InnoDB;

-- ---- Contrats (auto : voiture / moto) ---------------------
CREATE TABLE IF NOT EXISTS contrats (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_contrat VARCHAR(50) NOT NULL UNIQUE,
  client_id BIGINT UNSIGNED NOT NULL,
  categorie ENUM('voiture','moto') NOT NULL,
  marque VARCHAR(80) NOT NULL,
  modele VARCHAR(80),
  immatriculation VARCHAR(30) NOT NULL,
  date_debut DATE NOT NULL,
  date_expiration DATE NOT NULL,
  prime_annuelle DECIMAL(10,2) NOT NULL,
  statut ENUM('actif','expire','suspendu','resilie') NOT NULL DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  INDEX idx_client (client_id),
  INDEX idx_statut (statut),
  INDEX idx_categorie (categorie)
) ENGINE=InnoDB;

-- ---- Sinistres --------------------------------------------
CREATE TABLE IF NOT EXISTS sinistres (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_sinistre VARCHAR(50) NOT NULL UNIQUE,
  contrat_id BIGINT UNSIGNED NOT NULL,
  date_declaration DATE NOT NULL,
  description TEXT NOT NULL,
  statut ENUM('declare','en_cours','valide','cloture','refuse') NOT NULL DEFAULT 'declare',
  montant_indemnisation DECIMAL(12,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contrat_id) REFERENCES contrats(id) ON DELETE RESTRICT,
  INDEX idx_contrat (contrat_id),
  INDEX idx_statut (statut)
) ENGINE=InnoDB;

-- ---- Paiements --------------------------------------------
CREATE TABLE IF NOT EXISTS paiements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_facture VARCHAR(50) NOT NULL UNIQUE,
  contrat_id BIGINT UNSIGNED NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  date_paiement DATE NOT NULL,
  mode_paiement ENUM('especes','carte','cheque') NOT NULL DEFAULT 'especes',
  reference VARCHAR(60) DEFAULT NULL,
  statut ENUM('paye','en_retard','partiel') NOT NULL DEFAULT 'paye',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contrat_id) REFERENCES contrats(id) ON DELETE RESTRICT,
  INDEX idx_contrat (contrat_id),
  INDEX idx_statut (statut)
) ENGINE=InnoDB;

-- ---- Documents (justificatifs de sinistres) --------------
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sinistre_id BIGINT UNSIGNED NOT NULL,
  nom_fichier VARCHAR(255) NOT NULL,
  chemin VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  taille INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sinistre_id) REFERENCES sinistres(id) ON DELETE CASCADE,
  INDEX idx_sinistre (sinistre_id)
) ENGINE=InnoDB;

-- ---- Notifications ----------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id BIGINT UNSIGNED,
  type ENUM('expiration_contrat','contrat_expire','paiement_retard','nouveau_sinistre') NOT NULL,
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  lu BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  INDEX idx_lu (lu)
) ENGINE=InnoDB;

-- ============================================================
--  Données initiales
-- ============================================================
-- Mot de passe de démo = "wafa2026" (à hacher avec bcrypt côté Laravel)
INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe, role, agence, actif) VALUES
('AD-2015-001','Alaoui','Rachid','admin@wafa.ma','$2y$10$exempleHashBcryptAdmin','admin','Casablanca — Maârif',TRUE),
('AG-2019-014','Fassi','Leila','employe@wafa.ma','$2y$10$exempleHashBcryptAgent','employe','Rabat — Agdal',TRUE),
('AG-2021-039','Berrada','Omar','o.berrada@wafa.ma','$2y$10$exempleHashBcryptAgent','employe','Marrakech — Guéliz',FALSE);

INSERT INTO clients (reference, nom, prenom, cin, email, telephone, adresse, ville, date_naissance) VALUES
('CLI-2022-0148','El Amrani','Youssef','BK449120','y.elamrani@gmail.com','0661234501','12 Rue Ibn Batouta','Casablanca','1988-03-14'),
('CLI-2022-0201','Benjelloun','Salma','BE778211','salma.benj@outlook.com','0662345612','45 Av. Mohammed V','Rabat','1992-07-22'),
('CLI-2021-0912','Ouazzani','Karim','CD112390','k.ouazzani@gmail.com','0663456723','8 Rue de la Liberté','Marrakech','1985-11-30'),
('CLI-2024-0033','Chraibi','Nadia','AB556012','nadia.ch@gmail.com','0664567834','23 Bd Hassan II','Fès','1990-02-08'),
('CLI-2023-0500','Tazi','Mehdi','EE203417','mehdi.tazi@gmail.com','0665678945','5 Rue Al Massira','Tanger','1995-09-12'),
('CLI-2023-0611','Bennani','Imane','FG901233','imane.bennani@gmail.com','0666789056','17 Av. des FAR','Agadir','1993-06-25');

INSERT INTO contrats (numero_contrat, client_id, categorie, marque, modele, immatriculation, date_debut, date_expiration, prime_annuelle, statut) VALUES
('WA-AUTO-2025-0148',1,'voiture','Dacia','Logan','45213-A-6','2025-08-01','2026-08-01',3200,'actif'),
('WA-AUTO-2025-0219',2,'voiture','Renault','Clio','78120-B-12','2025-09-15','2026-08-10',4100,'actif'),
('WA-AUTO-2024-0912',3,'moto','Yamaha','NMAX 125','11045-C-3','2024-06-20','2025-06-20',1400,'expire'),
('WA-AUTO-2026-0033',4,'voiture','Peugeot','208','90233-D-4','2026-02-01','2027-02-01',5200,'actif'),
('WA-AUTO-2025-0500',5,'moto','Honda','PCX 150','33781-E-1','2025-07-30','2026-07-30',1750,'actif'),
('WA-AUTO-2025-0611',6,'voiture','Hyundai','Accent','56090-F-10','2025-05-12','2026-05-12',3800,'actif');

INSERT INTO paiements (numero_facture, contrat_id, montant, date_paiement, mode_paiement, reference, statut) VALUES
('FAC-2025-1101',1,3200,'2025-08-01','carte','TPE-778120','paye'),
('FAC-2025-1188',2,4100,'2025-09-15','cheque','CHQ-0045123','paye'),
('FAC-2026-0102',4,5200,'2026-02-01','especes',NULL,'paye'),
('FAC-2026-0210',6,3800,'2026-06-01','cheque','CHQ-0051980','en_retard'),
('FAC-2025-0990',5,1750,'2025-07-30','carte','TPE-660901','paye');

INSERT INTO sinistres (numero_sinistre, contrat_id, date_declaration, description, statut, montant_indemnisation) VALUES
('SIN-2026-0071',1,'2026-06-18','Collision arrière au feu rouge, pare-chocs endommagé.','en_cours',NULL),
('SIN-2026-0044',4,'2026-04-02','Bris de glace pare-brise suite à projection de gravier.','valide',2200),
('SIN-2026-0088',5,'2026-07-10','Chute de la moto sur chaussée mouillée, rétroviseur cassé.','declare',NULL);
