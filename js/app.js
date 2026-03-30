import { restaurants } from './data/restaurants.js';
import { saveHistory, isFavorite, toggleFavorite } from './utils/storage.js';
import { confetti } from './utils/animations.js';

const pages = {};
let currentDestroy = null;

const routes = [
  { hash: '', name: 'Home' },
  { hash: 'spin', name: 'Wheel' },
  { hash: 'swipe', name: 'Swipe' },
  { hash: 'bracket', name: 'Bracket' },
  { hash: 'slots', name: 'Slots' },
  { hash: 'quiz', name: 'Quiz' },
  { hash: 'mood', name: 'Mood' },
  { hash: 'budget', name: 'Budget' },
  { hash: 'vote', name: 'Vote' },
  { hash: '8ball', name: '8-Ball' },
  { hash: 'dice', name: 'Dice' },
  { hash: 'random', name: 'Random' },
  { hash: 'map', name: 'Map' },
];

const cuisineColors = {
  'BBQ': '#f97316', 'Mexican': '#22c55e', 'Pizza': '#ef4444',
  'Japanese': '#ec4899', 'Caribbean': '#14b8a6', 'Japanese-BBQ': '#f43f5e',
  'Italian': '#a855f7', 'Tex-Mex': '#eab308', 'American': '#3b82f6',
  'Argentine': '#06b6d4', 'Filipino': '#f59e0b', 'Chinese': '#e11d48',
  'Cafe': '#84cc16', 'Asian-BBQ': '#d946ef', 'Thai': '#10b981',
};

function getCuisineColor(cuisine) {
  return cuisineColors[cuisine] || '#c8ff00';
}

function buildNav() {
  const navLinks = document.getElementById('nav-links');
  navLinks.innerHTML = routes.map(r =>
    `<a class="nav-link" data-hash="${r.hash}" href="#/${r.hash}">${r.name}</a>`
  ).join('');

  document.getElementById('nav-menu-btn').addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
}

function updateActiveNav(hash) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.hash === hash);
  });
}

async function loadPage(hash) {
  if (currentDestroy) { currentDestroy(); currentDestroy = null; }

  const container = document.getElementById('app-content');
  container.innerHTML = '';
  container.className = 'app-container page-enter';

  const pageName = hash || 'home';
  if (!pages[pageName]) {
    try {
      pages[pageName] = await import(`./pages/${pageName}.js`);
    } catch (e) {
      container.innerHTML = `<div class="page-header"><h1>Page not found</h1><p>${e.message}</p></div>`;
      return;
    }
  }

  const page = pages[pageName];
  container.innerHTML = page.render();
  if (page.init) {
    currentDestroy = page.init(container) || null;
  }
  updateActiveNav(hash);
  window.scrollTo(0, 0);
}

function onHashChange() {
  const hash = window.location.hash.replace('#/', '');
  loadPage(hash);
}

window.app = {
  restaurants,
  saveHistory,
  isFavorite,
  toggleFavorite,
  confetti,
  getCuisineColor,
  renderResultCard(r, extra = '') {
    const fav = isFavorite(r.id);
    const color = getCuisineColor(r.cuisine);
    return `
      <div class="result-card">
        <div class="result-badge" style="background:${color}20;color:${color};">
          ${r.name.charAt(0)}
        </div>
        <h2>${r.name}</h2>
        <span class="cuisine-tag">${r.cuisine} / $${r.price} per person</span>
        <div class="meta">
          <span>${r.walkMinutes} min walk</span>
          <span>${r.rating} stars</span>
        </div>
        <p class="description">${r.description}</p>
        <div class="dishes">
          ${r.popularDishes.map(d => `<span class="dish-tag">${d}</span>`).join('')}
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">${r.address}</p>
        ${extra}
        <div class="result-actions">
          <a href="${r.googleMapsUrl}" target="_blank" class="btn btn-green btn-sm">Directions</a>
          <button class="btn btn-outline btn-sm fav-btn" data-id="${r.id}">
            ${fav ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  onHashChange();

  document.addEventListener('click', e => {
    if (e.target.closest('.fav-btn')) {
      const btn = e.target.closest('.fav-btn');
      const id = btn.dataset.id;
      const added = toggleFavorite(id);
      btn.innerHTML = added ? 'Saved' : 'Save';
    }
  });
});

window.addEventListener('hashchange', onHashChange);
