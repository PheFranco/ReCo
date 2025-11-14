async function fetchProfile() {
  try {
    const res = await fetch('/api/profile/');
    if (!res.ok) throw new Error('not-auth');
    const data = await res.json();
    const root = document.getElementById('profileContent');
    if (!root) return;
    const u = data.user;
    let html = `
      <div class="meta"><div class="avatar"></div><div><h2>${u.name || u.username}</h2><p style="color:#6b4a3a">${u.email || ''}</p></div></div>
      <section style="margin-top:20px"><h3>Minha conta</h3><p><strong>ID:</strong> ${u.id}</p><p><strong>Usuário:</strong> ${u.username}</p></section>
    `;
    root.innerHTML = html;
  } catch (err) {
    // redirect to login if not authenticated
    window.location.href = '/archive/auth/';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  fetchProfile();
});
