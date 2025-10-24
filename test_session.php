<?php
session_start();
if(!isset($_SESSION['tick'])) $_SESSION['tick']=0;
$_SESSION['tick']++;
header('Content-Type: text/plain; charset=utf-8');
echo "Sessão OK. Tick=" . $_SESSION['tick'];