'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { restaurants, shuffle, getCuisineColor } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

export default function BracketPage() {
  const [size, setSize] = useState(null);          // 8 or 16
  const [round, setRound] = useState([]);           // current round contenders
  const [winners, setWinners] = useState([]);        // winners accumulating this round
  const [matchIdx, setMatchIdx] = useState(0);       // index into round (by pairs)
  const [roundNum, setRoundNum] = useState(1);
  const [champion, setChampion] = useState(null);
  const [selected, setSelected] = useState(null);    // id of card just picked (for animation)

  const startBracket = useCallback((count) => {
    const picked = shuffle(restaurants).slice(0, count);
    setSize(count);
    setRound(picked);
    setWinners([]);
    setMatchIdx(0);
    setRoundNum(1);
    setChampion(null);
    setSelected(null);
  }, []);

  const pick = useCallback((winner) => {
    setSelected(winner.id);

    setTimeout(() => {
      const newWinners = [...winners, winner];
      const nextMatchIdx = matchIdx + 2;

      if (nextMatchIdx >= round.length) {
        // End of this round
        if (newWinners.length === 1) {
          // We have a champion!
          setChampion(newWinners[0]);
          saveHistory(newWinners[0]);
          setTimeout(() => fireConfetti(), 100);
        } else {
          // Start next round
          setRound(newWinners);
          setWinners([]);
          setMatchIdx(0);
          setRoundNum((r) => r + 1);
        }
      } else {
        setWinners(newWinners);
        setMatchIdx(nextMatchIdx);
      }
      setSelected(null);
    }, 600);
  }, [round, winners, matchIdx]);

  const reset = () => {
    setSize(null);
    setRound([]);
    setWinners([]);
    setMatchIdx(0);
    setRoundNum(1);
    setChampion(null);
    setSelected(null);
  };

  // --- Pick size ---
  if (!size) {
    return (
      <>
        <div className="page-header">
          <Link href="/" className="back-link">Home</Link>
          <h1>Tournament Bracket</h1>
          <p>Head-to-head battles until one restaurant is crowned champion.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32 }}>
          <button className="btn btn-orange" onClick={() => startBracket(8)}>
            8 Restaurants
          </button>
          <button className="btn btn-green" onClick={() => startBracket(16)}>
            16 Restaurants
          </button>
        </div>
      </>
    );
  }

  // --- Champion ---
  if (champion) {
    return (
      <>
        <canvas id="confetti-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }} />
        <div className="page-header">
          <Link href="/" className="back-link">Home</Link>
          <h1>Champion!</h1>
          <p>After {roundNum} rounds, the winner is clear.</p>
        </div>
        <ResultCard restaurant={champion} />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn btn-orange" onClick={reset}>Play Again</button>
        </div>
      </>
    );
  }

  // --- Matchup ---
  const a = round[matchIdx];
  const b = round[matchIdx + 1];
  const totalMatches = round.length / 2;
  const currentMatch = matchIdx / 2 + 1;

  const roundLabel = round.length === 2
    ? 'Final'
    : round.length === 4
      ? 'Semifinals'
      : `Round ${roundNum}`;

  return (
    <>
      <div className="page-header">
        <Link href="/" className="back-link">Home</Link>
        <h1>Tournament Bracket</h1>
        <p>{roundLabel} &mdash; Match {currentMatch} of {totalMatches}</p>
      </div>

      <div className="bracket-progress" style={{ textAlign: 'center', marginBottom: 16 }}>
        <span className="chip">{round.length} remaining</span>
      </div>

      <div className="bracket-matchup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Card A */}
        <div
          className={`bracket-card${selected === a.id ? ' selected' : ''}${selected && selected !== a.id ? ' eliminated' : ''}`}
          onClick={() => !selected && pick(a)}
          style={{
            cursor: selected ? 'default' : 'pointer',
            border: `2px solid ${getCuisineColor(a.cuisine)}`,
            borderRadius: 16,
            padding: 24,
            width: 260,
            textAlign: 'center',
            background: selected === a.id ? getCuisineColor(a.cuisine) + '18' : 'var(--bg-card)',
            opacity: selected && selected !== a.id ? 0.4 : 1,
            transform: selected === a.id ? 'scale(1.05)' : selected && selected !== a.id ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: getCuisineColor(a.cuisine), marginBottom: 8 }}>
            {a.name.charAt(0)}
          </div>
          <h3 style={{ marginBottom: 4 }}>{a.name}</h3>
          <span className="cuisine-tag">{a.cuisine} / ${a.price}</span>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{a.description}</p>
          <div className="dishes" style={{ marginTop: 8 }}>
            {a.popularDishes.slice(0, 2).map(d => <span key={d} className="dish-tag">{d}</span>)}
          </div>
        </div>

        {/* VS badge */}
        <div className="vs-badge" style={{
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--text-muted)',
          background: 'var(--bg-card)',
          border: '2px solid var(--border)',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          VS
        </div>

        {/* Card B */}
        <div
          className={`bracket-card${selected === b.id ? ' selected' : ''}${selected && selected !== b.id ? ' eliminated' : ''}`}
          onClick={() => !selected && pick(b)}
          style={{
            cursor: selected ? 'default' : 'pointer',
            border: `2px solid ${getCuisineColor(b.cuisine)}`,
            borderRadius: 16,
            padding: 24,
            width: 260,
            textAlign: 'center',
            background: selected === b.id ? getCuisineColor(b.cuisine) + '18' : 'var(--bg-card)',
            opacity: selected && selected !== b.id ? 0.4 : 1,
            transform: selected === b.id ? 'scale(1.05)' : selected && selected !== b.id ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: getCuisineColor(b.cuisine), marginBottom: 8 }}>
            {b.name.charAt(0)}
          </div>
          <h3 style={{ marginBottom: 4 }}>{b.name}</h3>
          <span className="cuisine-tag">{b.cuisine} / ${b.price}</span>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{b.description}</p>
          <div className="dishes" style={{ marginTop: 8 }}>
            {b.popularDishes.slice(0, 2).map(d => <span key={d} className="dish-tag">{d}</span>)}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="btn btn-outline btn-sm" onClick={reset}>Start Over</button>
      </div>
    </>
  );
}
