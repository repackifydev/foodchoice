'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { restaurants } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const questions = [
  {
    question: "It's noon. How are you feeling?",
    options: [
      { label: 'A', text: "Starving — I need something big and filling", tags: ['hearty', 'comfort', 'meat-lovers', 'cheap'] },
      { label: 'B', text: "Peckish — something light would be perfect", tags: ['light-lunch', 'healthy', 'coffee', 'quick'] },
      { label: 'C', text: "Adventurous — surprise me with something new", tags: ['creative', 'unique', 'bold-flavors', 'fusion'] },
      { label: 'D', text: "Fancy — I want to treat myself today", tags: ['quality', 'sit-down', 'instagram', 'charcuterie'] },
    ],
  },
  {
    question: "Pick your ideal lunch setting:",
    options: [
      { label: 'A', text: "Quick grab from a food truck, eat outside", tags: ['street-food', 'food-truck', 'outdoor', 'quick'], maxWalk: 15 },
      { label: 'B', text: "Cozy sit-down spot with good vibes", tags: ['cozy', 'chill', 'sit-down', 'comfort'] },
      { label: 'C', text: "Bustling counter service, order and go", tags: ['quick', 'cheap', 'casual', 'classic'] },
      { label: 'D', text: "Anywhere with a nice patio", tags: ['outdoor', 'chill', 'bar-food', 'instagram'] },
    ],
  },
  {
    question: "What sounds best right now?",
    options: [
      { label: 'A', text: "Something cheesy and carb-loaded", tags: ['cheesy', 'comfort', 'detroit-style', 'pasta'] },
      { label: 'B', text: "A big bowl of noodles or soup", tags: ['ramen', 'noodles', 'pho', 'warm', 'umami'] },
      { label: 'C', text: "Tacos, obviously", tags: ['tacos', 'street-food', 'authentic', 'heirloom-corn'] },
      { label: 'D', text: "Grilled meat or a solid burger", tags: ['smoky', 'bbq', 'burgers', 'grilled-chicken'] },
    ],
  },
  {
    question: "How far are you willing to walk?",
    options: [
      { label: 'A', text: "5 minutes max, I'm not about that walk life", tags: ['quick'], maxWalk: 8 },
      { label: 'B', text: "10-15 minutes is fine for good food", tags: ['authentic'], maxWalk: 15 },
      { label: 'C', text: "I'll walk 20+ minutes for the right spot", tags: ['quality', 'hearty'], maxWalk: 30 },
      { label: 'D', text: "Distance is no object — take me there", tags: ['classic', 'unique'], maxWalk: 100 },
    ],
  },
  {
    question: "Pick a drink to go with lunch:",
    options: [
      { label: 'A', text: "An ice-cold agua fresca or horchata", tags: ['authentic', 'mexican', 'tacos', 'street-food'] },
      { label: 'B', text: "Just a good coffee, thanks", tags: ['coffee', 'bakery', 'light-lunch', 'chill'] },
      { label: 'C', text: "Something fizzy — soda or sparkling water", tags: ['quick', 'burgers', 'chicken', 'cheap'] },
      { label: 'D', text: "A craft beer or cocktail, it's that kind of day", tags: ['bar-food', 'outdoor', 'shareable', 'fun'] },
    ],
  },
  {
    question: "What matters most in a lunch spot?",
    options: [
      { label: 'A', text: "Big portions, low price — feed me for cheap", tags: ['cheap', 'hearty', 'classic', 'breakfast'] },
      { label: 'B', text: "Unique flavors I can't get anywhere else", tags: ['unique', 'creative', 'bold-flavors', 'heirloom-corn'] },
      { label: 'C', text: "Speed — I have 30 minutes, tops", tags: ['quick', 'drive-thru', 'fast-food', 'cheap'] },
      { label: 'D', text: "Quality ingredients and great execution", tags: ['quality', 'steak', 'south-american', 'charcuterie'] },
    ],
  },
];

