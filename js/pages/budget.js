import { restaurants } from '../data/restaurants.js';

export function render() {
  return `
    <div class="page-header">
      <h1>Budget Slider</h1>
      <p>Slide to your budget and discover what's in range</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
    </div>

    <div id="budget-step-1">
      <div class="budget-slider-wrap">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:8px;">
          <span>Broke until payday</span>
          <span>Feeling generous</span>
        </div>
        <input type="range" class="budget-slider" id="budget-range" min="5" max="18" step="1" value="12">
        <div class="budget-display" id="budget-display">$12</div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
          <span>$5</span><span>$8</span><span>$10</span><span>$12</span><span>$15</span><span>$18</span>
        </div>
      </div>
      <p class="text-center mb-2" style="font-size:14px;color:var(--text-secondary);" id="budget-count"></p>

      <p class="text-center" style="color:var(--text-muted);margin-bottom:12px;font-size:13px;">Walk time:</p>
      <div class="filter-chips">
        <button class="chip selected" data-walk="99">Any distance</button>
        <button class="chip" data-walk="8">Under 8 min</button>
        <button class="chip" data-walk="15">Under 15 min</button>
      </div>

      <div class="text-center mt-4">
        <button class="btn btn-primary btn-lg" id="budget-go">Show Restaurants</button>
      </div>
    </div>

    <div id="budget-step-2" class="hidden">
      <div id="budget-list"></div>
      <div class="text-center mt-4">
        <button class="btn btn-outline" id="budget-back">Adjust Budget</button>
      </div>
    </div>

    <div id="budget-step-3" class="hidden">
      <div id="budget-result"></div>
      <div class="text-center mt-4">
        <button class="btn btn-outline" id="budget-relist">Back to List</button>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
  `;
}

export function init(container) {
  let maxPrice = 12;
  let maxWalk = 99;

  const slider = container.querySelector('#budget-range');
  const display = container.querySelector('#budget-display');
  const countEl = container.querySelector('#budget-count');

  function updateDisplay() {
    display.textContent = `$${maxPrice}`;
    const count = restaurants.filter(r => r.price <= maxPrice && r.walkMinutes <= maxWalk).length;
    countEl.textContent = `${count} restaurant${count !== 1 ? 's' : ''} in budget`;
  }
  updateDisplay();

  slider.addEventListener('input', () => { maxPrice = parseInt(slider.value); updateDisplay(); });

  container.querySelectorAll('[data-walk]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('[data-walk]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      maxWalk = parseInt(chip.dataset.walk);
      updateDisplay();
    });
  });

  container.querySelector('#budget-go').addEventListener('click', () => {
    showList(restaurants.filter(r => r.price <= maxPrice && r.walkMinutes <= maxWalk));
    setStep(2);
  });

  container.querySelector('#budget-back').addEventListener('click', () => setStep(1));
  container.querySelector('#budget-relist').addEventListener('click', () => setStep(2));

  function showList(filtered) {
    const list = container.querySelector('#budget-list');
    if (filtered.length === 0) {
      list.innerHTML = `<div class="text-center"><h2>No matches</h2><p style="color:var(--text-muted);margin-top:8px;">Try increasing your budget or walk distance.</p></div>`;
      return;
    }
    const sorted = [...filtered].sort((a, b) => a.price - b.price);
    list.innerHTML = `
      <p class="text-center mb-4" style="color:var(--text-muted);font-size:14px;">${sorted.length} restaurants under $${maxPrice}</p>
      <div class="home-grid">
        ${sorted.map(r => {
          const color = app.getCuisineColor(r.cuisine);
          return `
          <div class="home-card budget-pick" data-id="${r.id}" style="text-align:center;">
            <div style="width:32px;height:32px;border-radius:8px;background:${color}20;color:${color};display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;margin-bottom:8px;">${r.name.charAt(0)}</div>
            <h3>${r.name}</h3>
            <p style="color:var(--text-muted);font-size:13px;">${r.cuisine} / $${r.price} / ${r.walkMinutes}min</p>
          </div>`;
        }).join('')}
      </div>`;

    list.querySelectorAll('.budget-pick').forEach(card => {
      card.addEventListener('click', () => {
        const r = restaurants.find(r => r.id === card.dataset.id);
        if (r) { app.saveHistory(r); app.confetti(); setStep(3); container.querySelector('#budget-result').innerHTML = app.renderResultCard(r); }
      });
    });
  }

  function setStep(n) {
    [1, 2, 3].forEach(s => {
      container.querySelector(`#budget-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n);
      dot.classList.toggle('done', s < n);
    });
  }
}
