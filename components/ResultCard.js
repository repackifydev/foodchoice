'use client';
import { useState } from 'react';
import { getCuisineColor } from '@/lib/restaurants';
import { toggleFavorite, isFavorite } from '@/lib/storage';

export default function ResultCard({ restaurant: r }) {
  const [fav, setFav] = useState(() => isFavorite(r.id));
  const color = getCuisineColor(r.cuisine);

  return (
    <div className="result-card">
      <div className="result-badge" style={{ background: color + '20', color }}>{r.name.charAt(0)}</div>
      <h2>{r.name}</h2>
      <span className="cuisine-tag">{r.cuisine} / ${r.price} per person</span>
      <div className="meta">
        <span>{r.walkMinutes} min walk</span>
        <span>{r.rating} stars</span>
      </div>
      <p className="description">{r.description}</p>
      <div className="dishes">
        {r.popularDishes.map(d => <span key={d} className="dish-tag">{d}</span>)}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{r.address}</p>
      <div className="result-actions">
        <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-green btn-sm">Directions</a>
        <button className="btn btn-outline btn-sm" onClick={() => { const added = toggleFavorite(r.id); setFav(added); }}>
          {fav ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
