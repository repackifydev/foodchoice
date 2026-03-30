'use client';

import { useState, useRef } from 'react';
import { restaurants, cuisines, getCuisineColor, getRandom } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const cuisineFaces = cuisines.slice(0, 6);
const budgetFaces = ['<$9', '<$10', '<$12', '<$15', '<$18', 'Any $'];
const priceMap = { '<$9': 9, '<$10': 10, '<$12': 12, '<$15': 15, '<$18': 18, 'Any $': 0 };

function getInverseRotation(faceIndex) {
  const rotations = [
    'rotateY(0deg)',       // face 1 - front
    'rotateY(180deg)',     // face 2 - back
    'rotateY(-90deg)',     // face 3 - right
    'rotateY(90deg)',      // face 4 - left
    'rotateX(-90deg)',     // face 5 - top
    'rotateX(90deg)',      // face 6 - bottom
  ];
  return rotations[faceIndex] || rotations[0];
}

export default function DicePage() {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [rolledCuisine, setRolledCuisine] = useState(null);
  const [rolledBudget, setRolledBudget] = useState(null);
  const [cuisineTransform, setCuisineTransform] = useState('');
  const [budgetTransform, setBudgetTransform] = useState('');
  const [noMatch, setNoMatch] = useState(false);
  const cuisineCubeRef = useRef(null);
  const budgetCubeRef = useRef(null);

  function handleRoll() {
    if (rolling) return;
    setRolling(true);
    setResult(null);
    setNoMatch(false);
    setCuisineTransform('');
    setBudgetTransform('');

    const cuisineIdx = Math.floor(Math.random() * cuisineFaces.length);
    const budgetIdx = Math.floor(Math.random() * budgetFaces.length);
    const cuisine = cuisineFaces[cuisineIdx];
    const budget = budgetFaces[budgetIdx];

    setTimeout(() => {
      setCuisineTransform(getInverseRotation(cuisineIdx));
      setBudgetTransform(getInverseRotation(budgetIdx));
      setRolledCuisine(cuisine);
      setRolledBudget(budget);
      setRolling(false);

      const maxPrice = priceMap[budget];
      const matches = restaurants.filter((r) => {
        const cuisineMatch = r.cuisine === cuisine;
        const priceMatch = maxPrice === 0 || r.price <= maxPrice;
        return cuisineMatch && priceMatch;
      });

      if (matches.length > 0) {
        const pick = getRandom(matches);
        saveHistory(pick);
        fireConfetti();
        setResult(pick);
      } else {
        setNoMatch(true);
      }
    }, 1500);
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Dice Roll</h1>
      <p className="page-subtitle">Roll for cuisine &amp; budget</p>

      <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
        {/* Cuisine Die */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Cuisine</p>
          <div className="dice-scene">
            <div
              ref={cuisineCubeRef}
              className={`dice-cube${rolling ? ' rolling' : ''}`}
              style={!rolling && cuisineTransform ? { transform: cuisineTransform } : undefined}
            >
              {cuisineFaces.map((face, i) => (
                <div
                  key={face}
                  className={`dice-face dice-face-${i + 1}`}
                  style={{ background: getCuisineColor(face) + '22', color: getCuisineColor(face) }}
                >
                  {face}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Die */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Budget</p>
          <div className="dice-scene">
            <div
              ref={budgetCubeRef}
              className={`dice-cube${rolling ? ' rolling' : ''}`}
              style={!rolling && budgetTransform ? { transform: budgetTransform } : undefined}
            >
              {budgetFaces.map((face, i) => (
                <div key={face} className={`dice-face dice-face-${i + 1}`}>
                  {face}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={handleRoll} disabled={rolling}>
          {rolling ? 'Rolling...' : 'Roll the Dice'}
        </button>
      </div>

      {rolledCuisine && rolledBudget && !rolling && (
        <p style={{ textAlign: 'center', marginBottom: 16, color: 'var(--text-muted)' }}>
          Rolled: <strong>{rolledCuisine}</strong> + <strong>{rolledBudget}</strong>
        </p>
      )}

      {noMatch && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>
          No restaurants match that combo. Roll again!
        </p>
      )}

      {result && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ResultCard restaurant={result} />
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
