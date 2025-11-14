function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function postForm(url, formData) {
  const headers = {
    'X-CSRFToken': getCookie('csrftoken') || ''
  };
  const res = await fetch(url, { method: 'POST', body: formData, headers });
  return res.json();
}

function showFeedback(el, msg, ok=true) {
  if (!el) return; el.innerHTML = '';
  const div = document.createElement('div');
  div.className = ok ? 'alert alert-success' : 'alert alert-danger';
  div.textContent = msg;
  el.appendChild(div);
}

window.addEventListener('DOMContentLoaded', () => {
  // Register
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const feedback = document.getElementById('register-feedback');
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('password', password);
      const data = await postForm('/api/register/', form);
      if (data && data.ok) {
        showFeedback(feedback, 'Cadastro realizado — redirecionando...');
        setTimeout(() => { window.location.href = '/archive/profile/'; }, 900);
      } else {
        showFeedback(feedback, 'Erro: ' + (data.error || 'Erro desconhecido'), false);
      }
    });
  }

  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const feedback = document.getElementById('login-feedback');
      const form = new FormData();
      form.append('email', email);
      form.append('password', password);
      const data = await postForm('/api/login/', form);
      if (data && data.ok) {
        showFeedback(feedback, 'Login bem-sucedido — redirecionando...');
        setTimeout(() => { window.location.href = '/archive/profile/'; }, 700);
      } else {
        showFeedback(feedback, 'Erro: ' + (data.error || 'Credenciais inválidas'), false);
      }
    });
  }
});
