<?php
header('Content-Type: text/plain; charset=utf-8');
$dir = __DIR__ . '/imagens';
$okDir = is_dir($dir);
$okWritable = is_writable($dir);
$file = $dir . '/teste_escrita.txt';
$wrote = @file_put_contents($file, "ok ".date('c'));

echo "Existe imagens/: " . ($okDir?'SIM':'NÃO') . PHP_EOL;
echo "Pode escrever em imagens/: " . ($okWritable?'SIM':'NÃO') . PHP_EOL;
echo "Conseguiu criar teste_escrita.txt: " . ($wrote!==false?'SIM':'NÃO') . PHP_EOL;
if ($wrote === false) {
  echo "Obs: verifique permissões (chmod 775 imagens) e dono do processo web (chown -R www-data:www-data imagens)." . PHP_EOL;
}