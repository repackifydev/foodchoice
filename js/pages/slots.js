import { restaurants, cuisines, shuffle, getRandom } from '../data/restaurants.js';

export function render() {
  return `
    <div class="page-header">
      <h1>Slot Machine</h1>
      <p>Pull the lever. Three reels: Cuisine, Restaurant, Dish.</p>
    </div>

    <div class="slot-machine">
      <div class="slot-reels">
        <div>
          <div class="slot-label">Cuisine</div>
          <div class="slot-reel"><div class="slot-reel-inner" id="reel-inner-1"></div></div>
        </div>
        <div>
          <div class="slot-label">Restaurant</div>
          <div class="slot-reel"><div class="slot-reel-inner" id="reel-inner-2"></div></div>
        </div>
        <div>
          <div class="slot-label">Dish</div>
          <div class="slot-reel"><div class="slot-reel-inner" id="reel-inner-3"></div></div>
        </div>
      </div>
      <div id="jackpot-msg"></div>
      <button class="slot-lever-btn" id="slot-pull">Pull Lever</button>
    </div>

    <div id="slot-result" class="mt-4"></div>
    <div class="text-center mt-2">
      <a href="#/" class="btn btn-ghost">Home</a>
    </div>
  `;
}

export function init(container) {
  let spinning = false;
  const reelHeight = 80;

  const cuisineItems = shuffle(cuisines).concat(shuffle(cuisines)).concat(shuffle(cuisines));
  const restItems = shuffle(restaurants.map(r => r.name)).concat(shuffle(restaurants.map(r => r.name)));
  const dishItems = shuffle(restaurants.flatMap(r => r.popularDishes)).slice(0, 30);

  function buildReel(innerId, items) {
    container.querySelector(`#${innerId}`).innerHTML = items.map(item =>
      `<div class="slot-item">${item}</div>`
    ).join('');
  }

  buildReel('reel-inner-1', cuisineItems);
  buildReel('reel-inner-2', restItems);
  buildReel('reel-inner-3', dishItems);

  container.querySelector('#slot-pull').addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    container.querySelector('#jackpot-msg').innerHTML = '';
    container.querySelector('#slot-result').innerHTML = '';

    const winner = getRandom(restaurants);
    const winDish = winner.popularDishes[Math.floor(Math.random() * winner.popularDishes.length)];

    const cuisineIdx = cuisineItems.indexOf(winner.cuisine);
    const restIdx = restItems.indexOf(winner.name);
    const dishIdx = dishItems.indexOf(winDish) >= 0 ? dishItems.indexOf(winDish) : 0;

    animateReel('reel-inner-1', cuisineIdx, 1500);
    animateReel('reel-inner-2', restIdx, 2200);
    animateReel('reel-inner-3', dishIdx >= 0 ? dishIdx : 0, 2900);

    setTimeout(() => {
      spinning = false;
      app.saveHistory(winner);
      app.confetti();
      container.querySelector('#jackpot-msg').innerHTML = '<div class="jackpot-text">JACKPOT</div>';
      container.querySelector('#slot-result').innerHTML = app.renderResultCard(winner);
    }, 3200);
  });

  function animateReel(innerId, targetIdx, duration) {
    const inner = container.querySelector(`#${innerId}`);
    const totalScroll = targetIdx * reelHeight + reelHeight * 20;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentOffset = ease * totalScroll;
      const maxScroll = inner.children.length * reelHeight;
      inner.style.transform = `translateY(-${currentOffset % maxScroll}px)`;
      if (progress < 1) requestAnimationFrame(tick);
      else inner.style.transform = `translateY(-${targetIdx * reelHeight}px)`;
    }
    requestAnimationFrame(tick);
  }
}
