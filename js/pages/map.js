import { restaurants } from '../data/restaurants.js';

const positions = {
  'la-barbecue': { x: 72, y: 62 }, 'via-313': { x: 53, y: 41 },
  'nixta-taqueria': { x: 75, y: 18 }, 'ramen-tatsuya': { x: 45, y: 42 },
  'discada': { x: 48, y: 58 }, 'joes-bakery': { x: 68, y: 32 },
  'juan-in-a-million': { x: 70, y: 60 }, 'el-pollo-rey': { x: 66, y: 60 },
  'buenos-aires-cafe': { x: 32, y: 42 }, 'tamale-house-east': { x: 50, y: 40 },
  'revelry': { x: 40, y: 42 }, 'oko': { x: 36, y: 42 },
  'li-neighborhood': { x: 56, y: 38 }, 'cenote': { x: 25, y: 58 },
  'paperboy': { x: 33, y: 43 }, 'veracruz-all-natural': { x: 49, y: 57 },
  'pueblo-viejo': { x: 44, y: 58 }, 'salt-and-time': { x: 58, y: 33 },
  'counter-cafe': { x: 12, y: 40 }, 'eastside-king': { x: 47, y: 41 },
  'patrizis': { x: 68, y: 28 }, 'sour-duck-market': { x: 55, y: 15 },
  'cuantos-tacos': { x: 30, y: 20 }, 'buzz-mill': { x: 42, y: 52 },
  'flyrite': { x: 42, y: 58 }, 'mi-madre': { x: 65, y: 28 },
  'swedish-hill': { x: 32, y: 22 }, 'vacancy-brewing': { x: 18, y: 48 },
  'p-terrys': { x: 10, y: 60 }, 'torchys-tacos': { x: 14, y: 68 },
  'tacodeli': { x: 8, y: 72 }, 'chilantro': { x: 16, y: 70 },
  'taquero-mucho': { x: 17, y: 71 }, 'halal-bros': { x: 73, y: 60 },
  'pho-phong-luu': { x: 92, y: 8 }, 'tumble-22': { x: 44, y: 40 },
  'whataburger': { x: 22, y: 56 }, 'raising-canes': { x: 20, y: 74 },
  'bouldin-creek-cafe': { x: 12, y: 72 }, 'rositas-al-pastor': { x: 58, y: 32 },
  'popeyes': { x: 30, y: 34 }, 'phoebe': { x: 10, y: 10 },
  'con-todo': { x: 62, y: 58 }, 'little-deli': { x: 90, y: 5 },
  'seoulju': { x: 72, y: 58 },
  'wow-poke': { x: 24, y: 56 },
  'clay-pit': { x: 10, y: 35 }, 'bombay-dhaba': { x: 64, y: 58 },
  'pupuseria-chapina': { x: 60, y: 32 }, 'arpeggio-grill': { x: 88, y: 12 },
  'pluckers': { x: 8, y: 30 }, 'loro-south-lamar': { x: 32, y: 32 },
  'quality-seafood': { x: 85, y: 15 }, 'thundercloud-subs': { x: 12, y: 44 },
  'which-wich': { x: 56, y: 15 }, 'taste-of-ethiopia': { x: 94, y: 5 },
  'shanghai-noodle': { x: 92, y: 3 }, 'ms-ps': { x: 57, y: 18 },
  'cuantos-tacos-2': { x: 50, y: 33 }, 'santis-ices': { x: 66, y: 58 },
  'the-league': { x: 16, y: 55 },
};

