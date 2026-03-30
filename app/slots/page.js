'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { restaurants, cuisines, shuffle, getRandom } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';

const ITEM_HEIGHT = 80;

function buildReelItems(source, count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(source[i % source.length]);
  }
  return items;
}

export default function SlotsPage() {
  const allCuisines = cuisines;
  const allNames = restaurants.map((r) => r.name);
  const allDishes = [...new Set(restaurants.flatMap((r) => r.popularDishes))];

  const reelCount = 30;
  const cuisineItems = buildReelItems(shuffle(allCuisines), reelCount);
  const nameItems = buildReelItems(shuffle(allNames), reelCount);
  const dishItems = buildReelItems(shuffle(allDishes), reelCount);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [jackpot, setJackpot] = useState(false);

  const reel1Ref = useRef(null);
  const reel2Ref = useRef(null);
  const reel3Ref = useRef(null);
  const animRef = useRef([]);

  const spinReel = useCallback((reelInner, items, winnerText, duration, onDone) => {
    const winnerIdx = items.findIndex((item) => item === winnerText);
    const targetIdx = winnerIdx !== -1 ? winnerIdx : 0;

    // Target position: center the winner in the viewport (show 3 items)
    const targetY = -(targetIdx * ITEM_HEIGHT) + ITEM_HEIGHT; // offset so it's centered

    const totalScroll = (items.length * ITEM_HEIGHT * 2) + Math.abs(targetY);
    const startTime = performance.now();

    let currentY = 0;

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      currentY = -(totalScroll * eased);
      // Wrap around to avoid going beyond content
      const wrappedY = currentY % (items.length * ITEM_HEIGHT);
      reelInner.style.transform = `translateY(${wrappedY}px)`;

      if (progress < 1) {
        const id = requestAnimationFrame(animate);
        animRef.current.push(id);
      } else {
        // Snap to winner
        reelInner.style.transform = `translateY(${targetY}px)`;
        if (onDone) onDone();
      }
    }

    const id = requestAnimationFrame(animate);
    animRef.current.push(id);
  }, []);

  const pull = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setJackpot(false);

    // Pick a random winner restaurant
    const winner = getRandom(restaurants);

    // Find matching items for reels or use closest available
    const winCuisine = cuisineItems.includes(winner.cuisine)
      ? winner.cuisine
      : cuisineItems[0];
    const winName = nameItems.includes(winner.name)
      ? winner.name
      : nameItems[0];
    const winDish = winner.popularDishes[0] && dishItems.includes(winner.popularDishes[0])
      ? winner.popularDishes[0]
      : dishItems[0];

    // Reset reel positions
    if (reel1Ref.current) reel1Ref.current.style.transform = 'translateY(0px)';
    if (reel2Ref.current) reel2Ref.current.style.transform = 'translateY(0px)';
    if (reel3Ref.current) reel3Ref.current.style.transform = 'translateY(0px)';

    // Staggered timing
    setTimeout(() => {
      if (reel1Ref.current) spinReel(reel1Ref.current, cuisineItems, winCuisine, 1500, null);
    }, 0);
    setTimeout(() => {
      if (reel2Ref.current) spinReel(reel2Ref.current, nameItems, winName, 2200, null);
    }, 0);
    setTimeout(() => {
      if (reel3Ref.current) spinReel(reel3Ref.current, dishItems, winDish, 2900, null);
    }, 0);

    // Show result after all reels stop
    setTimeout(() => {
      setResult(winner);
      setJackpot(true);
      setSpinning(false);
      saveHistory(winner);
      fireConfetti();
    }, 3200);
  }, [spinning, cuisineItems, nameItems, dishItems, spinReel]);

  const reset = () => {
    setResult(null);
    setJackpot(false);
    setSpinning(false);
    animRef.current.forEach((id) => cancelAnimationFrame(id));
    animRef.current = [];
    if (reel1Ref.current) reel1Ref.current.style.transform = 'translateY(0px)';
    if (reel2Ref.current) reel2Ref.current.style.transform = 'translateY(0px)';
    if (reel3Ref.current) reel3Ref.current.style.transform = 'translateY(0px)';
  };

  return (
    <>
      <canvas id="confetti-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }} />
      <div className="page-header">
        <Link href="/" className="back-link">Home</Link>
        <h1>Slot Machine</h1>
        <p>Pull the lever for a cuisine + restaurant + dish combo!</p>
      </div>

      <div className="slots-machine" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        margin: '32px auto',
        maxWidth: 600,
      }}>
        {/* Reel 1: Cuisine */}
        <div className="slot-reel" style={{
          width: 160,
          height: ITEM_HEIGHT * 3,
          overflow: 'hidden',
          borderRadius: 12,
          border: '3px solid var(--border)',
          background: 'var(--bg-card)',
          position: 'relative',
        }}>
          <div className="slot-reel-label" style={{
            position: 'absolute',
            top: -24,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'var(--text-muted)',
          }}>Cuisine</div>
          <div ref={reel1Ref} className="reel-inner" style={{ transition: 'none' }}>
            {cuisineItems.map((item, i) => (
              <div key={`c-${i}`} className="slot-item" style={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 600,
              }}>{item}</div>
            ))}
          </div>
        </div>

        {/* Reel 2: Restaurant */}
        <div className="slot-reel" style={{
          width: 200,
          height: ITEM_HEIGHT * 3,
          overflow: 'hidden',
          borderRadius: 12,
          border: '3px solid var(--border)',
          background: 'var(--bg-card)',
          position: 'relative',
        }}>
          <div className="slot-reel-label" style={{
            position: 'absolute',
            top: -24,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'var(--text-muted)',
          }}>Restaurant</div>
          <div ref={reel2Ref} className="reel-inner" style={{ transition: 'none' }}>
            {nameItems.map((item, i) => (
              <div key={`n-${i}`} className="slot-item" style={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 600,
                textAlign: 'center',
                padding: '0 8px',
              }}>{item}</div>
            ))}
          </div>
        </div>

        {/* Reel 3: Dish */}
        <div className="slot-reel" style={{
          width: 180,
          height: ITEM_HEIGHT * 3,
          overflow: 'hidden',
          borderRadius: 12,
          border: '3px solid var(--border)',
          background: 'var(--bg-card)',
          position: 'relative',
        }}>
          <div className="slot-reel-label" style={{
            position: 'absolute',
            top: -24,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'var(--text-muted)',
          }}>Dish</div>
          <div ref={reel3Ref} className="reel-inner" style={{ transition: 'none' }}>
            {dishItems.map((item, i) => (
              <div key={`d-${i}`} className="slot-item" style={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'center',
                padding: '0 8px',
              }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Center highlight bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: -ITEM_HEIGHT * 3 - 12,
        marginBottom: ITEM_HEIGHT * 2 + 12,
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 560,
          height: ITEM_HEIGHT,
          border: '2px solid #ff6b35',
          borderRadius: 8,
          marginTop: ITEM_HEIGHT,
          opacity: 0.5,
        }} />
      </div>

      {/* Pull lever button */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          className="btn btn-orange"
          onClick={pull}
          disabled={spinning}
          style={{ fontSize: 18, padding: '14px 48px' }}
        >
          {spinning ? 'Spinning...' : 'Pull the Lever!'}
        </button>
      </div>

      {/* Jackpot + Result */}
      {jackpot && result && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <div className="jackpot-text" style={{
            fontSize: 48,
            fontWeight: 900,
            background: 'linear-gradient(90deg, #ff6b35, #f7c948, #4ecdc4, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 24,
            animation: 'pulse 0.6s ease-in-out infinite alternate',
          }}>
            JACKPOT!
          </div>
          <ResultCard restaurant={result} />
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-outline btn-sm" onClick={reset}>Spin Again</button>
          </div>
        </div>
      )}
    </>
  );
}
