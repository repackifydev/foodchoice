'use client';

import { useState, useMemo } from 'react';
import { restaurants, getCuisineColor } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const walkFilters = [
  { label: 'Any time', value: 99 },
  { label: 'Under 8 min', value: 8 },
  { label: 'Under 15 min', value: 15 },
];

export default function BudgetPage() {
  const [step, setStep] = useState(1);
  const [maxPrice, setMaxPrice] = useState(12);
  const [maxDelivery, setMaxWalk] = useState(99);
  const [chosen, setChosen] = useState(null);

  const filtered = useMemo(
    () => restaurants.filter(r => r.price <= maxPrice && r.deliveryMinutes <= maxDelivery),
    [maxPrice, maxDelivery]
  );

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.price - b.price),
    [filtered]
  );

  function handlePick(restaurant) {
    saveHistory(restaurant);
    fireConfetti();
    setChosen(restaurant);
    setStep(3);
  }

  return (
    <>
      <div className="page-header">
        <h1>Budget Slider</h1>
        <p>Slide to your budget and discover what&apos;s in range</p>
      </div>

      <div className="steps">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`step-dot${s === step ? ' active' : ''}${s < step ? ' done' : ''}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <div className="budget-slider-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              <span>Broke until payday</span>
              <span>Feeling generous</span>
            </div>

            <input
              type="range"
              className="budget-slider"
              min={5}
              max={18}
              step={1}
              value={maxPrice}
              onChange={e => setMaxPrice(parseInt(e.target.value))}
            />

            <div className="budget-display">${maxPrice}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
              <span>$5</span><span>$8</span><span>$10</span><span>$12</span><span>$15</span><span>$25</span>
            </div>
          </div>

          <p className="text-center mb-2" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} in budget
          </p>

          <p className="text-center" style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 13 }}>
            Delivery time:
          </p>

          <div className="filter-chips">
            {walkFilters.map(f => (
              <button
                key={f.value}
                className={`chip${maxDelivery === f.value ? ' selected' : ''}`}
                onClick={() => setMaxWalk(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-center mt-4">
            <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
              Show Restaurants
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {sorted.length === 0 ? (
            <div className="text-center">
              <h2>No matches</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                Try increasing your budget or walk distance.
              </p>
            </div>
          ) : (
            <>
              <p className="text-center mb-4" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {sorted.length} restaurants under ${maxPrice}
              </p>
              <div className="home-grid">
                {sorted.map(r => {
                  const color = getCuisineColor(r.cuisine);
                  return (
                    <div
                      key={r.id}
                      className="home-card budget-pick"
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => handlePick(r)}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: color + '20',
                          color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                          marginBottom: 8,
                        }}
                      >
                        {r.name.charAt(0)}
                      </div>
                      <h3>{r.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {r.cuisine} / ${r.price} / {r.deliveryMinutes}min
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="text-center mt-4">
            <button className="btn btn-outline" onClick={() => setStep(1)}>
              Adjust Budget
            </button>
          </div>
        </div>
      )}

      {step === 3 && chosen && (
        <div>
          <ResultCard restaurant={chosen} />
          <div className="text-center mt-4">
            <button className="btn btn-outline" onClick={() => setStep(2)}>
              Back to List
            </button>
            <a href="/" className="btn btn-ghost">Home</a>
          </div>
        </div>
      )}
    </>
  );
}
