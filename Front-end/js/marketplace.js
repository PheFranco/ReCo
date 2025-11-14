function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function fetchItems(opts={}) {
  const page = opts.page || 1;
  const per_page = opts.per_page || 10;
  const category = opts.category || '';
  const q = opts.q || '';
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('per_page', per_page);
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  const res = await fetch('/api/items/?' + params.toString());
  const data = await res.json();
  const container = document.getElementById('marketplace-items');
  if (!container) return;
  container.innerHTML = '';
  (data.results || []).forEach(item => {
    const card = document.createElement('div');
    card.className = 'col-md-6';
    card.innerHTML = `
      <div class="card mb-3">
        <div class="row g-0">
          <div class="col-4 d-flex align-items-center justify-content-center bg-light">
            <img src="${item.photo_url || '/static/assets/placeholder.png'}" class="img-fluid" alt="" />
          </div>
          <div class="col-8">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text">${item.description}</p>
              <p class="card-text"><small class="text-muted">${item.location} — ${item.user_name}</small></p>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // simple pagination controls
  let pag = document.getElementById('marketplace-pagination');
  if (!pag) {
    pag = document.createElement('div');
    pag.id = 'marketplace-pagination';
    pag.className = 'd-flex justify-content-between align-items-center mt-3';
    container.parentNode.appendChild(pag);
  }
  pag.innerHTML = '';
  const prev = document.createElement('button');
  prev.className = 'btn btn-sm btn-outline-primary';
  prev.textContent = 'Anterior';
  prev.disabled = (data.page <= 1);
  prev.onclick = () => fetchItems({ page: Math.max(1, data.page - 1), per_page, category, q });
  const info = document.createElement('div');
  info.textContent = `Página ${data.page} de ${data.total_pages} — ${data.total_items} itens`;
  const next = document.createElement('button');
  next.className = 'btn btn-sm btn-outline-primary';
  next.textContent = 'Próxima';
  next.disabled = (data.page >= data.total_pages);
  next.onclick = () => fetchItems({ page: Math.min(data.total_pages, data.page + 1), per_page, category, q });
  pag.appendChild(prev);
  pag.appendChild(info);
  pag.appendChild(next);
}

async function createItem() {
  // Open modal handled by Bootstrap; nothing here anymore
}

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('create-item-btn');
  // modal form submit handling
  const createForm = document.getElementById('create-item-form');
  if (createForm) {
    createForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const feedback = document.getElementById('create-item-feedback');
      feedback.innerHTML = '';
      const form = new FormData(createForm);
      const headers = { 'X-CSRFToken': getCookie('csrftoken') || '' };
      const res = await fetch('/api/items/', { method: 'POST', body: form, headers });
      const data = await res.json();
      if (data.ok) {
        const modalEl = document.getElementById('createItemModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        await fetchItems();
      } else {
        const div = document.createElement('div');
        div.className = 'alert alert-danger';
        div.textContent = 'Erro: ' + (data.error || 'unknown');
        feedback.appendChild(div);
      }
    });
  }
  fetchItems();

  // Wire up search and categories
  const search = document.getElementById('mp-search');
  if (search) {
    let tmo = null;
    search.addEventListener('input', () => {
      clearTimeout(tmo);
      tmo = setTimeout(() => fetchItems({ q: search.value.trim(), page: 1 }), 350);
    });
  }
  const cats = document.getElementById('mp-categories');
  if (cats) {
    Array.from(cats.querySelectorAll('[data-cat]')).forEach(a => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const cat = a.getAttribute('data-cat') || '';
        // highlight
        cats.querySelectorAll('.active').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
        fetchItems({ category: cat, page: 1 });
      });
    });
  }
});
