<?php
session_start();
$config = include __DIR__ . '/config.php';
ini_set('session.cookie_httponly', 1);
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') { ini_set('session.cookie_secure', 1); }
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $user = $_POST['username'] ?? '';
  $pass = $_POST['password'] ?? '';
  $okUser = empty($config['admin_user']) || hash_equals($config['admin_user'], $user);
  if ($okUser && password_verify($pass, $config['admin_hash'])) {
    $_SESSION['is_admin'] = true;
    $_SESSION['LAST_ACTIVITY'] = time();
    header('Location: index.html'); exit;
  } else { $error = 'Login ou senha inválidos'; }
}
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login (admin)</title><style>body{font-family:system-ui;max-width:420px;margin:10vh auto;padding:20px}form{display:grid;gap:10px}input,button{padding:10px}</style></head><body>
<h2>Entrar (admin)</h2>
<?php if($error){ echo "<p style='color:#b10000;'>$error</p>"; } ?>
<form method="post">
<label>Usuário <input type="text" name="username" value="<?php echo htmlspecialchars($config['admin_user']); ?>" required></label>
<label>Senha <input type="password" name="password" required></label>
<button type="submit">Entrar</button>
<p><a href="index.html">← Voltar ao catálogo</a></p>
</form></body></html>
