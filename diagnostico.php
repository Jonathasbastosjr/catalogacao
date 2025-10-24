<?php
$dir = __DIR__ . '/imagens';
$okDir = is_dir($dir);
$okWritable = is_writable($dir);
$file = $dir . '/teste_escrita.txt';
$wrote = @file_put_contents($file, "ok ".date('c'));

header('Content-Type: text/plain; charset=utf-8');
echo "Existe imagens/: " . ($okDir?'SIM':'NÃO') . PHP_EOL;
echo "Pode escrever em imagens/: " . ($okWritable?'SIM':'NÃO') . PHP_EOL;
echo "Conseguiu criar teste_escrita.txt: " . ($wrote!==false?'SIM':'NÃO') . PHP_EOL;
