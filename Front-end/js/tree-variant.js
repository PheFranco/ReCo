// tree-variant.js — controla ciclo do sol/sombra (8h → 18h) e cores da página
// Este script atualiza CSS variables na página para posicionar a sombra (pseudo-elemento)
// na direção oposta ao sol e também interpola a cor do fundo conforme o horário.

(function(){
  function clamp(v, a, b){ return Math.min(b, Math.max(a, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }
  function hexToRgb(hex){
    hex = hex.replace('#','');
    if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex,16);
    return [(n>>16)&255, (n>>8)&255, n&255];
  }
  function rgbToHex(r,g,b){
    return '#'+[r,g,b].map(v=>{ const s = Math.round(v).toString(16); return s.length===1?'0'+s:s; }).join('');
  }
  function mixColor(aHex,bHex,t){
    const a = hexToRgb(aHex), b = hexToRgb(bHex);
    return rgbToHex( lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t) );
  }

  function getDayProgress(now){
    // map 8:00 -> 0, 18:00 -> 1
    const start = 8, end = 18;
    const h = now.getHours();
    const m = now.getMinutes();
    const value = h + m/60;
    return clamp((value - start)/(end - start), 0, 1);
  }

  function updateCycle(){
    const now = new Date();
    const t = getDayProgress(now); // 0..1

  // sun moves from right (30%) at 8:00 to left (-30%) at 18:00 (not directly used)
  const sunPos = lerp(30, -30, t); // percent

  // Shadow directional movement: we want the shadow to travel right -> left across the
  // area near the tree (not to the page corners). Increase offset range so movement is
  // more visible but still stays near the tree (20% -> -20%).
  const shadowX = lerp(20, -20, t);

  // Compute a noonFactor that is 1 at noon and 0 at the edges (8:00 / 18:00).
  // We'll use this to make shadows longest/strongest near sunrise/sunset and
  // shortest/softest at noon.
  const noonFactor = 1 - Math.abs(t - 0.5) * 2; // 0 at edges, 1 at noon

  // shadow scale: larger at edges (low sun), smaller at noon
  const shadowScale = lerp(1.25, 0.9, noonFactor);
  const shadowOpacity = lerp(0.95, 0.6, noonFactor);

    // apply to all wrappers
    document.querySelectorAll('.ipe-wrapper').forEach(w => {
      w.style.setProperty('--shadow-x', shadowX + '%');
      w.style.setProperty('--shadow-scale', shadowScale);
      w.style.setProperty('--shadow-opacity', shadowOpacity);
      // ambient shadow: subtle, always present; slightly stronger near sunrise/sunset
      const ambientScale = lerp(1.0, 1.08, 1 - Math.abs(t - 0.5));
      const ambientOpacity = lerp(0.6, 0.8, 1 - Math.abs(t - 0.5));
      w.style.setProperty('--ambient-scale', ambientScale);
      w.style.setProperty('--ambient-opacity', ambientOpacity);
    });

    // page/background color interpolation: morning -> day -> evening
    // define three anchors
  // realistic-inspired anchors: warmer colors when sun is low (more orange/yellow)
  const morning = '#fff4d1'; // soft warm morning (yellow-ish)
  const noon = '#f7fbff';    // bright midday (very light blue/white)
  const evening = '#ffd6b3'; // warm evening (orange/pink)

    // Use a two-segment interpolation: 0..0.5 -> morning->noon, 0.5..1 -> noon->evening
    let bgColor;
    if(t <= 0.5){
      bgColor = mixColor(morning, noon, t/0.5);
    } else {
      bgColor = mixColor(noon, evening, (t-0.5)/0.5);
    }

    // update CSS root variables used by page
    document.documentElement.style.setProperty('--bg-cream', bgColor);

    // additional accent tuning (slightly desaturate at evening)
    const accentMorning = '#c5662b';
    const accentEvening = '#b45826';
    const accent = mixColor(accentMorning, accentEvening, t);
    document.documentElement.style.setProperty('--accent', accent);
  }

  // init and update every minute (and on visibility change)
  document.addEventListener('DOMContentLoaded', function(){
    updateCycle();
    // update every 30 seconds to keep in sync with minutes
    setInterval(updateCycle, 30*1000);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) updateCycle(); });
  });

})();
