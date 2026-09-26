(() => {
  const API = '/api/auth';
  const TOKEN_KEY = 'auth_token';
  const USER_KEY = 'auth_usuario';

  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const getUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };
  const token = () => localStorage.getItem(TOKEN_KEY);
  const saveSession = (data) => { localStorage.setItem(TOKEN_KEY, data.token); localStorage.setItem(USER_KEY, JSON.stringify(data.usuario)); };
  const clearSession = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); };

  function renderActions() {
    const host = document.querySelector('[data-auth-actions]');
    if (!host) return;
    const u = getUser();
    host.classList.add('auth-actions');
    host.innerHTML = u ? `<span class="auth-user">Hola, ${esc(u.nombres)}</span><button class="auth-btn auth-secondary" data-auth-logout>Cerrar sesión</button>` : `<button class="auth-btn auth-secondary" data-auth-open="login">Ingresar</button><button class="auth-btn auth-primary" data-auth-open="registro">Registrarse</button>`;
  }

  function modalHTML() { return `<div class="auth-modal" data-auth-modal hidden><section class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button class="auth-close" data-auth-close aria-label="Cerrar">&times;</button><h2 id="auth-title">Ingresar</h2><form class="auth-form" data-auth-form><div data-registro-fields hidden><label>Nombres<input name="nombres" autocomplete="given-name"></label><label>Apellidos<input name="apellidos" autocomplete="family-name"></label></div><label>Correo<input name="correo" type="email" autocomplete="email" required></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" minlength="8" required></label><div class="auth-error" data-auth-error role="alert"></div><button class="auth-btn auth-primary" type="submit">Continuar</button></form><p class="auth-switch"><span data-auth-switch-text></span> <button class="auth-link" data-auth-switch type="button"></button></p></section></div>`; }

  let mode = 'login';
  function setMode(next) {
    mode = next; const modal=document.querySelector('[data-auth-modal]'); if(!modal)return;
    const reg = mode==='registro';
    modal.querySelector('#auth-title').textContent = reg ? 'Crear cuenta' : 'Ingresar';
    modal.querySelector('[data-registro-fields]').hidden = !reg;
    modal.querySelector('[name=nombres]').required = reg; modal.querySelector('[name=apellidos]').required = reg;
    modal.querySelector('[name=password]').autocomplete = reg ? 'new-password' : 'current-password';
    modal.querySelector('[data-auth-switch-text]').textContent = reg ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
    modal.querySelector('[data-auth-switch]').textContent = reg ? 'Ingresar' : 'Registrarse';
    modal.querySelector('[data-auth-error]').textContent='';
  }

  async function submit(form) {
    const fd=new FormData(form); const body=Object.fromEntries(fd.entries());
    if(mode==='login'){ delete body.nombres; delete body.apellidos; }
    const error=form.querySelector('[data-auth-error]'); error.textContent='';
    try {
      const r=await fetch(`${API}/${mode}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await r.json(); if(!r.ok) throw new Error(data.mensaje || 'No se pudo completar la operación');
      saveSession(data); document.querySelector('[data-auth-modal]').hidden=true; renderActions();
      window.dispatchEvent(new CustomEvent('auth:change',{detail:data.usuario}));
    } catch(e){ error.textContent=e.message; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', modalHTML()); renderActions();
    document.addEventListener('click', e => {
      const open=e.target.closest('[data-auth-open]'); if(open){setMode(open.dataset.authOpen);document.querySelector('[data-auth-modal]').hidden=false;}
      if(e.target.closest('[data-auth-close]')) document.querySelector('[data-auth-modal]').hidden=true;
      if(e.target.closest('[data-auth-switch]')) setMode(mode==='login'?'registro':'login');
      if(e.target.closest('[data-auth-logout]')){clearSession();renderActions();window.dispatchEvent(new CustomEvent('auth:change',{detail:null}));}
    });
    document.querySelector('[data-auth-form]').addEventListener('submit', e=>{e.preventDefault();submit(e.currentTarget);});
  });

  window.Auth = {
    getToken: token, getUser, logout: () => { clearSession(); renderActions(); },
    fetch: (url, options={}) => fetch(url,{...options,headers:{...(options.headers||{}),Authorization:`Bearer ${token()}`}})
  };
})();
