<?php
// HOTFIX diagnóstico — remova as 3 linhas abaixo após resolver o problema:
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

$maxSize = 10 * 1024 * 1024; // 10MB
$allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
$uploadDir = __DIR__ . '/imagens';

if (!is_dir($uploadDir)) {
  if (!mkdir($uploadDir, 0775, true)) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'Não foi possível criar a pasta imagens']); exit;
  }
}
if (!is_writable($uploadDir)) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>'A pasta imagens não tem permissão de escrita']); exit;
}

function slugify($s){
  $s = @iconv('UTF-8','ASCII//TRANSLIT',$s);
  $s = strtolower($s);
  $s = preg_replace('/[^a-z0-9]+/','-',$s);
  $s = trim($s,'-');
  return $s ?: 'arquivo';
}
function idDigits($id){ if(preg_match('/#\s?(\d+)/',$id,$m)) return $m[1]; return '00000'; }

$id = $_POST['id'] ?? '';
$artist = $_POST['artist'] ?? '';
$title = $_POST['title'] ?? '';

if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Arquivo não recebido']); exit;
}

$f = $_FILES['file'];
if ($f['size'] <= 0 || $f['size'] > $maxSize) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Tamanho inválido (até 10MB)']); exit;
}

// MIME com fallback
$mime = '';
if (function_exists('mime_content_type')) {
  $mime = @mime_content_type($f['tmp_name']);
} else {
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime = $finfo->file($f['tmp_name']);
}
if (!isset($allowed[$mime])) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Tipo de arquivo não permitido (MIME=' . $mime . ')']); exit;
}
$ext = $allowed[$mime];

$idNum = idDigits($id);
$artistSlug = slugify($artist);
$titleSlug = slugify($title);

$seq = 1;
do {
  $name = sprintf('%s_%s_%s_%02d.%s', $idNum, $artistSlug, $titleSlug, $seq, $ext);
  $target = $uploadDir . '/' . $name;
  $seq++;
} while (file_exists($target));

if (!move_uploaded_file($f['tmp_name'], $target)) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>'Falha ao salvar arquivo (permissão/caminho)']); exit;
}

$url = 'imagens/' . $name;
echo json_encode(['ok'=>true,'url'=>$url]); exit;