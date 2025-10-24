HOTFIX v7.1 — Upload com diagnóstico (Safari/JSON)

Arquivos incluídos para substituir no seu servidor:
1) cadastrar.js — patch de diagnóstico: lê resposta do upload como texto e tenta parsear JSON; mostra o erro real do servidor.
2) upload.php — patch com fallback de MIME e mensagens JSON claras; erros ativados TEMPORARIAMENTE.
3) diagnostico.php — testa escrita na pasta imagens/.
4) test_session.php — testa persistência de sessão PHP.

Como aplicar:
- Suba estes arquivos para a mesma pasta do seu catálogo (substitua cadastrar.js e upload.php).
- Garanta permissão de escrita em imagens/: chmod 775 imagens (ou via painel).
- (Opcional) Ajuste upload_max_filesize/post_max_size para >=10M no PHP do host.

Como testar rapidamente:
1) Abra diagnostico.php — deve dizer SIM/SIM/SIM.
2) Abra test_session.php — recarregue e veja o contador subir (Sessão OK. Tick=1, 2, 3…).
3) Em cadastrar.html, selecione uma imagem e clique em Salvar.
   - Se algo falhar, o alerta mostrará a mensagem exata (inclusive se o servidor devolveu HTML).
4) Depois que tudo estiver OK, edite upload.php e REMOVA as 3 linhas de display_errors no topo.
