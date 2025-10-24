<?php
session_start();
$config = include __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
$timeout = (int)($config['session_timeout_minutes'] ?? 60) * 60;
if (!empty($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > $timeout)) {
  session_unset(); session_destroy(); echo json_encode(['is_admin'=>false, 'expired'=>true]); exit;
}
if (!empty($_SESSION['is_admin'])) { $_SESSION['LAST_ACTIVITY'] = time(); echo json_encode(['is_admin'=>true]); exit; }
echo json_encode(['is_admin'=>false]);
