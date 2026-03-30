import { restaurants } from '../data/restaurants.js';

const moods = [
  { label: 'Hangry', color: '#ef4444', tags: ['quick', 'cheap', 'hearty'], rx: 'Immediate food intervention required. Heavy carbs, stat.' },
  { label: 'Zen', color: '#22c55e', tags: ['healthy', 'light-lunch', 'chill'], rx: 'Something light and mindful. Feed the soul, not just the body.' },
  { label: 'Celebrating', color: '#a78bfa', tags: ['upscale', 'sit-down', 'creative'], rx: 'You deserve the best today. Treat yourself.' },
  { label: 'Stressed', color: '#f97316', tags: ['comfort', 'cozy', 'classic', 'cheap'], rx: 'Comfort food prescription. Something warm and familiar.' },
  { label: 'Adventurous', color: '#00d4ff', tags: ['unique', 'fusion', 'bold-flavors', 'creative'], rx: 'Time to try something completely new and exciting.' },
  { label: 'Lazy', color: '#eab308', tags: ['quick', 'cheap', 'street-food'], rx: 'Minimal effort, maximum satisfaction. Close and fast.' },
  { label: 'Healthy', color: '#10b981', tags: ['healthy', 'light-lunch', 'outdoor'], rx: 'Fuel that body. Clean eating, good choices.' },
  { label: 'Treat Myself', color: '#ec4899', tags: ['upscale', 'instagram', 'elegant'], rx: 'You only live once. Go fancy today.' },
  { label: 'Indecisive', color: '#6366f1', tags: [], rx: "Can't decide? Let us pick for you. Random it is." },
  { label: 'Date Vibes', color: '#f43f5e', tags: ['date-spot', 'sit-down', 'elegant'], rx: 'Impress someone special. Or just treat yourself royally.' },
  { label: 'Sunny Day', color: '#c8ff00', tags: ['outdoor', 'chill', 'casual'], rx: 'Perfect weather for a patio lunch.' },
  { label: 'Broke', color: '#64748b', tags: ['cheap', 'street-food', 'quick'], rx: 'Wallet on a diet? We got you covered.' },
];

export function render() {
  return `
    <div class="page-header">
      <h1>Mood Picker</h1>
      <p>How are you feeling? Dr. Lunch will prescribe the perfect meal.</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
    </div>

    <div id="mood-step-1">
      <div class="mood-grid">
        ${moods.map((m, i) => `
          <button class="mood-btn" data-idx="${i}">
            <span class="mood-icon" style="background:${m.color}20;color:${m.color};">${m.label.charAt(0)}</span>
            ${m.label}
          </button>
        `).join('')}
      </div>
    </div>

    <div id="mood-step-2" class="hidden"><div id="mood-prescription"></div></div>

    <div id="mood-step-3" class="hidden">
      <div id="mood-result"></div>
      <div class="text-center mt-4">
        <a href="#/mood" class="btn btn-outline">Pick Another Mood</a>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
  `;
}

export function init(container) {
  container.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => showPrescription(moods[parseInt(btn.dataset.idx)]));
  });

  function showPrescription(mood) {
    setStep(2);
    let matches;
    if (mood.tags.length === 0) {
      matches = [...restaurants].sort(() => Math.random() - 0.5).slice(0, 3);
    } else {
      matches = restaurants.map(r => {
        let score = 0;
        mood.tags.forEach(tag => { if (r.tags.includes(tag)) score++; });
        if (r.vibe === 'upscale' && mood.tags.includes('upscale')) score += 2;
        if (r.price <= 12 && mood.tags.includes('cheap')) score += 2;
        return { ...r, score };
      }).sort((a, b) => b.score - a.score).slice(0, 3);
    }

    const rx = container.querySelector('#mood-prescription');
    rx.innerHTML = `
      <div class="page-enter" style="max-width:560px;margin:0 auto;">
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:28px;border-top:3px solid ${mood.color};">
          <div style="margin-bottom:16px;">
            <p style="font-weight:800;font-size:16px;">Dr. Lunch</p>
            <p style="color:var(--text-muted);font-size:12px;">Board Certified Food Therapist</p>
          </div>
          <div style="border-top:1px dashed var(--border);padding-top:16px;">
            <p style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Diagnosis: ${mood.label}</p>
            <p style="font-size:15px;font-style:italic;color:var(--text-secondary);margin-bottom:20px;">"${mood.rx}"</p>
            <p style="font-weight:700;margin-bottom:12px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);">Prescription</p>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${matches.map(r => {
                const color = app.getCuisineColor(r.cuisine);
                return `
                <div class="mood-pick" data-id="${r.id}" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border);cursor:pointer;transition:var(--transition);">
                  <div style="width:36px;height:36px;border-radius:10px;background:${color}20;color:${color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;flex-shrink:0;">${r.name.charAt(0)}</div>
                  <div style="flex:1;min-width:0;">
                    <p style="font-weight:600;font-size:14px;">${r.name}</p>
                    <p style="font-size:12px;color:var(--text-muted);">${r.cuisine} / $${r.price} / ${r.walkMinutes}min walk</p>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    rx.querySelectorAll('.mood-pick').forEach(pick => {
      pick.addEventListener('mouseenter', () => { pick.style.borderColor = 'var(--border-light)'; pick.style.background = 'var(--bg-elevated)'; });
      pick.addEventListener('mouseleave', () => { pick.style.borderColor = 'var(--border)'; pick.style.background = ''; });
      pick.addEventListener('click', () => {
        const r = restaurants.find(r => r.id === pick.dataset.id);
        if (r) { app.saveHistory(r); app.confetti(); setStep(3); container.querySelector('#mood-result').innerHTML = app.renderResultCard(r); }
      });
    });
  }

  function setStep(n) {
    [1, 2, 3].forEach(s => {
      container.querySelector(`#mood-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n);
      dot.classList.toggle('done', s < n);
    });
  }
}
