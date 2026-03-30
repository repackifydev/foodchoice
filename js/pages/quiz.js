import { restaurants } from '../data/restaurants.js';

const questions = [
  {
    question: "It's Monday. How are you feeling?",
    options: [
      { label: 'A', text: 'Exhausted', tags: ['comfort', 'cheap', 'quick'] },
      { label: 'B', text: 'Ready to crush it', tags: ['creative', 'upscale'] },
      { label: 'C', text: 'Meh', tags: ['classic', 'casual'] },
      { label: 'D', text: 'Excited', tags: ['unique', 'bold-flavors'] },
    ]
  },
  {
    question: "Pick a packaging material",
    options: [
      { label: 'A', text: 'Bubble wrap', tags: ['comfort', 'cheesy', 'cozy'] },
      { label: 'B', text: 'Sturdy cardboard', tags: ['classic', 'hearty', 'meat-lovers'] },
      { label: 'C', text: 'Foam peanuts', tags: ['creative', 'unique', 'street-food'] },
      { label: 'D', text: 'Premium tape', tags: ['upscale', 'elegant', 'sit-down'] },
    ]
  },
  {
    question: "How far would you walk for great food?",
    options: [
      { label: 'A', text: '5 min max', tags: ['quick'], maxWalk: 7 },
      { label: 'B', text: '10-15 min is fine', tags: [], maxWalk: 15 },
      { label: 'C', text: "I'd trek for it", tags: [], maxWalk: 25 },
      { label: 'D', text: "I'll drive", tags: [], maxWalk: 99 },
    ]
  },
  {
    question: "Pick a spirit animal for lunch",
    options: [
      { label: 'A', text: 'Cow \u2014 hearty', tags: ['meat-lovers', 'hearty', 'smoky'] },
      { label: 'B', text: 'Octopus \u2014 adventurous', tags: ['creative', 'fusion', 'unique'] },
      { label: 'C', text: 'Chicken \u2014 reliable', tags: ['classic', 'quick', 'casual'] },
      { label: 'D', text: 'Broccoli \u2014 healthy', tags: ['healthy', 'light-lunch'] },
    ]
  },
  {
    question: "Your ideal lunch vibe?",
    options: [
      { label: 'A', text: 'Quick & dirty', tags: ['quick', 'cheap', 'street-food', 'food-truck'] },
      { label: 'B', text: 'Sit & chill', tags: ['sit-down', 'cozy', 'casual'] },
      { label: 'C', text: 'Instagram-worthy', tags: ['instagram', 'creative', 'upscale'] },
      { label: 'D', text: 'Surprise me', tags: ['unique', 'fusion', 'bold-flavors'] },
    ]
  },
  {
    question: "Spice tolerance?",
    options: [
      { label: 'A', text: 'Mild please', tags: ['comfort', 'classic', 'cheesy'] },
      { label: 'B', text: 'Medium kick', tags: ['authentic', 'casual'] },
      { label: 'C', text: 'Bring the heat', tags: ['smoky', 'bold-flavors', 'street-food'] },
      { label: 'D', text: "Don't care", tags: [] },
    ]
  }
];

const personalities = [
  { name: 'The Comfort Seeker', desc: 'You crave warmth, familiarity, and food that feels like a hug.' },
  { name: 'The Adventurer', desc: 'You live for trying new things and bold flavors.' },
  { name: 'The Minimalist', desc: 'Fast, simple, satisfying. No fuss needed.' },
  { name: 'The Connoisseur', desc: 'You appreciate craft, technique, and culinary artistry.' },
];

export function render() {
  return `
    <div class="page-header">
      <h1>Lunch Personality Quiz</h1>
      <p>Answer 6 questions to discover your perfect lunch</p>
    </div>
    <div class="progress-bar"><div class="progress-fill" id="quiz-progress" style="width:0%"></div></div>
    <div id="quiz-content"></div>
  `;
}

export function init(container) {
  let currentQ = 0;
  let scores = {};
  let maxWalk = 99;

  showQuestion();

  function showQuestion() {
    if (currentQ >= questions.length) { showResult(); return; }
    const q = questions[currentQ];
    container.querySelector('#quiz-progress').style.width = ((currentQ) / questions.length) * 100 + '%';

    const content = container.querySelector('#quiz-content');
    content.innerHTML = `
      <div class="text-center mb-4 page-enter">
        <p style="font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">${currentQ + 1} / ${questions.length}</p>
        <h2 style="font-size:22px;margin-top:8px;">${q.question}</h2>
      </div>
      <div class="grid-2" style="max-width:560px;margin:0 auto;">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" data-idx="${i}">
            <div class="option-label">${opt.label}</div>
            ${opt.text}
          </div>
        `).join('')}
      </div>
    `;

    content.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const idx = parseInt(opt.dataset.idx);
        const chosen = q.options[idx];
        chosen.tags.forEach(tag => { scores[tag] = (scores[tag] || 0) + 1; });
        if (chosen.maxWalk) maxWalk = Math.min(maxWalk, chosen.maxWalk);
        opt.classList.add('selected');
        currentQ++;
        setTimeout(showQuestion, 350);
      });
    });
  }

  function showResult() {
    container.querySelector('#quiz-progress').style.width = '100%';

    const scored = restaurants.map(r => {
      let score = 0;
      r.tags.forEach(tag => { score += scores[tag] || 0; });
      if (r.walkMinutes > maxWalk) score -= 3;
      if (r.vibe === 'upscale' && scores['upscale']) score += 2;
      if (r.vibe === 'food-truck' && scores['street-food']) score += 2;
      return { ...r, score };
    }).sort((a, b) => b.score - a.score);

    const winner = scored[0];
    const alts = scored.slice(1, 4);

    const topTags = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    let personality = personalities[0];
    if (topTags.includes('creative') || topTags.includes('unique') || topTags.includes('bold-flavors')) personality = personalities[1];
    if (topTags.includes('quick') || topTags.includes('cheap')) personality = personalities[2];
    if (topTags.includes('upscale') || topTags.includes('elegant')) personality = personalities[3];

    app.confetti();
    app.saveHistory(winner);

    container.querySelector('#quiz-content').innerHTML = `
      <div class="page-enter">
        <div class="text-center mb-4">
          <h2 style="color:var(--accent);">${personality.name}</h2>
          <p style="color:var(--text-secondary);max-width:400px;margin:8px auto;">${personality.desc}</p>
          <p style="margin-top:16px;font-weight:600;font-size:14px;color:var(--text-muted);">YOUR PERFECT SPOT</p>
        </div>
        ${app.renderResultCard(winner)}
        <div class="mt-4 text-center">
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">Also great for you:</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
            ${alts.map(r => `<span class="chip">${r.name}</span>`).join('')}
          </div>
        </div>
        <div class="text-center mt-4">
          <a href="#/quiz" class="btn btn-outline">Retake Quiz</a>
          <a href="#/" class="btn btn-ghost">Home</a>
        </div>
      </div>
    `;
  }
}
