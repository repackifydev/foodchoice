'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { restaurants } from '@/lib/restaurants';
import { getHistory } from '@/lib/storage';

const cards = [
  { href: '/spin', title: 'Spin the Wheel', desc: 'Let fate decide with a satisfying spin', color: '#ff6b35' },
  { href: '/swipe', title: 'Swipe Right', desc: 'Tinder-style: swipe to find your lunch match', color: '#4ecdc4' },
  { href: '/bracket', title: 'Tournament', desc: 'Head-to-head battles until one restaurant wins', color: '#f7c948' },
  { href: '/slots', title: 'Slot Machine', desc: 'Pull the lever for a cuisine + restaurant combo', color: '#ff6b6b' },
  { href: '/quiz', title: 'Personality Quiz', desc: 'Answer questions to reveal your lunch destiny', color: '#a78bfa' },
  { href: '/mood', title: 'Mood Picker', desc: 'How are you feeling? Let Dr. Lunch prescribe', color: '#ec4899' },
  { href: '/budget', title: 'Budget Slider', desc: 'Slide to your price range, find your meal', color: '#f7c948' },
  { href: '/vote', title: 'Team Vote', desc: 'Democracy in action - the team decides', color: '#3b82f6' },
  { href: '/8ball', title: 'Magic 8-Ball', desc: 'Shake the mystic orb for answers', color: '#6366f1' },
  { href: '/dice', title: 'Dice Roll', desc: 'Roll for cuisine + budget, get a match', color: '#4ecdc4' },
  { href: '/random', title: 'Quick Random', desc: 'No patience? Instant random pick', color: '#ff6b35' },
];

export default function Home() {
  const [history, setHistory] = useState([]);
  useEffect(() => { setHistory(getHistory().slice(0, 3)); }, []);

  return (
    <>
      <div className="page-header">
        <h1>Where are we eating?</h1>
        <p>Choose your method. {restaurants.length} restaurants near 501 Pedernales St. All under $25.</p>
      </div>
      <div className="home-grid">
        {cards.map(c => (
          <Link key={c.href} className="home-card" href={c.href}>
            <div className="card-accent" style={{ background: c.color }} />
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
      {history.length > 0 && (
        <div className="mt-4" style={{ maxWidth: 600, margin: '32px auto 0' }}>
          <h3 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>Recent Picks</h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {history.map((h, i) => <span key={i} className="chip">{h.name}</span>)}
          </div>
        </div>
      )}
    </>
  );
}
