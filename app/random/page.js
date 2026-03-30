'use client';

import { useState, useRef, useCallback } from 'react';
import { restaurants, cuisines, getRandom } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const priceFilters = [
  { label: 'Any', value: 0 },
  { label: 'Under $9', value: 9 },
  { label: 'Under $12', value: 12 },
  { label: 'Under $15', value: 15 },
];

export default function RandomPage() {
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [displayName, setDisplayName] = useState('?');
  const [result, setResult] = useState(null);
  const [rerollCount, setRerollCount] = useState(0);
  const timeoutRef = useRef(null);

  const getFiltered = useCallback(() => {
    return restaurants.filter((r) => {
      const cuisineMatch = selectedCuisine === 'All' || r.cuisine === selectedCuisine;
      const priceMatch = selectedPrice === 0 || r.price < selectedPrice;
      return cuisineMatch && priceMatch;
    });
  }, [selectedCuisine, selectedPrice]);

  function handleSpin() {
    const filtered = getFiltered();
    if (filtered.length === 0) return;

    if (result) {
      setRerollCount((c) => c + 1);
    }

    setSpinning(true);
    setResult(null);

    const totalTicks = 30;
    let tick = 0;

    function doTick() {
      if (tick < totalTicks) {
        const r = getRandom(filtered);
        setDisplayName(r.name);
        tick++;
        const delay = 30 + (170 * (tick / totalTicks));
        timeoutRef.current = setTimeout(doTick, delay);
      } else {
        const winner = getRandom(filtered);
        setDisplayName(winner.name);
        setSpinning(false);
        setResult(winner);
        saveHistory(winner);
        fireConfetti();
      }
    }

    doTick();
  }

  function handleReset() {
    setResult(null);
    setDisplayName('?');
    setRerollCount(0);
    setSelectedCuisine('All');
    setSelectedPrice(0);
  }

  const filtered = getFiltered();

  return (
    <div className="page-container">
      <h1 className="page-title">Random Pick</h1>
      <p className="page-subtitle">Let fate decide your lunch</p>

      {/* Cuisine filter chips */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Cuisine</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['All', ...cuisines].map((c) => (
            <button
              key={c}
              className={`chip${selectedCuisine === c ? ' chip-active' : ''}`}
              onClick={() => { setSelectedCuisine(c); setResult(null); setDisplayName('?'); }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price filter chips */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Price</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {priceFilters.map((p) => (
            <button
              key={p.label}
              className={`chip${selectedPrice === p.value ? ' chip-active' : ''}`}
              onClick={() => { setSelectedPrice(p.value); setResult(null); setDisplayName('?'); }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Randomizer display */}
      <div
        className="randomizer-display"
        style={{
          textAlign: 'center',
          fontSize: 28,
          fontWeight: 700,
          padding: '32px 16px',
          marginBottom: 24,
          background: 'var(--card)',
          borderRadius: 16,
          border: '2px solid var(--border)',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.1s ease',
        }}
      >
        {displayName}
      </div>

      {/* Feed me button */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={handleSpin}
          disabled={spinning || filtered.length === 0}
          style={{ fontSize: 18, padding: '14px 32px' }}
        >
          {spinning ? 'Choosing...' : 'FEED ME'}
        </button>
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No restaurants match these filters. Try adjusting.
        </p>
      )}

      {/* Shame counter */}
      {rerollCount > 0 && !spinning && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          {rerollCount === 1 && "Re-rolled once. Getting picky, are we?"}
          {rerollCount === 2 && "Re-rolled twice. Just pick something!"}
          {rerollCount >= 3 && `Re-rolled ${rerollCount} times. At this point, you should just stay in.`}
        </p>
      )}

      {/* Result */}
      {result && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <ResultCard restaurant={result} />
        </div>
      )}

      {result && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="btn btn-outline" onClick={handleReset}>
            Start Over
          </button>
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
