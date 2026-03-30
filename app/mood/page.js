'use client';

import { useState } from 'react';
import { restaurants, getCuisineColor } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const moods = [
  { label: 'Hangry', color: '#ef4444', tags: ['quick', 'cheap', 'hearty'], rx: 'Immediate food intervention required. Heavy carbs, stat.' },
  { label: 'Zen', color: '#22c55e', tags: ['healthy', 'light-lunch', 'chill'], rx: 'Something light and mindful. Feed the soul, not just the body.' },
  { label: 'Celebrating', color: '#a78bfa', tags: ['upscale', 'sit-down', 'creative'], rx: 'You deserve the best today. Treat yourself.' },
  { label: 'Stressed', color: '#f97316', tags: ['comfort', 'cozy', 'classic', 'cheap'], rx: 'Comfort food prescription. Something warm and familiar.' },
  { label: 'Adventurous', color: '#00d4ff', tags: ['unique', 'fusion', 'bold-flavors', 'creative'], rx: 'Time to try something completely new and exciting.' },
  { label: 'Lazy', color: '#eab308', tags: ['quick', 'cheap', 'street-food'], rx: 'Minimal effort, maximum satisfaction. Close and fast.' },
  { label: 'Healthy', color: '#10b981', tags: ['healthy', 'light-lunch', 'outdoor'], rx: 'Fuel that body. Clean eating, good choices.' },
  { label: 'Treat Myself', color: '#ec4899', tags: ['upscale', 'instagram', 'elegant'], rx: 'You only live once. Go fancy today.' },
  { label: 'Indecisive', color: '#6366f1', tags: [], rx: "Can't decide? Let us pick for you. Random it is." },
  { label: 'Date Vibes', color: '#f43f5e', tags: ['date-spot', 'sit-down', 'elegant'], rx: 'Impress someone special. Or just treat yourself royally.' },
  { label: 'Sunny Day', color: '#c8ff00', tags: ['outdoor', 'chill', 'casual'], rx: 'Perfect weather for a patio lunch.' },
  { label: 'Broke', color: '#64748b', tags: ['cheap', 'street-food', 'quick'], rx: 'Wallet on a diet? We got you covered.' },
];

function getMatches(mood) {
  if (mood.tags.length === 0) {
    return [...restaurants].sort(() => Math.random() - 0.5).slice(0, 3);
  }
  return restaurants
    .map(r => {
      let score = 0;
      mood.tags.forEach(tag => { if (r.tags.includes(tag)) score++; });
      if (r.vibe === 'upscale' && mood.tags.includes('upscale')) score += 2;
      if (r.price <= 12 && mood.tags.includes('cheap')) score += 2;
      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export default function MoodPage() {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [matches, setMatches] = useState([]);
  const [chosen, setChosen] = useState(null);

  function handleMoodClick(mood) {
    setSelectedMood(mood);
    setMatches(getMatches(mood));
    setStep(2);
  }

  function handlePick(restaurant) {
    saveHistory(restaurant);
    fireConfetti();
    setChosen(restaurant);
    setStep(3);
  }

  return (
    <>
      <div className="page-header">
        <h1>Mood Picker</h1>
        <p>How are you feeling? Dr. Lunch will prescribe the perfect meal.</p>
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
        <div className="mood-grid">
          {moods.map((m, i) => (
            <button key={i} className="mood-btn" onClick={() => handleMoodClick(m)}>
              <span
                className="mood-icon"
                style={{ background: m.color + '20', color: m.color }}
              >
                {m.label.charAt(0)}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {step === 2 && selectedMood && (
        <div className="page-enter" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 28,
              borderTop: `3px solid ${selectedMood.color}`,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 16 }}>Dr. Lunch</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Board Certified Food Therapist
              </p>
            </div>

            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 16 }}>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Diagnosis: {selectedMood.label}
              </p>
              <p
                style={{
                  fontSize: 15,
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  marginBottom: 20,
                }}
              >
                &ldquo;{selectedMood.rx}&rdquo;
              </p>
              <p
                style={{
                  fontWeight: 700,
                  marginBottom: 12,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'var(--text-muted)',
                }}
              >
                Prescription
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {matches.map(r => {
                  const color = getCuisineColor(r.cuisine);
                  return (
                    <div
                      key={r.id}
                      onClick={() => handlePick(r)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                        e.currentTarget.style.background = 'var(--bg-elevated)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = '';
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: color + '20',
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 15,
                          flexShrink: 0,
                        }}
                      >
                        {r.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {r.cuisine} / ${r.price} / {r.walkMinutes}min walk
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && chosen && (
        <div>
          <ResultCard restaurant={chosen} />
          <div className="text-center mt-4">
            <button className="btn btn-outline" onClick={() => { setStep(1); setSelectedMood(null); setMatches([]); setChosen(null); }}>
              Pick Another Mood
            </button>
            <a href="/" className="btn btn-ghost">Home</a>
          </div>
        </div>
      )}
    </>
  );
}
