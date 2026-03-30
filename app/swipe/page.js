'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { restaurants, cuisines, shuffle, getCuisineColor } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';
import Link from 'next/link';

export default function SwipePage() {
  const [step, setStep] = useState(1);
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [liked, setLiked] = useState([]);
  const [noped, setNoped] = useState([]);
  const [swipeDir, setSwipeDir] = useState(null);
  const [flyAway, setFlyAway] = useState(null);

  const dragRef = useRef({ dragging: false, startX: 0, currentX: 0 });
  const cardElRef = useRef(null);

  const goToStep2 = () => {
    let f = selectedCuisine === 'all' ? [...restaurants] : restaurants.filter(r => r.cuisine === selectedCuisine);
    if (f.length < 2) f = [...restaurants];
    f = shuffle(f).slice(0, Math.min(f.length, 10));
    setCards(f);
    setCurrentIdx(0);
    setLiked([]);
    setNoped([]);
    setStep(2);
  };

  const handleSwipe = useCallback((direction) => {
    if (currentIdx >= cards.length) return;
    const card = cards[currentIdx];
    setFlyAway(direction);
    setTimeout(() => {
      if (direction === 'right') {
        setLiked(prev => [...prev, card]);
      } else {
        setNoped(prev => [...prev, card]);
      }
      setFlyAway(null);
      setSwipeDir(null);
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (nextIdx >= cards.length) {
        setTimeout(() => {
          setStep(3);
        }, 200);
      }
    }, 300);
  }, [currentIdx, cards]);

  const onPointerDown = useCallback((e) => {
    if (flyAway) return;
    dragRef.current = { dragging: true, startX: e.clientX, currentX: e.clientX };
    if (cardElRef.current) {
      cardElRef.current.style.transition = 'none';
      cardElRef.current.setPointerCapture(e.pointerId);
    }
  }, [flyAway]);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.currentX = e.clientX;
    const dx = dragRef.current.currentX - dragRef.current.startX;
    if (cardElRef.current) {
      const rotate = dx * 0.1;
      cardElRef.current.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    }
    if (dx > 40) setSwipeDir('right');
    else if (dx < -40) setSwipeDir('left');
    else setSwipeDir(null);
  }, []);

  const onPointerUp = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const dx = dragRef.current.currentX - dragRef.current.startX;
    if (cardElRef.current) {
      cardElRef.current.style.transition = 'transform 0.3s ease';
    }
    if (Math.abs(dx) > 80) {
      handleSwipe(dx > 0 ? 'right' : 'left');
    } else {
      if (cardElRef.current) {
        cardElRef.current.style.transform = 'translateX(0) rotate(0deg)';
      }
      setSwipeDir(null);
    }
  }, [handleSwipe]);

  const topCard = currentIdx < cards.length ? cards[currentIdx] : null;
  const nextCard = currentIdx + 1 < cards.length ? cards[currentIdx + 1] : null;
  const topPick = liked.length > 0 ? liked[0] : null;

  useEffect(() => {
    if (step === 3 && topPick) {
      saveHistory(topPick);
      fireConfetti();
    }
  }, [step, topPick]);

  const stepDots = [1,2,3].map(s => (
    <div key={s} className={`step-dot${s === step ? ' active' : ''}${s < step ? ' done' : ''}`} />
  ));

  const getFlyStyle = () => {
    if (flyAway === 'right') return { transform: 'translateX(120vw) rotate(30deg)', transition: 'transform 0.3s ease' };
    if (flyAway === 'left') return { transform: 'translateX(-120vw) rotate(-30deg)', transition: 'transform 0.3s ease' };
    return {};
  };

  return (
    <>
      <div className="page-header"><h1>Swipe Right</h1><p>Tinder-style: swipe right to like, left to skip</p></div>
      <div className="steps">{stepDots}</div>

      {step === 1 && (
        <div>
          <div className="filter-chips">
            <button className={`chip${selectedCuisine === 'all' ? ' selected' : ''}`} onClick={() => setSelectedCuisine('all')}>All Cuisines</button>
            {cuisines.map(c => <button key={c} className={`chip${selectedCuisine === c ? ' selected' : ''}`} onClick={() => setSelectedCuisine(c)}>{c}</button>)}
          </div>
          <div className="text-center mt-2"><button className="btn btn-primary btn-lg" onClick={goToStep2}>Start Swiping</button></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ position: 'relative', width: 320, height: 400, margin: '0 auto' }}>
            {nextCard && (
              <div className="swipe-card" style={{ position: 'absolute', inset: 0, zIndex: 1, transform: 'scale(0.95)', opacity: 0.6 }}>
                <div className="swipe-card-badge" style={{ background: getCuisineColor(nextCard.cuisine) + '20', color: getCuisineColor(nextCard.cuisine) }}>{nextCard.name.charAt(0)}</div>
                <h3>{nextCard.name}</h3>
                <span className="cuisine-tag">{nextCard.cuisine}</span>
              </div>
            )}
            {topCard && (
              <div
                ref={cardElRef}
                className="swipe-card"
                style={{ position: 'absolute', inset: 0, zIndex: 2, cursor: 'grab', touchAction: 'none', ...getFlyStyle() }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                {swipeDir === 'right' && <div className="swipe-overlay swipe-yes">YES</div>}
                {swipeDir === 'left' && <div className="swipe-overlay swipe-nope">NOPE</div>}
                <div className="swipe-card-badge" style={{ background: getCuisineColor(topCard.cuisine) + '20', color: getCuisineColor(topCard.cuisine) }}>{topCard.name.charAt(0)}</div>
                <h3>{topCard.name}</h3>
                <span className="cuisine-tag">{topCard.cuisine} / ${topCard.price} per person</span>
                <div className="meta">
                  <span>{topCard.walkMinutes} min walk</span>
                  <span>{topCard.rating} stars</span>
                </div>
                <p className="description">{topCard.description}</p>
                <div className="dishes">
                  {topCard.popularDishes.map(d => <span key={d} className="dish-tag">{d}</span>)}
                </div>
              </div>
            )}
            {!topCard && !flyAway && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <p>Tallying results...</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <button className="btn btn-outline" onClick={() => handleSwipe('left')} disabled={!topCard || !!flyAway} style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>NOPE</button>
            <button className="btn btn-primary" onClick={() => handleSwipe('right')} disabled={!topCard || !!flyAway} style={{ background: '#22c55e' }}>YES</button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            {currentIdx + 1} / {cards.length}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {topPick ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, color: 'var(--text-muted)' }}>Your top match</h2>
              </div>
              <ResultCard restaurant={topPick} />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <h2>No matches!</h2>
              <p style={{ color: 'var(--text-muted)' }}>You swiped left on everything. Try again?</p>
            </div>
          )}
          {liked.length > 1 && (
            <div style={{ maxWidth: 400, margin: '24px auto 0', textAlign: 'center' }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Also liked</h4>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {liked.slice(1).map(r => <span key={r.id} className="chip">{r.name}</span>)}
              </div>
            </div>
          )}
          <div className="text-center mt-2">
            <button className="btn btn-outline" onClick={() => { setStep(1); setCurrentIdx(0); setLiked([]); setNoped([]); }}>Try Again</button>
            <Link href="/" className="btn btn-ghost">Home</Link>
          </div>
        </div>
      )}
    </>
  );
}
