import { restaurants, shuffle } from '../data/restaurants.js';

export function render() {
  return `
    <div class="page-header">
      <h1>Team Vote</h1>
      <p>Nominate restaurants and let the team decide.</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
      <div class="step-dot" data-step="4"></div>
    </div>

    <div id="vote-step-1">
      <p class="text-center mb-4" style="color:var(--text-muted);font-size:14px;">Select 4\u20136 nominees</p>
      <div class="home-grid" id="vote-nominees"></div>
      <div class="text-center mt-4">
        <button class="btn btn-primary btn-lg" id="vote-start-btn" disabled>Pick 4\u20136 to continue</button>
      </div>
    </div>

    <div id="vote-step-2" class="hidden">
      <div class="text-center mb-4">
        <h2 id="voter-title">Voter 1</h2>
        <p style="color:var(--text-muted);font-size:14px;">You have <strong id="votes-left">3</strong> votes</p>
      </div>
      <div id="vote-options" class="home-grid" style="max-width:660px;margin:0 auto;"></div>
      <div class="text-center mt-4">
        <button class="btn btn-green" id="vote-submit" disabled>Submit Votes</button>
        <button class="btn btn-ghost" id="vote-done-all">Finish Voting</button>
      </div>
    </div>

    <div id="vote-step-3" class="hidden">
      <h2 class="text-center mb-4">Results</h2>
      <div id="vote-results" style="max-width:560px;margin:0 auto;"></div>
      <div class="text-center mt-4">
        <button class="btn btn-primary" id="vote-next-voter">Next Voter</button>
        <button class="btn btn-orange" id="vote-final">Announce Winner</button>
      </div>
    </div>

    <div id="vote-step-4" class="hidden">
      <div id="vote-winner"></div>
      <div class="text-center mt-4">
        <a href="#/vote" class="btn btn-outline">New Vote</a>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
  `;
}

export function init(container) {
  let nominees = [];
  let votes = {};
  let voterNum = 1;
  let currentVotes = [];
  const maxVotesPerPerson = 3;

  const nomGrid = container.querySelector('#vote-nominees');
  nomGrid.innerHTML = shuffle([...restaurants]).map(r => {
    const color = app.getCuisineColor(r.cuisine);
    return `
    <div class="home-card vote-nom" data-id="${r.id}" style="text-align:center;">
      <div style="width:28px;height:28px;border-radius:7px;background:${color}20;color:${color};display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;margin-bottom:6px;">${r.name.charAt(0)}</div>
      <h3 style="font-size:14px;">${r.name}</h3>
      <p style="font-size:12px;color:var(--text-muted);">${r.cuisine}</p>
    </div>`;
  }).join('');

  const startBtn = container.querySelector('#vote-start-btn');

  nomGrid.querySelectorAll('.vote-nom').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const idx = nominees.indexOf(id);
      if (idx > -1) { nominees.splice(idx, 1); card.style.borderColor = 'var(--border)'; card.style.background = 'var(--bg-card)'; }
      else { if (nominees.length >= 6) return; nominees.push(id); card.style.borderColor = 'var(--accent)'; card.style.background = 'var(--accent-dim)'; }
      startBtn.disabled = nominees.length < 4;
      startBtn.textContent = nominees.length < 4 ? `Pick ${4 - nominees.length} more` : `Start Voting (${nominees.length})`;
    });
  });

  startBtn.addEventListener('click', () => { nominees.forEach(id => { votes[id] = 0; }); voterNum = 1; showVoterScreen(); setStep(2); });

  function showVoterScreen() {
    currentVotes = [];
    container.querySelector('#voter-title').textContent = `Voter ${voterNum}`;
    container.querySelector('#votes-left').textContent = maxVotesPerPerson;
    container.querySelector('#vote-submit').disabled = true;

    const options = container.querySelector('#vote-options');
    options.innerHTML = nominees.map(id => {
      const r = restaurants.find(r => r.id === id);
      const color = app.getCuisineColor(r.cuisine);
      return `
      <div class="home-card vote-option" data-id="${id}" style="text-align:center;">
        <div style="width:28px;height:28px;border-radius:7px;background:${color}20;color:${color};display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;margin-bottom:6px;">${r.name.charAt(0)}</div>
        <h3 style="font-size:14px;">${r.name}</h3>
      </div>`;
    }).join('');

    options.querySelectorAll('.vote-option').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const idx = currentVotes.indexOf(id);
        if (idx > -1) { currentVotes.splice(idx, 1); card.style.borderColor = 'var(--border)'; card.style.background = 'var(--bg-card)'; }
        else { if (currentVotes.length >= maxVotesPerPerson) return; currentVotes.push(id); card.style.borderColor = 'var(--accent-2)'; card.style.background = 'rgba(0,212,255,0.08)'; }
        container.querySelector('#votes-left').textContent = maxVotesPerPerson - currentVotes.length;
        container.querySelector('#vote-submit').disabled = currentVotes.length === 0;
      });
    });
  }

  container.querySelector('#vote-submit').addEventListener('click', () => { currentVotes.forEach(id => { votes[id] = (votes[id] || 0) + 1; }); showResults(); setStep(3); });
  container.querySelector('#vote-next-voter').addEventListener('click', () => { voterNum++; showVoterScreen(); setStep(2); });
  container.querySelector('#vote-done-all').addEventListener('click', () => { showResults(); setStep(3); });

  function showResults() {
    const results = container.querySelector('#vote-results');
    const sorted = nominees.map(id => ({ id, votes: votes[id] || 0, ...restaurants.find(r => r.id === id) })).sort((a, b) => b.votes - a.votes);
    const maxV = Math.max(...sorted.map(s => s.votes), 1);
    const colors = ['#ff6b35', '#f7c948', '#4ecdc4', '#a78bfa', '#ff6b6b', '#3b82f6'];

    results.innerHTML = sorted.map((r, i) => `
      <div class="vote-bar-wrap page-enter" style="animation-delay:${i * 0.08}s">
        <div class="vote-bar-label"><span>${r.name}</span><span>${r.votes}</span></div>
        <div class="vote-bar-bg"><div class="vote-bar-fill" style="width:${(r.votes / maxV) * 100}%;background:${colors[i % colors.length]};"></div></div>
      </div>
    `).join('');
  }

  container.querySelector('#vote-final').addEventListener('click', () => {
    const sorted = nominees.map(id => ({ ...restaurants.find(r => r.id === id), votes: votes[id] || 0 })).sort((a, b) => b.votes - a.votes);
    const winner = sorted[0];
    app.confetti(); app.saveHistory(winner); setStep(4);
    container.querySelector('#vote-winner').innerHTML = `
      <div class="text-center mb-4"><h2 style="color:var(--accent);">The people have spoken</h2><p style="color:var(--text-muted);">${winner.votes} votes</p></div>
      ${app.renderResultCard(winner)}`;
  });

  function setStep(n) {
    [1, 2, 3, 4].forEach(s => {
      container.querySelector(`#vote-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      if (dot) { dot.classList.toggle('active', s === n); dot.classList.toggle('done', s < n); }
    });
  }
}