const personalityTypes = {
  'Comfort Seeker': {
    tags: ['comfort', 'hearty', 'cheap', 'classic', 'breakfast'],
    description: "You crave warmth, big portions, and familiar flavors. A filled belly is a happy soul.",
  },
  'Adventurer': {
    tags: ['creative', 'unique', 'bold-flavors', 'fusion', 'heirloom-corn'],
    description: "You live for new flavors and unexpected combos. The weirder the menu, the more excited you get.",
  },
  'Minimalist': {
    tags: ['quick', 'light-lunch', 'coffee', 'healthy', 'cheap'],
    description: "You keep it simple — good food, fast service, no fuss. Efficiency is your love language.",
  },
  'Connoisseur': {
    tags: ['quality', 'sit-down', 'charcuterie', 'steak', 'instagram'],
    description: "You appreciate the finer things. Every meal is an experience, not just sustenance.",
  },
};

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const { personality, topRestaurant } = useMemo(() => {
    if (!done) return { personality: null, topRestaurant: null };

    // Collect all tags from answers
    const tagScores = {};
    let maxWalk = 100;
    answers.forEach((opt) => {
      opt.tags.forEach((tag) => {
        tagScores[tag] = (tagScores[tag] || 0) + 1;
      });
      if (opt.maxWalk !== undefined) {
        maxWalk = Math.min(maxWalk, opt.maxWalk);
      }
    });

    // Score restaurants
    const scored = restaurants.map((r) => {
      let score = 0;
      r.tags.forEach((tag) => {
        if (tagScores[tag]) score += tagScores[tag];
      });
      // Penalize if too far to walk
      if (r.walkMinutes > maxWalk) score -= 2;
      return { restaurant: r, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0].restaurant;

    // Determine personality type
    let bestType = 'Comfort Seeker';
    let bestScore = -1;
    Object.entries(personalityTypes).forEach(([type, info]) => {
      let typeScore = 0;
      info.tags.forEach((tag) => {
        if (tagScores[tag]) typeScore += tagScores[tag];
      });
      if (typeScore > bestScore) {
        bestScore = typeScore;
        bestType = type;
      }
    });

    saveHistory(top);
    setTimeout(() => fireConfetti(), 200);

    return { personality: bestType, topRestaurant: top };
  }, [done, answers]);

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setDone(false);
  };

  // --- Results ---
  if (done && personality && topRestaurant) {
    return (
      <>
        <canvas id="confetti-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }} />
        <div className="page-header">
          <Link href="/" className="back-link">Home</Link>
          <h1>Your Lunch Personality</h1>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 32,
          background: 'var(--card-bg)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          maxWidth: 500,
          margin: '0 auto 24px',
        }}>
          <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 8 }}>You are a...</div>
          <h2 style={{ fontSize: 32, marginBottom: 12, background: 'linear-gradient(135deg, #ff6b35, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {personality}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {personalityTypes[personality].description}
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Your perfect lunch match:</p>
        </div>

        <ResultCard restaurant={topRestaurant} />

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn btn-orange" onClick={reset}>Take Quiz Again</button>
        </div>
      </>
    );
  }

  // --- Quiz in progress ---
  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  return (
    <>
      <div className="page-header">
        <Link href="/" className="back-link">Home</Link>
        <h1>Personality Quiz</h1>
        <p>Answer 6 questions to discover your lunch destiny.</p>
      </div>

      {/* Progress bar */}
      <div style={{
        maxWidth: 500,
        margin: '0 auto 32px',
        background: 'var(--border)',
        borderRadius: 100,
        height: 8,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #ff6b35, #a78bfa)',
          borderRadius: 100,
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
        }}>
          Question {currentQ + 1} of {questions.length}
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 24 }}>{q.question}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((opt) => (
            <button
              key={opt.label}
              className="quiz-option"
              onClick={() => handleAnswer(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 20px',
                background: 'var(--card-bg)',
                border: '2px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 15,
                transition: 'all 0.2s ease',
              }}
            >
              <span className="option-label" style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}>
                {opt.label}
              </span>
              <span>{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
