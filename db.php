<?php
// ============================================================
//  Couche d'accès aux données (PDO)
//  Gère la connexion, la création du schéma, l'insertion des
//  données initiales et la conversion base <-> API (camelCase).
// ============================================================

// Correspondance champ API (camelCase)  =>  colonne SQL (snake_case)
// pour chaque ressource. L'ordre définit aussi les colonnes créées.
const SCHEMA = [
    'clients' => [
        'reference' => 'reference', 'nom' => 'nom', 'prenom' => 'prenom', 'cin' => 'cin',
        'email' => 'email', 'telephone' => 'telephone', 'ville' => 'ville', 'adresse' => 'adresse',
        'dateNaissance' => 'date_naissance', 'depuis' => 'depuis',
    ],
    'contrats' => [
        'numero' => 'numero', 'clientId' => 'client_id', 'categorie' => 'categorie', 'marque' => 'marque',
        'modele' => 'modele', 'immatriculation' => 'immatriculation', 'dateDebut' => 'date_debut',
        'dateExpiration' => 'date_expiration', 'primeAnnuelle' => 'prime_annuelle', 'statut' => 'statut',
    ],
    'sinistres' => [
        'numero' => 'numero', 'contratId' => 'contrat_id', 'dateDeclaration' => 'date_declaration',
        'description' => 'description', 'statut' => 'statut', 'montantIndemnisation' => 'montant_indemnisation',
    ],
    'paiements' => [
        'numeroFacture' => 'numero_facture', 'contratId' => 'contrat_id', 'montant' => 'montant',
        'datePaiement' => 'date_paiement', 'statut' => 'statut', 'modePaiement' => 'mode_paiement', 'reference' => 'reference',
    ],
    'users' => [
        'matricule' => 'matricule', 'nom' => 'nom', 'prenom' => 'prenom', 'email' => 'email',
        'role' => 'role', 'actif' => 'actif', 'agence' => 'agence',
    ],
    'notifs' => [
        'type' => 'type', 'titre' => 'titre', 'message' => 'message', 'lu' => 'lu',
    ],
];

const NUMERIC_COLS = ['client_id', 'contrat_id', 'prime_annuelle', 'montant', 'montant_indemnisation'];
const BOOL_COLS    = ['actif', 'lu'];

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $cfg = require __DIR__ . '/config.php';
    if ($cfg['driver'] === 'mysql') {
        $m = $cfg['mysql'];
        $dsn = "mysql:host={$m['host']};port={$m['port']};dbname={$m['database']};charset=utf8mb4";
        $pdo = new PDO($dsn, $m['username'], $m['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } else {
        $pdo = new PDO('sqlite:' . $cfg['sqlite']['path'], null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $pdo->exec('PRAGMA journal_mode = WAL');
    }
    init_schema($pdo, $cfg['driver']);
    seed_if_empty($pdo);
    return $pdo;
}

function init_schema(PDO $pdo, string $driver): void
{
    $auto = $driver === 'mysql'
        ? 'BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY'
        : 'INTEGER PRIMARY KEY AUTOINCREMENT';

    foreach (SCHEMA as $table => $fields) {
        $cols = ["id $auto"];
        foreach ($fields as $col) {
            if (in_array($col, NUMERIC_COLS, true))      $type = ($driver === 'mysql') ? 'DECIMAL(12,2)' : 'REAL';
            elseif (in_array($col, BOOL_COLS, true))     $type = ($driver === 'mysql') ? 'TINYINT(1)' : 'INTEGER';
            elseif ($col === 'description' || $col === 'message') $type = 'TEXT';
            else                                          $type = ($driver === 'mysql') ? 'VARCHAR(255)' : 'TEXT';
            $cols[] = "`$col` $type";
        }
        $sql = "CREATE TABLE IF NOT EXISTS `$table` (" . implode(', ', $cols) . ")";
        if ($driver === 'mysql') $sql .= ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';
        $pdo->exec($sql);
    }
}

function seed_if_empty(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count > 0) return;
    $seed = require __DIR__ . '/seed.php';
    foreach ($seed as $table => $items) {
        replace_all($pdo, $table, $items);
    }
}

// Convertit une ligne SQL en objet API (camelCase, types corrects)
function row_to_api(string $table, array $row): array
{
    $out = ['id' => (int) $row['id']];
    foreach (SCHEMA[$table] as $apiKey => $col) {
        $val = $row[$col] ?? null;
        if (in_array($col, BOOL_COLS, true))      $val = (bool) $val;
        elseif (in_array($col, NUMERIC_COLS, true)) $val = $val === null ? null : (float) $val + 0;
        $out[$apiKey] = $val;
    }
    return $out;
}

// Extrait les couples colonne => valeur d'un objet API pour l'insertion/MAJ
function api_to_cols(string $table, array $obj): array
{
    $cols = [];
    foreach (SCHEMA[$table] as $apiKey => $col) {
        if (!array_key_exists($apiKey, $obj)) continue;
        $val = $obj[$apiKey];
        if (in_array($col, BOOL_COLS, true)) $val = $val ? 1 : 0;
        $cols[$col] = $val;
    }
    return $cols;
}

function get_all(PDO $pdo, string $table): array
{
    $rows = $pdo->query("SELECT * FROM `$table` ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
    return array_map(fn($r) => row_to_api($table, $r), $rows);
}

function find_one(PDO $pdo, string $table, $id): ?array
{
    $st = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
    $st->execute([$id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ? row_to_api($table, $row) : null;
}

function insert_one(PDO $pdo, string $table, array $obj): array
{
    $cols = api_to_cols($table, $obj);
    if (isset($obj['id'])) $cols = ['id' => (int) $obj['id']] + $cols;
    $names = array_keys($cols);
    $ph = implode(', ', array_fill(0, count($names), '?'));
    $colList = implode(', ', array_map(fn($c) => "`$c`", $names));
    $st = $pdo->prepare("INSERT INTO `$table` ($colList) VALUES ($ph)");
    $st->execute(array_values($cols));
    $id = $obj['id'] ?? (int) $pdo->lastInsertId();
    return find_one($pdo, $table, $id);
}

function update_one(PDO $pdo, string $table, $id, array $obj): ?array
{
    $cols = api_to_cols($table, $obj);
    if (!$cols) return find_one($pdo, $table, $id);
    $set = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($cols)));
    $st = $pdo->prepare("UPDATE `$table` SET $set WHERE id = ?");
    $st->execute([...array_values($cols), $id]);
    return find_one($pdo, $table, $id);
}

function delete_one(PDO $pdo, string $table, $id): void
{
    $st = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
    $st->execute([$id]);
}

// Remplace tout le contenu d'une table (utilisé par PUT /api/state)
function replace_all(PDO $pdo, string $table, array $items): void
{
    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM `$table`");
        foreach ($items as $obj) insert_one($pdo, $table, $obj);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}
