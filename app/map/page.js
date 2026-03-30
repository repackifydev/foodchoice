'use client';

import { useState, useMemo } from 'react';
import { restaurants, getCuisineColor } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const positions = {
  'la-barbecue': { x: 72, y: 62 },
  'via-313': { x: 53, y: 41 },
  'nixta-taqueria': { x: 75, y: 18 },
  'ramen-tatsuya': { x: 45, y: 42 },
  'discada': { x: 48, y: 58 },
  'joes-bakery': { x: 68, y: 32 },
  'juan-in-a-million': { x: 70, y: 60 },
  'el-pollo-rey': { x: 66, y: 60 },
  'buenos-aires-cafe': { x: 32, y: 42 },
  'tamale-house-east': { x: 50, y: 40 },
  'revelry': { x: 40, y: 42 },
  'oko': { x: 36, y: 42 },
  'li-neighborhood': { x: 56, y: 38 },
  'cenote': { x: 25, y: 58 },
  'paperboy': { x: 33, y: 43 },
  'veracruz-all-natural': { x: 49, y: 57 },
  'pueblo-viejo': { x: 44, y: 58 },
  'salt-and-time': { x: 58, y: 33 },
  'counter-cafe': { x: 12, y: 40 },
  'eastside-king': { x: 47, y: 41 },
  'patrizis': { x: 68, y: 28 },
  'sour-duck-market': { x: 55, y: 15 },
  'cuantos-tacos': { x: 30, y: 20 },
  'buzz-mill': { x: 42, y: 52 },
  'flyrite': { x: 42, y: 58 },
  'mi-madre': { x: 65, y: 28 },
  'swedish-hill': { x: 32, y: 22 },
  'vacancy-brewing': { x: 18, y: 48 },
  'p-terrys': { x: 10, y: 60 },
  'torchys-tacos': { x: 14, y: 68 },
  'tacodeli': { x: 8, y: 72 },
  'chilantro': { x: 16, y: 70 },
  'taquero-mucho': { x: 17, y: 71 },
  'halal-bros': { x: 73, y: 60 },
  'pho-phong-luu': { x: 92, y: 8 },
  'tumble-22': { x: 44, y: 40 },
  'whataburger': { x: 22, y: 56 },
  'raising-canes': { x: 20, y: 74 },
  'bouldin-creek-cafe': { x: 12, y: 72 },
  'rositas-al-pastor': { x: 58, y: 32 },
  'popeyes': { x: 30, y: 34 },
  'phoebe': { x: 10, y: 10 },
  'con-todo': { x: 62, y: 58 },
  'little-deli': { x: 90, y: 5 },
  'seoulju': { x: 72, y: 58 },
  'wow-poke': { x: 24, y: 56 },
  'clay-pit': { x: 10, y: 35 },
  'bombay-dhaba': { x: 64, y: 58 },
  'pupuseria-chapina': { x: 60, y: 32 },
  'arpeggio-grill': { x: 88, y: 12 },
  'pluckers': { x: 8, y: 30 },
  'wingstop': { x: 32, y: 32 },
  'quality-seafood': { x: 85, y: 15 },
  'thundercloud-subs': { x: 12, y: 44 },
  'which-wich': { x: 56, y: 15 },
  'taste-of-ethiopia': { x: 94, y: 5 },
  'shanghai-noodle': { x: 92, y: 3 },
  'ms-ps': { x: 57, y: 18 },
  'grannys-tacos': { x: 50, y: 33 },
  'santis-ices': { x: 66, y: 58 },
  'the-league': { x: 16, y: 55 },
};

const priceFilters = [
  { label: 'All', value: 0 },
  { label: 'Under $9', value: 9 },
  { label: 'Under $12', value: 12 },
  { label: 'Under $15', value: 15 },
];

