// tree-controls.js
// Injects a small UI to preview tree variants and toggle Auto/Vibrant/Pastel.
document.addEventListener('DOMContentLoaded', function () {
  const img = document.getElementById('hero-tree') || document.querySelector('.hero-illustration.tree-overlay');
  if (!img) return;

  // create controls container
  const controls = document.createElement('div');
  controls.className = 'tree-controls';
  controls.style.cssText = 'position:fixed; right:18px; bottom:18px; background:rgba(255,255,255,0.92); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.08); padding:8px; z-index:1200; font-family:Inter, sans-serif;';

  const label = document.createElement('div');
  label.textContent = 'Árvore';
  label.style.cssText = 'font-weight:600; margin-bottom:6px; font-size:13px; color:#2e231c';
  controls.appendChild(label);

  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.gap = '6px';

  function makeBtn(text, id) {
    const b = document.createElement('button');
    b.textContent = text;
    b.dataset.variant = id;
    b.style.cssText = 'background:#fff; border:1px solid #eee; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:13px; color:#2e231c';
    b.addEventListener('mouseenter', () => b.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)');
    b.addEventListener('mouseleave', () => b.style.boxShadow = 'none');
    return b;
  }

  const autoB = makeBtn('Auto', 'auto');
  const vibB = makeBtn('Vibrant', 'vibrant');
  const pasB = makeBtn('Pastel', 'pastel');
  const reaB = makeBtn('Realistic', 'realistic');

  buttons.appendChild(autoB);
  buttons.appendChild(vibB);
  buttons.appendChild(pasB);
  buttons.appendChild(reaB);
  controls.appendChild(buttons);

  // add a small note
  const note = document.createElement('div');
  note.textContent = 'Preview';
  note.style.cssText = 'font-size:11px; color:#6b6b6b; margin-top:6px;';
  controls.appendChild(note);

  document.body.appendChild(controls);

  // helper to change variant with cross-fade
  function changeVariant(variant) {
  const vibrant = '../style/assets/tree-vibrant.svg';
  const pastel = '../style/assets/tree-pastel.svg';
  const realistic = '../style/assets/tree-realistic.svg';
    const auto = 'auto';
    let src;
    if (variant === 'vibrant') src = vibrant;
    else if (variant === 'pastel') src = pastel;
    else if (variant === 'realistic') src = realistic;
    else if (variant === 'auto') {
      const h = new Date().getHours();
      src = (h >= 6 && h < 18) ? vibrant : pastel;
    }

    if (!src) return;

    // fade out, switch src, then fade in
    // ensure visible
    img.style.display = 'block';
    img.style.opacity = '0';
    setTimeout(() => {
      img.setAttribute('src', src);
      // ensure image loaded before fade in
      img.onload = () => { img.style.opacity = '1'; img.style.display = 'block'; };
      // fallback if onload not triggered quickly
      setTimeout(() => { img.style.opacity = '1'; img.style.display = 'block'; }, 400);
    }, 200);
  }

  // click handlers
  autoB.addEventListener('click', () => { changeVariant('auto'); localStorage.removeItem('reco_tree_variant'); });
  vibB.addEventListener('click', () => { changeVariant('vibrant'); localStorage.setItem('reco_tree_variant', 'vibrant'); });
  pasB.addEventListener('click', () => { changeVariant('pastel'); localStorage.setItem('reco_tree_variant', 'pastel'); });
  reaB.addEventListener('click', () => { changeVariant('realistic'); localStorage.setItem('reco_tree_variant', 'realistic'); });

  // initialize from localStorage or auto
  const stored = localStorage.getItem('reco_tree_variant');
  const currentSrc = (img.getAttribute('src') || '').toLowerCase();
  // If the page already shows the realistic image and user didn't choose a variant, respect it.
  if (!stored && currentSrc.includes('tree-realistic')) {
    // do nothing, user (or page) already set realistic image
  } else if (stored === 'vibrant' || stored === 'pastel' || stored === 'realistic') {
    changeVariant(stored);
  } else {
    changeVariant('auto');
  }
});
