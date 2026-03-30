'use client';

const PREFIX = 'repackify_lunch_';

export function saveHistory(restaurant) {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  history.unshift({ id: restaurant.id, name: restaurant.name, timestamp: Date.now() });
  if (history.length > 50) history.length = 50;
  localStorage.setItem(PREFIX + 'history', JSON.stringify(history));
}

export function getHistory() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PREFIX + 'history') || '[]'); } catch { return []; }
}

export function toggleFavorite(id) {
  if (typeof window === 'undefined') return false;
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx > -1) favs.splice(idx, 1); else favs.push(id);
  localStorage.setItem(PREFIX + 'favorites', JSON.stringify(favs));
  return idx === -1;
}

export function getFavorites() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PREFIX + 'favorites') || '[]'); } catch { return []; }
}

export function isFavorite(id) { return getFavorites().includes(id); }
