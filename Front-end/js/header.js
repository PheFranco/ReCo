// header.js — lógica unificada do cabeçalho e menu
(function(){
  function onReady(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  onReady(function(){
    const nav = document.querySelector('header nav');
    if(!nav) return;
    const ul = nav.querySelector('ul');

    // resolve href for anchors to point to index sections when appropriate
    function baseForAnchor(){
      const p = location.pathname.split('/').filter(Boolean).pop() || '';
      return (p === '' || p === 'index.html') ? '' : 'index.html';
    }
    function anchorHref(id){
      const base = baseForAnchor();
      return base ? base + '#' + id : '#' + id;
    }

    // normalize existing nav links to point to app sections/pages
    ul.querySelectorAll('a').forEach(a => {
      const t = (a.textContent||'').trim().toLowerCase();
      if(t.includes('sobre') || t.includes('início') || t.includes('inicio')){
        a.href = anchorHref('hero');
      } else if(t.includes('números') || t.includes('numeros')){
        a.href = anchorHref('numbers');
      } else if(t.includes('contato')){
        a.href = anchorHref('contact');
      } else if(t.includes('market') || t.includes('itens')){
        a.href = 'marketplace.html';
      } else if(t.includes('entrar') || t.includes('acessar')){
        a.href = 'login.html';
      }
    });

    // create account dropdown when logged
    const token = localStorage.getItem('reco_token');
    const isLogged = !!token;

    // hide the public "Acesse" control when logged in, show when not
    const accessBlock = nav.querySelector('.dropdown');
    if(accessBlock){
      accessBlock.style.display = isLogged ? 'none' : '';
    }

    function createDropdown(){
      const li = document.createElement('li');
      li.style.position = 'relative';
      li.style.listStyle = 'none';
      const role = localStorage.getItem('reco_role') || '';
      const minhasLink = role === 'doador' ? '<a href="minhas-doacoes.html" style="display:block;padding:8px 12px;color:inherit;text-decoration:none">Minhas doações</a>' : '';
      li.innerHTML = '<button id="userTrigger" class="btn">Minha conta ▾</button>' +
        '<div id="userMenu" style="display:none;position:absolute;right:0;top:calc(100% + 8px);background:white;border:1px solid #eee;border-radius:8px;padding:6px 6px;min-width:180px;box-shadow:0 8px 24px rgba(0,0,0,0.08);z-index:1000">' +
        '<a href="profile.html" style="display:block;padding:8px 12px;color:inherit;text-decoration:none">Perfil</a>' +
        minhasLink +
        '<a href="chat.html" style="display:block;padding:8px 12px;color:inherit;text-decoration:none">Chats</a>' +
        '<a href="marketplace.html" style="display:block;padding:8px 12px;color:inherit;text-decoration:none">Marketplace</a>' +
        '<hr style="margin:8px 0;border:none;border-top:1px solid #f3f2f0" />' +
        '<a href="login.html" id="logoutLink" style="display:block;padding:8px 12px;color:#b91c1c;text-decoration:none">Sair</a>' +
        '</div>';
      return li;
    }

    if(isLogged){
      // guard
      if(ul.querySelector('#userTrigger')) return;
      // remove Entrar anchors
      ul.querySelectorAll('a').forEach(a => {
        const t = (a.textContent||'').trim().toLowerCase();
        if(t === 'entrar' || t === 'sair' || t === 'acessar'){
          const p = a.parentElement; if(p) p.remove();
        }
      });
      const dd = createDropdown();
      ul.appendChild(dd);
      const trigger = dd.querySelector('#userTrigger');
      const menu = dd.querySelector('#userMenu');
      trigger.addEventListener('click', ()=> menu.style.display = menu.style.display === 'none' ? 'block' : 'none');
      document.addEventListener('click', (e)=> { if(!dd.contains(e.target)) menu.style.display = 'none'; });
      const logout = dd.querySelector('#logoutLink');
      logout.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('reco_token'); localStorage.removeItem('reco_userId'); localStorage.removeItem('reco_role'); window.location.href = 'login.html'; });
    }
  });
})();