export default function MapPage() {
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (!positions[r.id]) return false;
      if (selectedPrice === 0) return true;
      return r.price < selectedPrice;
    });
  }, [selectedPrice]);

  function handlePinClick(restaurant) {
    setSelectedRestaurant(restaurant);
    saveHistory(restaurant);
    fireConfetti();
  }

  const hoveredRestaurant = hoveredId
    ? restaurants.find((r) => r.id === hoveredId)
    : null;

  return (
    <div className="page-container">
      <h1 className="page-title">Map Explorer</h1>
      <p className="page-subtitle">Find lunch spots near the office</p>

      {/* Price filter chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {priceFilters.map((p) => (
            <button
              key={p.label}
              className={`chip${selectedPrice === p.value ? ' chip-active' : ''}`}
              onClick={() => { setSelectedPrice(p.value); setSelectedRestaurant(null); }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '75%',
          background: 'var(--card)',
          borderRadius: 16,
          border: '2px solid var(--border)',
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        {/* SVG grid background with streets */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
        >
          {/* Street grid lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border)" strokeWidth="0.3" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="var(--border)" strokeWidth="0.3" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="var(--border)" strokeWidth="0.3" />
          <line x1="20" y1="0" x2="20" y2="80" stroke="var(--border)" strokeWidth="0.15" />
          <line x1="40" y1="0" x2="40" y2="80" stroke="var(--border)" strokeWidth="0.15" />
          <line x1="60" y1="0" x2="60" y2="80" stroke="var(--border)" strokeWidth="0.15" />
          <line x1="80" y1="0" x2="80" y2="80" stroke="var(--border)" strokeWidth="0.15" />

          {/* Street labels */}
          <text x="2" y="19" fill="var(--text-muted)" fontSize="2.2" opacity="0.6">E 12th St</text>
          <text x="2" y="39" fill="var(--text-muted)" fontSize="2.2" opacity="0.6">E 6th St</text>
          <text x="2" y="59" fill="var(--text-muted)" fontSize="2.2" opacity="0.6">E Cesar Chavez</text>

          {/* Office marker */}
          <rect x="48" y="44" width="6" height="4" rx="0.5" fill="var(--primary)" opacity="0.9" />
          <text x="51" y="47" fill="white" fontSize="2" textAnchor="middle" fontWeight="bold">OFFICE</text>
        </svg>

        {/* Restaurant pins */}
        {filtered.map((r) => {
          const pos = positions[r.id];
          if (!pos) return null;
          const color = getCuisineColor(r.cuisine);
          const isHovered = hoveredId === r.id;
          const isSelected = selectedRestaurant?.id === r.id;

          return (
            <div
              key={r.id}
              onMouseEnter={() => setHoveredId(r.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handlePinClick(r)}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isHovered || isSelected ? 20 : 10,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: isHovered || isSelected ? 16 : 12,
                  height: isHovered || isSelected ? 16 : 12,
                  borderRadius: '50%',
                  background: color,
                  border: `2px solid ${isSelected ? 'white' : isHovered ? 'white' : color}`,
                  boxShadow: isHovered || isSelected
                    ? `0 0 8px ${color}88`
                    : `0 1px 3px rgba(0,0,0,0.3)`,
                  transition: 'all 0.15s ease',
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '120%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    whiteSpace: 'nowrap',
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    pointerEvents: 'none',
                  }}
                >
                  <strong>{r.name}</strong>
                  <br />
                  <span style={{ color: 'var(--text-muted)' }}>
                    {r.cuisine} &middot; ${r.price} &middot; {r.walkMinutes}min
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hovered info bar */}
      {hoveredRestaurant && !selectedRestaurant && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>
          Click to select <strong>{hoveredRestaurant.name}</strong>
        </p>
      )}

      {/* Selected restaurant result */}
      {selectedRestaurant && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResultCard restaurant={selectedRestaurant} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              className="btn btn-outline"
              onClick={() => setSelectedRestaurant(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <canvas
        id="confetti-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
    </div>
  );
}
