import { restaurants, shuffle } from '../data/restaurants.js';

export function render() {
  return `
    <div class="page-header">
      <h1>Tournament Bracket</h1>
      <p>Head-to-head battles until one restaurant is crowned champion</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
    </div>

    <div id="bracket-step-1" class="text-center">
      <p style="margin-bottom:16px;color:var(--text-secondary);">How many contenders?</p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn btn-primary" data-size="8">8 Restaurants</button>
        <button class="btn btn-outline" data-size="16">16 Restaurants</button>
      </div>
    </div>

    <div id="bracket-step-2" class="hidden">
      <div id="bracket-round-info" class="text-center mb-4"></div>
      <div id="bracket-matchup" style="display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;"></div>
      <div id="bracket-progress" class="mt-4 text-center"></div>
    </div>

    <div id="bracket-step-3" class="hidden">
      <div id="bracket-result"></div>
      <div class="text-center mt-4">
        <a href="#/bracket" class="btn btn-outline">New Tournament</a>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
  `;
}

export function init(container) {
  let round = [];
  let roundNum = 0;
  let matchIdx = 0;
  let winners = [];

  container.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = parseInt(btn.dataset.size);
      round = shuffle([...restaurants]).slice(0, size);
      roundNum = 1;
      matchIdx = 0;
      winners = [];
      setStep(2);
      showMatchup();
    });
  });

  function getRoundName(remaining) {
    if (remaining === 2) return 'FINALS';
    if (remaining === 4) return 'Semifinals';
    if (remaining === 8) return 'Quarterfinals';
    return `Round ${roundNum}`;
  }

  function showMatchup() {
    const info = container.querySelector('#bracket-round-info');
    const area = container.querySelector('#bracket-matchup');
    const totalMatches = round.length / 2;
    info.innerHTML = `<h2>${getRoundName(round.length)}</h2><p style="color:var(--text-muted);font-size:14px;">Match ${matchIdx + 1} of ${totalMatches}</p>`;

    const a = round[matchIdx * 2];
    const b = round[matchIdx * 2 + 1];
    const colorA = app.getCuisineColor(a.cuisine);
    const colorB = app.getCuisineColor(b.cuisine);

    area.innerHTML = `
      <div class="matchup-card" data-pick="a" style="flex:1;max-width:240px;">
        <div class="card-initial" style="background:${colorA}20;color:${colorA};">${a.name.charAt(0)}</div>
        <h3 style="font-size:16px;font-weight:700;margin-top:8px;">${a.name}</h3>
        <p style="color:var(--text-muted);font-size:13px;">${a.cuisine} / $${a.price}</p>
        <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">${a.popularDishes[0]}</p>
      </div>
      <div class="vs-badge">VS</div>
      <div class="matchup-card" data-pick="b" style="flex:1;max-width:240px;">
        <div class="card-initial" style="background:${colorB}20;color:${colorB};">${b.name.charAt(0)}</div>
        <h3 style="font-size:16px;font-weight:700;margin-top:8px;">${b.name}</h3>
        <p style="color:var(--text-muted);font-size:13px;">${b.cuisine} / $${b.price}</p>
        <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">${b.popularDishes[0]}</p>
      </div>
    `;

    area.querySelectorAll('.matchup-card').forEach(card => {
      card.addEventListener('click', () => {
        const pick = card.dataset.pick;
        const winner = pick === 'a' ? a : b;
        winners.push(winner);
        card.classList.add('selected');
        area.querySelector(`.matchup-card[data-pick="${pick === 'a' ? 'b' : 'a'}"]`).classList.add('eliminated');
        setTimeout(() => {
          matchIdx++;
          if (matchIdx >= round.length / 2) {
            if (winners.length === 1) { showChampion(winners[0]); return; }
            round = [...winners];
            winners = [];
            matchIdx = 0;
            roundNum++;
          }
          showMatchup();
        }, 500);
      });
    });
  }

  function showChampion(winner) {
    app.confetti();
    app.saveHistory(winner);
    setStep(3);
    container.querySelector('#bracket-result').innerHTML = `
      <div class="text-center mb-4"><h2 style="color:var(--accent);">Champion</h2></div>
      ${app.renderResultCard(winner)}
    `;
  }

  function setStep(n) {
    [1, 2, 3].forEach(s => {
      container.querySelector(`#bracket-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n);
      dot.classList.toggle('done', s < n);
    });
  }
}
