import { restaurants, cuisines, shuffle, getRandom } from '../data/restaurants.js';

export function render() {
  return `
    <div class="page-header">
      <h1>Quick Random</h1>
      <p>No patience? Instant random pick.</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
    </div>

    <div id="rand-step-1">
      <p class="text-center mb-2" style="color:var(--text-muted);font-size:13px;">Optional filters:</p>
      <div class="filter-chips">
        <button class="chip selected" data-cuisine="all">All</button>
        ${cuisines.map(c => `<button class="chip" data-cuisine="${c}">${c}</button>`).join('')}
      </div>
      <div class="filter-chips mt-2">
        <button class="chip selected" data-price="0">Any Price</button>
        <button class="chip" data-price="9">Under $9</button>
        <button class="chip" data-price="12">Under $12</button>
        <button class="chip" data-price="15">Under $15</button>
      </div>

      <div class="randomizer-display" id="rand-display">\u2014</div>

      <div class="text-center">
        <button class="btn btn-primary btn-lg" id="rand-go" style="font-size:18px;padding:18px 44px;">FEED ME</button>
      </div>
    </div>

    <div id="rand-step-2" class="hidden">
      <div id="rand-result"></div>
      <div class="text-center mt-4">
        <button class="btn btn-orange" id="rand-reroll">Not feeling it</button>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
      <div class="shame-counter" id="rand-shame"></div>
    </div>
  `;
}

export function init(container) {
  let selectedCuisine = 'all';
  let selectedPrice = 0;
  let rerollCount = 0;
  let animFrame = null;

  container.querySelectorAll('[data-cuisine]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('[data-cuisine]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedCuisine = chip.dataset.cuisine;
    });
  });

  container.querySelectorAll('[data-price]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('[data-price]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedPrice = parseInt(chip.dataset.price);
    });
  });

  container.querySelector('#rand-go').addEventListener('click', doRandom);
  container.querySelector('#rand-reroll').addEventListener('click', () => {
    rerollCount++;
    setStep(1);
    setTimeout(doRandom, 150);
  });

  function getFiltered() {
    return restaurants.filter(r => {
      if (selectedCuisine !== 'all' && r.cuisine !== selectedCuisine) return false;
      if (selectedPrice > 0 && r.price > selectedPrice) return false;
      return true;
    });
  }

  function doRandom() {
    let pool = getFiltered();
    if (pool.length === 0) pool = [...restaurants];
    const shuffled = shuffle(pool);
    const winner = shuffled[0];

    const display = container.querySelector('#rand-display');
    display.classList.add('spinning');
    let tick = 0;
    const totalTicks = 25;

    function animate() {
      if (tick >= totalTicks) {
        display.classList.remove('spinning');
        display.textContent = winner.name;
        setTimeout(() => {
          app.confetti(); app.saveHistory(winner); setStep(2);
          container.querySelector('#rand-result').innerHTML = app.renderResultCard(winner);
          const msgs = ['', '', '', '',
            "You've rejected 4 restaurants...",
            '5 rerolls? Are you even hungry?',
            '6 rerolls. The restaurants feel rejected.',
            '7 rerolls. Just cook at home.',
            '8+ rerolls. Maybe try the Quiz instead.'];
          container.querySelector('#rand-shame').textContent = msgs[Math.min(rerollCount, msgs.length - 1)];
        }, 250);
        return;
      }
      const speed = 30 + (180 * (tick / totalTicks));
      display.textContent = pool[Math.floor(Math.random() * pool.length)].name;
      tick++;
      animFrame = setTimeout(animate, speed);
    }
    animate();
  }

  function setStep(n) {
    [1, 2].forEach(s => {
      container.querySelector(`#rand-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n); dot.classList.toggle('done', s < n);
    });
  }

  return () => { if (animFrame) clearTimeout(animFrame); };
}
