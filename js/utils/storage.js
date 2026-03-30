const PREFIX = 'repackify_lunch_';

export function saveHistory(restaurant) {
  const history = getHistory();
  history.unshift({ ...restaurant, timestamp: Date.now() });
  if (history.length > 50) history.length = 50;
  localStorage.setItem(PREFIX + 'history', JSON.stringify(history));
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + 'history') || '[]');
  } catch { return []; }
}

export function toggleFavorite(restaurantId) {
  const favs = getFavorites();
  const idx = favs.indexOf(restaurantId);
  if (idx > -1) favs.splice(idx, 1);
  else favs.push(restaurantId);
  localStorage.setItem(PREFIX + 'favorites', JSON.stringify(favs));
  return idx === -1;
}

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + 'favorites') || '[]');
  } catch { return []; }
}

export function isFavorite(restaurantId) {
  return getFavorites().includes(restaurantId);
}
