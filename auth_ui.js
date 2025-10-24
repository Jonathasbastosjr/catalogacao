// auth_ui.js — mostra/oculta botões admin conforme sessão
(async function(){
  try{
    const r = await fetch('auth_check.php', {cache:'no-store'});
    const data = await r.json();
    const isAdmin = !!data?.is_admin;

    const adminOnly = document.querySelectorAll('.adminOnly');
    adminOnly.forEach(el => { el.style.display = isAdmin ? '' : 'none'; });

    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const btnChangePwd = document.getElementById('btnChangePwd');

    if(isAdmin){
      if(btnLogin){ btnLogin.style.display='none'; }
      if(btnLogout){ btnLogout.style.display=''; }
      if(btnChangePwd){ btnChangePwd.style.display=''; }
    }else{
      if(btnLogout){ btnLogout.style.display='none'; }
      if(btnChangePwd){ btnChangePwd.style.display='none'; }
      if(btnLogin){ btnLogin.style.display=''; }
    }
  }catch(e){
    console.warn('Falha ao checar auth:', e);
  }
})();