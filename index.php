<?php
// ============================================================
//  API Wafa Assurance — Ahl Al Khair  (backend PHP)
//  Point d'entrée unique : router pour le serveur intégré PHP.
//  Démarrage :  php -S localhost:3001 backend-php/index.php
// ============================================================
declare(strict_types=1);
require __DIR__ . '/db.php';

// ---- CORS + JSON ----------------------------------------------------------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function json_out($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function body(): array
{
    $raw = file_get_contents('php://input');
    $d = json_decode($raw ?: '[]', true);
    return is_array($d) ? $d : [];
}

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts  = array_values(array_filter(explode('/', $path)));   // ex: ['api','clients','3']

// Sert uniquement les routes /api/*
if (($parts[0] ?? '') !== 'api') {
    json_out(['api' => 'Wafa Assurance — Ahl Al Khair', 'status' => 'ok']);
}

$pdo = db();
$resources = array_keys(SCHEMA);
$r  = $parts[1] ?? '';
$id = $parts[2] ?? null;

try {
    // ---- Authentification -------------------------------------------------
    if ($r === 'login' && $method === 'POST') {
        $b = body();
        $email = trim($b['email'] ?? '');
        $password = (string) ($b['password'] ?? '');
        if ($email === '' || strlen($password) < 4) {
            json_out(['error' => 'Email ou mot de passe incorrect'], 422);
        }
        $st = $pdo->prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
        $st->execute([$email]);
        $u = $st->fetch(PDO::FETCH_ASSOC);
        $role = 'client';
        $user = null;
        if ($u) {
            if (!(int) $u['actif']) json_out(['error' => 'Votre compte a été désactivé, contactez l\'administrateur'], 403);
            $user = row_to_api('users', $u);
            $role = $user['role'];
        } elseif (str_contains($email, 'admin')) $role = 'admin';
        elseif (str_contains($email, 'employe')) $role = 'employe';
        json_out(['token' => 'php-token-' . time(), 'role' => $role, 'email' => $email, 'user' => $user]);
    }

    // ---- État global (utilisé par l'application React) --------------------
    if ($r === 'state' && $method === 'GET') {
        $state = [];
        foreach ($resources as $res) $state[$res] = get_all($pdo, $res);
        json_out($state);
    }
    if ($r === 'state' && $method === 'PUT') {
        $b = body();
        foreach ($resources as $res) {
            if (isset($b[$res]) && is_array($b[$res])) replace_all($pdo, $res, $b[$res]);
        }
        json_out(['ok' => true]);
    }

    // ---- Tableau de bord --------------------------------------------------
    if ($r === 'dashboard' && ($id ?? '') === 'stats' && $method === 'GET') {
        $contrats = get_all($pdo, 'contrats');
        $sinistres = get_all($pdo, 'sinistres');
        $paiements = get_all($pdo, 'paiements');
        json_out([
            'clients_count'    => (int) $pdo->query('SELECT COUNT(*) FROM clients')->fetchColumn(),
            'contrats_actifs'  => count(array_filter($contrats, fn($c) => $c['statut'] === 'actif')),
            'contrats_expires' => count(array_filter($contrats, fn($c) => $c['statut'] === 'expire')),
            'sinistres_ouverts' => count(array_filter($sinistres, fn($s) => !in_array($s['statut'], ['cloture', 'refuse'], true))),
            'revenus_mensuels' => array_sum(array_map(fn($p) => $p['statut'] === 'paye' ? $p['montant'] : 0, $paiements)),
        ]);
    }

    // ---- Réinitialisation -------------------------------------------------
    if ($r === 'reset' && $method === 'POST') {
        $seed = require __DIR__ . '/seed.php';
        foreach ($seed as $table => $items) replace_all($pdo, $table, $items);
        json_out(['ok' => true, 'message' => 'Base réinitialisée.']);
    }

    // ---- REST générique par ressource -------------------------------------
    if (in_array($r, $resources, true)) {
        if ($id === null && $method === 'GET')  json_out(get_all($pdo, $r));
        if ($id === null && $method === 'POST') json_out(insert_one($pdo, $r, body()), 201);
        if ($id !== null && $method === 'GET') {
            $item = find_one($pdo, $r, $id);
            $item ? json_out($item) : json_out(['error' => 'Ressource introuvable'], 404);
        }
        if ($id !== null && $method === 'PUT')    json_out(update_one($pdo, $r, $id, body()));
        if ($id !== null && $method === 'DELETE') { delete_one($pdo, $r, $id); json_out(['ok' => true]); }
    }

    json_out(['error' => 'Route inconnue', 'path' => $path], 404);
} catch (Throwable $e) {
    json_out(['error' => 'Erreur serveur', 'detail' => $e->getMessage()], 500);
}
