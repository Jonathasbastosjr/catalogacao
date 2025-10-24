<?php
session_start();
if (empty($_SESSION['is_admin'])) { header('Location: login.php'); exit; }
$configFile = __DIR__ . '/config.php';
$config = include $configFile;
if (empty($_SESSION['csrf_token'])) { $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); }
$csrf = $_SESSION['csrf_token'];
$success = ''; $error = '';

function write_config($file, $arr){
  $export = var_export($arr, true);
  $php = "<?php
// config.php — atualizado automaticamente por trocar_senha.php
return " . $export . ";
";
  return file_put_contents($file, $php) !== false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) {
    $error = 'Token CSRF inválido. Recarregue a página.';
  } else {
    $current = $_POST['current_password'] ?? '';
    $newuser = trim($_POST['new_user'] ?? $config['admin_user']);
    $newpass = $_POST['new_password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    if (!password_verify($current, $config['admin_hash'])) {
      $error = 'Senha atual incorreta.';
    } elseif (strlen($newpass) < 6) {
      $error = 'A nova senha deve ter pelo menos 6 caracteres.';
    } elseif ($newpass !== $confirm) {
      $error = 'A confirmação não confere.';
    } else {
      $config['admin_user'] = $newuser or 'admin';
      $config['admin_hash'] = password_hash($newpass, PASSWORD_DEFAULT);
      if (write_config($configFile, $config)) { $success = 'Credenciais atualizadas com sucesso.'; }
      else { $error = 'Não foi possível escrever no config.php. Verifique permissões.'; }
    }
  }
}
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trocar senha (admin)</title><style>body{font-family:system-ui;max-width:480px;margin:8vh auto;padding:20px}form{display:grid;gap:10px}input,button{padding:10px}.msg{padding:10px;border-radius:8px}.ok{background:#eefbea;border:1px solid #b8e3ad}.err{background:#ffefef;border:1px solid #f2c2c2}</style></head><body>
<h2>Trocar senha / usuário (admin)</h2>
<?php if($success){ echo "<p class='msg ok'>$success</p>"; } ?>
<?php if($error){ echo "<p class='msg err'>$error</p>"; } ?>
<form method="post">
<label>Usuário <input type="text" name="new_user" value="<?php echo htmlspecialchars($config['admin_user']); ?>" required></label>
<label>Senha atual <input type="password" name="current_password" required></label>
<label>Nova senha <input type="password" name="new_password" required></label>
<label>Confirmar nova senha <input type="password" name="confirm_password" required></label>
<input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrf); ?>">
<button type="submit">Salvar</button>
<p><a href="index.html">← Voltar ao catálogo</a></p>
</form></body></html>