export function render() {
  return `
    <div class="page-header">
      <h1>Map Explorer</h1>
      <p>Browse restaurants near 501 Pedernales St</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
    </div>

    <div id="map-step-1">
      <div class="filter-chips mb-4">
        <button class="chip selected" data-filter="all">All</button>
        <button class="chip" data-filter="9">Under $9</button>
        <button class="chip" data-filter="12">Under $12</button>
        <button class="chip" data-filter="15">Under $15</button>
      </div>

      <div style="position:relative;max-width:780px;margin:0 auto;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:4/3;">
        <svg width="100%" height="100%" viewBox="0 0 100 75" style="position:absolute;top:0;left:0;">
          <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border)" stroke-width="0.3" />
          <line x1="0" y1="35" x2="100" y2="35" stroke="var(--border)" stroke-width="0.3" />
          <line x1="0" y1="42" x2="100" y2="42" stroke="var(--border-light)" stroke-width="0.6" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" stroke-width="0.3" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="var(--border-light)" stroke-width="0.5" />
          <line x1="20" y1="0" x2="20" y2="75" stroke="var(--border)" stroke-width="0.3" />
          <line x1="35" y1="0" x2="35" y2="75" stroke="var(--border)" stroke-width="0.3" />
          <line x1="50" y1="0" x2="50" y2="75" stroke="var(--border)" stroke-width="0.3" />
          <line x1="65" y1="0" x2="65" y2="75" stroke="var(--border)" stroke-width="0.3" />
          <line x1="80" y1="0" x2="80" y2="75" stroke="var(--border)" stroke-width="0.3" />
          <text x="2" y="41" font-size="2.2" fill="#555" font-family="Inter, sans-serif">E 6th St</text>
          <text x="2" y="59" font-size="2.2" fill="#555" font-family="Inter, sans-serif">E Cesar Chavez</text>
          <text x="2" y="19" font-size="2.2" fill="#555" font-family="Inter, sans-serif">E 12th St</text>
          <rect x="28" y="48" width="4" height="4" rx="1" fill="var(--accent)" opacity="0.8"/>
          <text x="30" y="55" font-size="2.4" fill="var(--accent)" text-anchor="middle" font-weight="bold" font-family="Inter, sans-serif">OFFICE</text>
        </svg>

        <div id="map-pins" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>
        <div id="map-tooltip" class="hidden" style="position:absolute;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;box-shadow:var(--shadow-lg);z-index:10;pointer-events:none;min-width:180px;"></div>
      </div>
      <p class="text-center mt-2" style="color:var(--text-muted);font-size:12px;">Click a pin to select</p>
    </div>

    <div id="map-step-2" class="hidden">
      <div id="map-result"></div>
      <div class="text-center mt-4">
        <button class="btn btn-outline" id="map-back">Back to Map</button>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
  `;
}

export function init(container) {
  let currentFilter = 'all';

  function renderPins() {
    const pinsContainer = container.querySelector('#map-pins');
    pinsContainer.innerHTML = '';

    restaurants.forEach(r => {
      const pos = positions[r.id];
      if (!pos) return;
      if (currentFilter !== 'all' && r.price > parseInt(currentFilter)) return;

      const color = app.getCuisineColor(r.cuisine);
      const pin = document.createElement('div');
      pin.dataset.id = r.id;
      pin.style.cssText = `
        position:absolute;left:${pos.x}%;top:${pos.y}%;transform:translate(-50%,-50%);
        width:18px;height:18px;border-radius:50%;background:${color};cursor:pointer;
        transition:transform 0.15s;z-index:5;border:2px solid var(--bg-elevated);
        font-size:8px;display:flex;align-items:center;justify-content:center;
        font-weight:800;color:#000;
      `;
      pin.textContent = r.name.charAt(0);

      pin.addEventListener('mouseenter', () => {
        pin.style.transform = 'translate(-50%,-50%) scale(1.6)';
        pin.style.zIndex = '20';
        const tooltip = container.querySelector('#map-tooltip');
        tooltip.classList.remove('hidden');
        tooltip.innerHTML = `
          <p style="font-weight:700;font-size:13px;">${r.name}</p>
          <p style="font-size:12px;color:var(--text-muted);">${r.cuisine} / $${r.price} / ${r.walkMinutes}min</p>
        `;
        tooltip.style.left = `${Math.min(pos.x + 3, 70)}%`;
        tooltip.style.top = `${Math.max(pos.y - 12, 5)}%`;
      });

      pin.addEventListener('mouseleave', () => {
        pin.style.transform = 'translate(-50%,-50%)';
        pin.style.zIndex = '5';
        container.querySelector('#map-tooltip').classList.add('hidden');
      });

      pin.addEventListener('click', () => {
        app.saveHistory(r); app.confetti(); setStep(2);
        container.querySelector('#map-result').innerHTML = app.renderResultCard(r);
      });

      pinsContainer.appendChild(pin);
    });
  }

  container.querySelectorAll('[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      currentFilter = chip.dataset.filter;
      renderPins();
    });
  });

  container.querySelector('#map-back')?.addEventListener('click', () => setStep(1));
  renderPins();

  function setStep(n) {
    [1, 2].forEach(s => {
      container.querySelector(`#map-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n); dot.classList.toggle('done', s < n);
    });
  }
}
