'use client';

import { useState, useMemo } from 'react';
import { restaurants, getCuisineColor, shuffle } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const BAR_COLORS = ['#ff6b35', '#f7c948', '#4ecdc4', '#a78bfa', '#ff6b6b', '#3b82f6'];
const MAX_VOTES_PER_PERSON = 3;

export default function VotePage() {
  const [step, setStep] = useState(1);
  const [nominees, setNominees] = useState([]);
  const [votes, setVotes] = useState({});
  const [voterNum, setVoterNum] = useState(1);
  const [currentVotes, setCurrentVotes] = useState([]);

  const shuffled = useMemo(() => shuffle([...restaurants]), []);

  /* ---- Step 1: Nominate ---- */
  function toggleNominee(id) {
    setNominees(prev => {
      if (prev.includes(id)) return prev.filter(n => n !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  }

  function startVoting() {
    const initial = {};
    nominees.forEach(id => { initial[id] = 0; });
    setVotes(initial);
    setVoterNum(1);
    setCurrentVotes([]);
    setStep(2);
  }

  /* ---- Step 2: Vote ---- */
  function toggleVote(id) {
    setCurrentVotes(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (prev.length >= MAX_VOTES_PER_PERSON) return prev;
      return [...prev, id];
    });
  }

  function submitVotes() {
    setVotes(prev => {
      const next = { ...prev };
      currentVotes.forEach(id => { next[id] = (next[id] || 0) + 1; });
      return next;
    });
    setStep(3);
  }

  function finishVoting() {
    setStep(3);
  }

  function nextVoter() {
    setVoterNum(v => v + 1);
    setCurrentVotes([]);
    setStep(2);
  }

  /* ---- Step 3: Results ---- */
  const sortedResults = useMemo(() => {
    return nominees
      .map(id => {
        const r = restaurants.find(r => r.id === id);
        return { ...r, votes: votes[id] || 0 };
      })
      .sort((a, b) => b.votes - a.votes);
  }, [nominees, votes]);

  const maxV = Math.max(...sortedResults.map(s => s.votes), 1);

  /* ---- Step 4: Winner ---- */
  function announceWinner() {
    const winner = sortedResults[0];
    if (winner) {
      saveHistory(winner);
      fireConfetti();
    }
    setStep(4);
  }

  const winner = sortedResults[0] || null;

  return (
    <>
      <div className="page-header">
        <h1>Team Vote</h1>
        <p>Nominate restaurants and let the team decide.</p>
      </div>

      <div className="steps">
        {[1, 2, 3, 4].map(s => (
          <div
            key={s}
            className={`step-dot${s === step ? ' active' : ''}${s < step ? ' done' : ''}`}
          />
        ))}
      </div>

      {/* ---- Step 1: Nominate ---- */}
      {step === 1 && (
        <div>
          <p className="text-center mb-4" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Select 4&ndash;6 nominees
          </p>
          <div className="home-grid">
            {shuffled.map(r => {
              const color = getCuisineColor(r.cuisine);
              const selected = nominees.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="home-card vote-nom"
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderColor: selected ? 'var(--accent)' : 'var(--border)',
                    background: selected ? 'var(--accent-dim)' : 'var(--bg-card)',
                  }}
                  onClick={() => toggleNominee(r.id)}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: color + '20',
                      color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <h3 style={{ fontSize: 14 }}>{r.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.cuisine}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <button
              className="btn btn-primary btn-lg"
              disabled={nominees.length < 4}
              onClick={startVoting}
            >
              {nominees.length < 4
                ? `Pick ${4 - nominees.length} more`
                : `Start Voting (${nominees.length})`}
            </button>
          </div>
        </div>
      )}

      {/* ---- Step 2: Voter screen ---- */}
      {step === 2 && (
        <div>
          <div className="text-center mb-4">
            <h2>Voter {voterNum}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              You have <strong>{MAX_VOTES_PER_PERSON - currentVotes.length}</strong> votes
            </p>
          </div>
          <div className="home-grid" style={{ maxWidth: 660, margin: '0 auto' }}>
            {nominees.map(id => {
              const r = restaurants.find(r => r.id === id);
              if (!r) return null;
              const color = getCuisineColor(r.cuisine);
              const picked = currentVotes.includes(id);
              return (
                <div
                  key={id}
                  className="home-card vote-option"
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderColor: picked ? 'var(--accent-2)' : 'var(--border)',
                    background: picked ? 'rgba(0,212,255,0.08)' : 'var(--bg-card)',
                  }}
                  onClick={() => toggleVote(id)}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: color + '20',
                      color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <h3 style={{ fontSize: 14 }}>{r.name}</h3>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <button
              className="btn btn-green"
              disabled={currentVotes.length === 0}
              onClick={submitVotes}
            >
              Submit Votes
            </button>
            <button className="btn btn-ghost" onClick={finishVoting}>
              Finish Voting
            </button>
          </div>
        </div>
      )}

      {/* ---- Step 3: Bar chart results ---- */}
      {step === 3 && (
        <div>
          <h2 className="text-center mb-4">Results</h2>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {sortedResults.map((r, i) => (
              <div
                key={r.id}
                className="vote-bar-wrap page-enter"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="vote-bar-label">
                  <span>{r.name}</span>
                  <span>{r.votes}</span>
                </div>
                <div className="vote-bar-bg">
                  <div
                    className="vote-bar-fill"
                    style={{
                      width: `${(r.votes / maxV) * 100}%`,
                      background: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button className="btn btn-primary" onClick={nextVoter}>
              Next Voter
            </button>
            <button className="btn btn-orange" onClick={announceWinner}>
              Announce Winner
            </button>
          </div>
        </div>
      )}

      {/* ---- Step 4: Winner announcement ---- */}
      {step === 4 && winner && (
        <div>
          <div className="text-center mb-4">
            <h2 style={{ color: 'var(--accent)' }}>The people have spoken</h2>
            <p style={{ color: 'var(--text-muted)' }}>{winner.votes} votes</p>
          </div>
          <ResultCard restaurant={winner} />
          <div className="text-center mt-4">
            <button
              className="btn btn-outline"
              onClick={() => { setStep(1); setNominees([]); setVotes({}); setVoterNum(1); setCurrentVotes([]); }}
            >
              New Vote
            </button>
            <a href="/" className="btn btn-ghost">Home</a>
          </div>
        </div>
      )}
    </>
  );
}
