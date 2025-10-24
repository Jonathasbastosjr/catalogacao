<?php
// config.php — credenciais do admin e opções (padrão). Troque pela interface "Trocar senha".
return [
  'admin_user' => 'admin',
  // hash gerado em runtime para '12345' na primeira execução de login.php (se reescrevido por trocar_senha.php)
  'admin_hash' => password_hash('12345', PASSWORD_DEFAULT),
  'session_timeout_minutes' => 60,
];
