import { getHistory } from '../utils/storage.js';
import { restaurants } from '../data/restaurants.js';

const cards = [
  { hash: 'spin', title: 'Spin the Wheel', desc: 'Let fate decide with a satisfying spin', color: '#ff6b35' },
  { hash: 'swipe', title: 'Swipe Right', desc: 'Tinder-style: swipe to find your lunch match', color: '#4ecdc4' },
  { hash: 'bracket', title: 'Tournament', desc: 'Head-to-head battles until one restaurant wins', color: '#f7c948' },
  { hash: 'slots', title: 'Slot Machine', desc: 'Pull the lever for a cuisine + restaurant combo', color: '#ff6b6b' },
  { hash: 'quiz', title: 'Personality Quiz', desc: 'Answer questions to reveal your lunch destiny', color: '#a78bfa' },
  { hash: 'mood', title: 'Mood Picker', desc: 'How are you feeling? Let Dr. Lunch prescribe', color: '#ec4899' },
  { hash: 'budget', title: 'Budget Slider', desc: 'Slide to your price range, find your meal', color: '#f7c948' },
  { hash: 'vote', title: 'Team Vote', desc: 'Democracy in action \u2014 the team decides', color: '#3b82f6' },
  { hash: '8ball', title: 'Magic 8-Ball', desc: 'Shake the mystic orb for answers', color: '#6366f1' },
  { hash: 'dice', title: 'Dice Roll', desc: 'Roll for cuisine + budget, get a match', color: '#4ecdc4' },
  { hash: 'random', title: 'Quick Random', desc: 'No patience? Instant random pick', color: '#ff6b35' },
  { hash: 'map', title: 'Map Explorer', desc: 'Browse nearby spots on an interactive map', color: '#06b6d4' },
];

export function render() {
  const history = getHistory().slice(0, 3);
  const historyHtml = history.length ? `
    <div class="mt-4" style="max-width:600px;margin-left:auto;margin-right:auto;">
      <h3 style="font-size:13px;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">Recent Picks</h3>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
        ${history.map(h => {
          const r = restaurants.find(r => r.id === h.id) || h;
          return `<span class="chip">${r.name}</span>`;
        }).join('')}
      </div>
    </div>
  ` : '';

  return `
    <div class="page-header">
      <h1>Where are we eating?</h1>
      <p>Choose your method. ${restaurants.length} restaurants near 501 Pedernales St. All under $18.</p>
    </div>
    <div class="home-grid">
      ${cards.map(c => `
        <a class="home-card" href="#/${c.hash}">
          <div class="card-accent" style="background:${c.color};"></div>
          <h3>${c.title}</h3>
          <p>${c.desc}</p>
        </a>
      `).join('')}
    </div>
    ${historyHtml}
  `;
}

export function init() {}
