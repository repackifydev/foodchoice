import { restaurants, cuisines } from '../data/restaurants.js';

export function render() {
  const uniqueCuisines = cuisines.slice(0, 6);
  const prices = ['<$9', '<$10', '<$12', '<$15', '<$18', 'Any $'];

  return `
    <div class="page-header">
      <h1>Dice Roll</h1>
      <p>Roll two dice: one for cuisine, one for budget</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
    </div>

    <div id="dice-step-1" class="text-center">
      <p style="color:var(--text-muted);margin-bottom:16px;font-size:14px;">Ready to roll?</p>
      <div style="display:flex;gap:40px;justify-content:center;align-items:center;flex-wrap:wrap;">
        <div>
          <p style="font-weight:600;margin-bottom:4px;font-size:13px;color:var(--text-secondary);">Cuisine</p>
          <div class="dice-scene">
            <div class="dice-cube" id="dice-1">
              ${uniqueCuisines.map(c => `<div class="dice-face">${c}</div>`).join('')}
            </div>
          </div>
        </div>
        <div>
          <p style="font-weight:600;margin-bottom:4px;font-size:13px;color:var(--text-secondary);">Budget</p>
          <div class="dice-scene">
            <div class="dice-cube" id="dice-2">
              ${prices.map(p => `<div class="dice-face">${p}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <button class="btn btn-primary btn-lg" id="dice-roll">Roll</button>
      </div>
    </div>

    <div id="dice-step-2" class="hidden text-center">
      <div style="display:flex;gap:12px;justify-content:center;align-items:center;margin-bottom:24px;">
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;">
          <p style="font-size:11px;color:var(--text-muted);margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Cuisine</p>
          <p style="font-size:20px;font-weight:800;" id="dice-cuisine-result"></p>
        </div>
        <span style="font-size:18px;font-weight:800;color:var(--text-muted);">+</span>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;">
          <p style="font-size:11px;color:var(--text-muted);margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Budget</p>
          <p style="font-size:20px;font-weight:800;" id="dice-price-result"></p>
        </div>
      </div>
      <p style="font-size:16px;font-weight:600;" id="dice-match-text"></p>
    </div>

    <div id="dice-step-3" class="hidden">
      <div id="dice-result"></div>
      <div class="text-center mt-4">
        <button class="btn btn-outline" id="dice-reroll">Roll Again</button>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
    <div id="dice-history" class="mt-4 text-center" style="color:var(--text-muted);font-size:13px;"></div>
  `;
}

export function init(container) {
  const uniqueCuisines = cuisines.slice(0, 6);
  const priceMap = { '<$9': 9, '<$10': 10, '<$12': 12, '<$15': 15, '<$18': 18, 'Any $': 0 };
  const prices = Object.keys(priceMap);
  let rollCount = 0;

  function roll() {
    rollCount++;
    const dice1 = container.querySelector('#dice-1');
    const dice2 = container.querySelector('#dice-2');
    const cuisineIdx = Math.floor(Math.random() * uniqueCuisines.length);
    const priceIdx = Math.floor(Math.random() * prices.length);

    dice1.style.transition = 'none'; dice2.style.transition = 'none';
    dice1.classList.remove('rolling'); dice2.classList.remove('rolling');

    requestAnimationFrame(() => {
      dice1.classList.add('rolling'); dice2.classList.add('rolling');
      setTimeout(() => {
        dice1.classList.remove('rolling'); dice2.classList.remove('rolling');
        dice1.style.transition = 'transform 0.5s ease'; dice2.style.transition = 'transform 0.5s ease';
        dice1.style.transform = getInverseRotation(cuisineIdx); dice2.style.transform = getInverseRotation(priceIdx);

        const rolledCuisine = uniqueCuisines[cuisineIdx];
        const rolledPrice = prices[priceIdx];
        const maxPrice = priceMap[rolledPrice];

        setTimeout(() => {
          setStep(2);
          container.querySelector('#dice-cuisine-result').textContent = rolledCuisine;
          container.querySelector('#dice-price-result').textContent = rolledPrice;

          let matches = restaurants.filter(r => r.cuisine === rolledCuisine && (maxPrice === 0 || r.price <= maxPrice));
          if (!matches.length) matches = restaurants.filter(r => r.cuisine === rolledCuisine);
          if (!matches.length) matches = maxPrice === 0 ? [...restaurants] : restaurants.filter(r => r.price <= maxPrice);

          const winner = matches[Math.floor(Math.random() * matches.length)];
          container.querySelector('#dice-match-text').textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;

          setTimeout(() => {
            app.confetti(); app.saveHistory(winner); setStep(3);
            container.querySelector('#dice-result').innerHTML = app.renderResultCard(winner);
            container.querySelector('#dice-history').textContent = `Rolls: ${rollCount}`;
          }, 800);
        }, 400);
      }, 1500);
    });
  }

  function getInverseRotation(i) {
    return ['rotateY(0deg)','rotateY(180deg)','rotateY(90deg)','rotateY(-90deg)','rotateX(-90deg)','rotateX(90deg)'][i % 6];
  }

  container.querySelector('#dice-roll').addEventListener('click', roll);
  container.querySelector('#dice-reroll')?.addEventListener('click', () => { setStep(1); setTimeout(roll, 200); });

  function setStep(n) {
    [1, 2, 3].forEach(s => {
      container.querySelector(`#dice-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n); dot.classList.toggle('done', s < n);
    });
  }
}
