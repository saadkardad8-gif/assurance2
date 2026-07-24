<?php
// ============================================================
//  Configuration du backend PHP — Wafa Assurance Ahl Al Khair
//  Par défaut : SQLite (aucune installation, base créée automatiquement).
//  Pour utiliser MySQL (cahier des charges), mettez 'driver' => 'mysql'
//  ou définissez la variable d'environnement DB_DRIVER=mysql.
// ============================================================
return [
    'driver' => getenv('DB_DRIVER') ?: 'sqlite',   // 'sqlite' ou 'mysql'

    'sqlite' => [
        'path' => __DIR__ . '/data.sqlite',
    ],

    'mysql' => [
        'host'     => getenv('DB_HOST') ?: '127.0.0.1',
        'port'     => getenv('DB_PORT') ?: '3306',
        'database' => getenv('DB_NAME') ?: 'gestion_assurance',
        'username' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASS') ?: '',
    ],
];
