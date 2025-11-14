// Prefer Vite env var VITE_API_URL, fallback para o proxy dev '/api' (Vite server)
const _env: any = typeof import.meta !== "undefined" ? import.meta : {};
// Em desenvolvimento usamos '/api' para aproveitar o proxy definido em vite.config.ts
export const API_BASE = (_env.env && _env.env.VITE_API_URL) || "/api";

// Habilitar mocks locais definindo VITE_USE_MOCKS=true (útil quando o backend não está rodando)
export const USE_MOCKS = (_env.env && _env.env.VITE_USE_MOCKS) === "true" || false;

// Mock simples em memória (apenas para dev)
const _MOCK_ITEMS: any[] = [
  { id: 1, title: "Cadeira", description: "Boa condição", donor: "João", category: "Móveis", location: "Brasília", photo_url: null, status: "disponível", created_at: "now", user_id: "user-1", user_name: "João" },
  { id: 2, title: "Mesa", description: "Pequenas marcas", donor: "Maria", category: "Móveis", location: "Goiânia", photo_url: null, status: "disponível", created_at: "now", user_id: "user-2", user_name: "Maria" },
];
let _MOCK_NEXT_ID = 3;
const _MOCK_PROFILE = { name: "Dev User", email: "dev@example.com", userType: "doador", user_id: "user-abc-1" };

function isNetworkError(err: any) {
  if (!err) return false;
  const msg = String(err || "").toLowerCase();
  return msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("connectionrefused") || msg.includes("network request failed");
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

function csrfHeader() {
  const token = getCookie('csrftoken');
  return token ? { 'X-CSRFToken': token } : {};
}

async function fetchOrMock(fetcher: () => Promise<any>, mocker: () => any) {
  if (USE_MOCKS) {
    return mocker();
  }
  try {
    return await fetcher();
  } catch (err) {
    // Se for erro de rede (backend não iniciado), cair para mock local
    if (isNetworkError(err) || (err && err.status === 0)) {
      console.debug("Fetch falhou, usando mock local:", err);
      return mocker();
    }
    throw err;
  }
}

export async function apiLogin(email: string) {
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, csrfHeader()),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    return res.json();
  }, () => ({ access_token: "fake-token-123", user_id: "user-abc-1" }));
}

export async function apiGetItems() {
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/items`);
    if (!res.ok) throw new Error(`Items fetch failed: ${res.status}`);
    return res.json();
  }, () => ({ items: _MOCK_ITEMS }));
}

export async function apiContact(payload: any) {
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, csrfHeader()),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Contact failed: ${res.status}`);
    return res.json();
  }, () => ({ ok: true, payload }));
}

export async function apiCreateItem(payload: any) {
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, csrfHeader()),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create item failed: ${res.status}`);
    return res.json();
  }, () => {
    const newItem = {
      id: _MOCK_NEXT_ID++,
      title: payload.title,
      description: payload.description,
      donor: 'dev',
      category: payload.category || 'Outros',
      location: payload.location || '',
      photo_url: null,
      status: 'disponível',
      created_at: 'now'
    };
    _MOCK_ITEMS.push(newItem);
    return { ok: true, item: newItem };
  });
}

export async function apiDeleteItem(id: number | string, token?: string) {
  const headers: any = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/items/${id}`, {
      method: "DELETE",
      headers: Object.assign(headers, csrfHeader()),
    });
    if (!res.ok) throw new Error(`Delete item failed: ${res.status}`);
    return res.json();
  }, () => {
    const before = _MOCK_ITEMS.length;
    const idx = _MOCK_ITEMS.findIndex((it) => String(it.id) === String(id));
    if (idx === -1) return { detail: 'Item not found' };
    _MOCK_ITEMS.splice(idx, 1);
    return { ok: true };
  });
}

export async function apiGetProfile(token: string) {
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Get profile failed: ${res.status}`);
    return res.json();
  }, () => ({ profile: _MOCK_PROFILE }));
}

export async function apiUpdateProfile(token: string, payload: any) {
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/profile`, {
      method: "PATCH",
      headers: Object.assign({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }, csrfHeader()),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Update profile failed: ${res.status}`);
    return res.json();
  }, () => {
    if (payload.name) _MOCK_PROFILE.name = payload.name;
    return { ok: true, profile: _MOCK_PROFILE };
  });
}

export async function apiGetMyItems(token: string) {
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/items/my-items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Get my items failed: ${res.status}`);
    return res.json();
  }, () => ({ items: _MOCK_ITEMS.filter((it) => it.donor === 'dev') }));
}

export async function apiPatchItem(id: number | string, token: string | undefined, payload: any) {
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetchOrMock(async () => {
  const res = await fetch(`${API_BASE}/items/${id}`, {
      method: "PATCH",
      headers: Object.assign(headers, csrfHeader()),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Patch item failed: ${res.status}`);
    return res.json();
  }, () => {
    const it = _MOCK_ITEMS.find((m) => String(m.id) === String(id));
    if (!it) return { detail: 'Item not found' };
    Object.assign(it, payload);
    return { ok: true, item: it };
  });
}
