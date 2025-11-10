const API_BASE = process.env.API_BASE || 'http://localhost:8000';

async function check() {
  try {
    console.log(`Checking ${API_BASE}/api/health ...`);
    const h = await fetch(`${API_BASE}/api/health`);
    if (!h.ok) throw new Error(`Health returned ${h.status}`);
    const hjson = await h.json();
    console.log('Health OK:', hjson);

    console.log(`Checking ${API_BASE}/api/items ...`);
    const items = await fetch(`${API_BASE}/api/items`);
    if (!items.ok) throw new Error(`Items returned ${items.status}`);
    const itemsJson = await items.json();
    console.log('Items OK:', itemsJson);

    console.log('\nAll checks passed');
    process.exit(0);
  } catch (err) {
    console.error('\nCheck failed:', err.message || err);
    process.exit(2);
  }
}

check();
