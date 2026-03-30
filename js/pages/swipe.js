import { restaurants, shuffle, cuisines } from '../data/restaurants.js';

export function render() {
  return `
    <div class="page-header">
      <h1>Swipe Right</h1>
      <p>Swipe right on restaurants you like, left to skip</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
    </div>

    <div id="swipe-step-1">
      <div class="filter-chips">
        <button class="chip selected" data-cuisine="all">All</button>
        ${cuisines.map(c => `<button class="chip" data-cuisine="${c}">${c}</button>`).join('')}
      </div>
      <div class="text-center mt-2">
        <button class="btn btn-primary btn-lg" id="swipe-start">Start Swiping</button>
      </div>
    </div>

    <div id="swipe-step-2" class="hidden">
      <div class="swipe-container" id="swipe-area"></div>
      <div class="swipe-buttons mt-2">
        <button class="swipe-btn nope-btn" id="swipe-nope">\u2715</button>
        <button class="swipe-btn like-btn" id="swipe-like">\u2713</button>
      </div>
      <p class="text-center mt-2" style="color:var(--text-muted);font-size:13px;" id="swipe-counter"></p>
    </div>

    <div id="swipe-step-3" class="hidden">
      <div id="swipe-results"></div>
    </div>
  `;
}

export function init(container) {
  let cards = [];
  let currentIdx = 0;
  let likes = [];
  let selectedCuisine = 'all';

  container.querySelectorAll('[data-cuisine]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('[data-cuisine]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedCuisine = chip.dataset.cuisine;
    });
  });

  container.querySelector('#swipe-start').addEventListener('click', () => {
    const filtered = selectedCuisine === 'all' ? [...restaurants] : restaurants.filter(r => r.cuisine === selectedCuisine);
    cards = shuffle(filtered).slice(0, 10);
    currentIdx = 0;
    likes = [];
    renderCards();
    setStep(2);
  });

  container.querySelector('#swipe-nope').addEventListener('click', () => swipe(false));
  container.querySelector('#swipe-like').addEventListener('click', () => swipe(true));

  function renderCards() {
    const area = container.querySelector('#swipe-area');
    area.innerHTML = '';
    if (currentIdx >= cards.length) { showResults(); return; }
    container.querySelector('#swipe-counter').textContent = `${currentIdx + 1} / ${cards.length}`;

    const end = Math.min(currentIdx + 2, cards.length);
    for (let i = end - 1; i >= currentIdx; i--) {
      const r = cards[i];
      const color = app.getCuisineColor(r.cuisine);
      const card = document.createElement('div');
      card.className = 'swipe-card';
      card.style.zIndex = cards.length - i;
      if (i > currentIdx) {
        card.style.transform = 'scale(0.95) translateY(8px)';
        card.style.opacity = '0.4';
      }
      card.innerHTML = `
        <div class="swipe-overlay like">YES</div>
        <div class="swipe-overlay nope">NOPE</div>
        <div class="card-initial-lg" style="background:${color}20;color:${color};">${r.name.charAt(0)}</div>
        <h3>${r.name}</h3>
        <p class="card-cuisine">${r.cuisine} / $${r.price}</p>
        <p class="card-meta">${r.walkMinutes} min walk / ${r.rating} stars</p>
        <p class="card-dishes">${r.popularDishes.join(' \u2022 ')}</p>
      `;
      area.appendChild(card);
      if (i === currentIdx) setupDrag(card);
    }
  }

  function setupDrag(card) {
    let startX = 0, currentX = 0, dragging = false;
    function onStart(e) { dragging = true; startX = e.clientX || e.touches?.[0]?.clientX || 0; card.style.transition = 'none'; }
    function onMove(e) {
      if (!dragging) return;
      currentX = (e.clientX || e.touches?.[0]?.clientX || 0) - startX;
      card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.08}deg)`;
      card.querySelector('.swipe-overlay.like').style.opacity = Math.max(0, currentX / 100);
      card.querySelector('.swipe-overlay.nope').style.opacity = Math.max(0, -currentX / 100);
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      card.style.transition = 'transform 0.3s ease';
      if (Math.abs(currentX) > 80) { swipe(currentX > 0); }
      else { card.style.transform = ''; card.querySelector('.swipe-overlay.like').style.opacity = 0; card.querySelector('.swipe-overlay.nope').style.opacity = 0; }
      currentX = 0;
    }
    card.addEventListener('pointerdown', onStart);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerup', onEnd);
    card.addEventListener('pointerleave', onEnd);
  }

  function swipe(liked) {
    if (currentIdx >= cards.length) return;
    const area = container.querySelector('#swipe-area');
    const topCard = area.querySelector('.swipe-card');
    if (!topCard) return;
    if (liked) likes.push(cards[currentIdx]);
    topCard.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    topCard.style.transform = `translateX(${liked ? 400 : -400}px) rotate(${liked ? 25 : -25}deg)`;
    topCard.style.opacity = '0';
    currentIdx++;
    setTimeout(() => renderCards(), 300);
  }

  function showResults() {
    setStep(3);
    const results = container.querySelector('#swipe-results');
    if (likes.length === 0) {
      results.innerHTML = `
        <div class="text-center">
          <h2>No matches</h2>
          <p style="color:var(--text-muted);margin:8px 0;">You skipped everything. Try again?</p>
          <button class="btn btn-primary mt-2" onclick="location.hash='#/swipe'">Try Again</button>
        </div>`;
    } else {
      app.confetti();
      const winner = likes[0];
      app.saveHistory(winner);
      results.innerHTML = `
        <div class="text-center mb-4"><h2>Your Matches (${likes.length})</h2></div>
        ${app.renderResultCard(winner)}
        ${likes.length > 1 ? `
          <div class="mt-4 text-center">
            <p style="color:var(--text-muted);font-size:13px;margin-bottom:10px;">Also liked:</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
              ${likes.slice(1).map(r => `<span class="chip">${r.name}</span>`).join('')}
            </div>
          </div>` : ''}
        <div class="text-center mt-4">
          <a href="#/swipe" class="btn btn-outline">Swipe Again</a>
          <a href="#/" class="btn btn-ghost">Home</a>
        </div>`;
    }
  }

  function setStep(n) {
    [1, 2, 3].forEach(s => {
      container.querySelector(`#swipe-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n);
      dot.classList.toggle('done', s < n);
    });
  }
}
