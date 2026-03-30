'use client';

import { useState, useRef } from 'react';
import { restaurants, getRandom } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const responses = [
  'Signs point to',
  'Without a doubt',
  'The stars say',
  'My sources say',
  'It is certain',
  'The oracle reveals',
  'Outlook good for',
  'Yes, definitely go to',
  'Ask again after coffee... but probably',
  'The spirits whisper',
];

export default function EightBallPage() {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [shaking, setShaking] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [response, setResponse] = useState('');
  const timeoutRef = useRef(null);

  function handleAsk() {
    if (!question.trim()) return;
    const pick = getRandom(restaurants);
    const phrase = responses[Math.floor(Math.random() * responses.length)];
    setRestaurant(pick);
    setResponse(phrase);
    setRevealed(false);
    setStep(2);
  }

  function handleBallClick() {
    if (shaking || revealed) return;
    setShaking(true);

    timeoutRef.current = setTimeout(() => {
      setShaking(false);
      setRevealed(true);

      setTimeout(() => {
        saveHistory(restaurant);
        fireConfetti();
        setStep(3);
      }, 1500);
    }, 800);
  }

  function handleReset() {
    setStep(1);
    setQuestion('');
    setShaking(false);
    setRevealed(false);
    setRestaurant(null);
    setResponse('');
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Magic 8-Ball</h1>
      <p className="page-subtitle">Ask the oracle where to eat</p>

      {step === 1 && (
        <div className="step-container" style={{ textAlign: 'center' }}>
          <input
            type="text"
            className="text-input"
            placeholder="Where should I eat today?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '12px 16px',
              fontSize: 16,
              borderRadius: 12,
              border: '2px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              marginBottom: 16,
            }}
          />
          <br />
          <button className="btn btn-primary" onClick={handleAsk}>
            Ask the 8-Ball
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step-container" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
            &ldquo;{question}&rdquo;
          </p>
          <p style={{ marginBottom: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Tap the ball to reveal your destiny...
          </p>
          <div
            className={`eight-ball${shaking ? ' shaking' : ''}`}
            onClick={handleBallClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="eight-ball-window">
              <div className={`eight-ball-text${revealed ? ' visible' : ''}`}>
                {restaurant?.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && restaurant && (
        <div className="step-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 20, marginBottom: 24 }}>
            {response}... <strong>{restaurant.name}</strong>
          </p>
          <ResultCard restaurant={restaurant} />
          <button
            className="btn btn-outline"
            onClick={handleReset}
            style={{ marginTop: 16 }}
          >
            Ask Again
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
