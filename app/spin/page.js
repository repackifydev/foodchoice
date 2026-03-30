'use client';
import { useState, useRef, useCallback } from 'react';
import { restaurants, cuisines, shuffle, getCuisineColor } from '@/lib/restaurants';
import { saveHistory } from '@/lib/storage';
import { fireConfetti } from '@/lib/confetti';
import ResultCard from '@/components/ResultCard';
import Link from 'next/link';

const wheelColors = ['#ff6b35','#f7c948','#4ecdc4','#a78bfa','#ff6b6b','#22c55e','#3b82f6','#e11d48','#f59e0b','#06b6d4','#ec4899','#6366f1'];

function drawWheel(canvas, items, rotation) {
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10;
  const total = items.length, arc = (2 * Math.PI) / total;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  items.forEach((item, i) => {
    const startA = i * arc, endA = startA + arc;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, startA, endA); ctx.closePath();
    ctx.fillStyle = wheelColors[i % wheelColors.length]; ctx.fill();
    ctx.strokeStyle = '#0f1117'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.rotate(startA + arc / 2);
    ctx.textAlign = 'right'; ctx.fillStyle = '#000';
    ctx.font = `bold ${total > 8 ? 11 : 13}px Inter, sans-serif`;
    const name = item.name.length > 18 ? item.name.slice(0, 17) + '...' : item.name;
    ctx.fillText(name, r - 14, 4); ctx.restore();
  });
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#0f1117'; ctx.fill();
  ctx.strokeStyle = '#2a2e3a'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

export default function SpinPage() {
  const [step, setStep] = useState(1);
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [filtered, setFiltered] = useState([]);
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const goToStep2 = () => {
    let f = selectedCuisine === 'all' ? [...restaurants] : restaurants.filter(r => r.cuisine === selectedCuisine);
    if (f.length < 2) f = [...restaurants];
    f = shuffle(f).slice(0, Math.min(f.length, 12));
    setFiltered(f);
    setStep(2);
    setTimeout(() => { if (canvasRef.current) drawWheel(canvasRef.current, f, 0); }, 50);
  };

  const doSpin = () => {
    if (spinning || !canvasRef.current) return;
    setSpinning(true);
    const total = filtered.length;
    const winIdx = Math.floor(Math.random() * total);
    const segAngle = 360 / total;
    const targetAngle = 360 * 5 + (360 - winIdx * segAngle - segAngle / 2);
    const duration = 4000;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      drawWheel(canvasRef.current, filtered, ease * targetAngle);
      if (progress < 1) { animRef.current = requestAnimationFrame(animate); }
      else {
        setSpinning(false);
        const w = filtered[winIdx];
        saveHistory(w); fireConfetti(); setWinner(w); setStep(3);
      }
    }
    animRef.current = requestAnimationFrame(animate);
  };

  const stepDots = [1,2,3].map(s => (
    <div key={s} className={`step-dot${s === step ? ' active' : ''}${s < step ? ' done' : ''}`} />
  ));

  return (
    <>
      <div className="page-header"><h1>Spin the Wheel</h1><p>Choose a filter, then spin to let destiny decide</p></div>
      <div className="steps">{stepDots}</div>

      {step === 1 && (
        <div>
          <div className="filter-chips">
            <button className={`chip${selectedCuisine === 'all' ? ' selected' : ''}`} onClick={() => setSelectedCuisine('all')}>All Cuisines</button>
            {cuisines.map(c => <button key={c} className={`chip${selectedCuisine === c ? ' selected' : ''}`} onClick={() => setSelectedCuisine(c)}>{c}</button>)}
          </div>
          <div className="text-center mt-2"><button className="btn btn-primary btn-lg" onClick={goToStep2}>Next</button></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ position: 'relative', maxWidth: 400, margin: '0 auto' }}>
            <canvas ref={canvasRef} width={400} height={400} style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '16px solid #ff6b35' }} />
          </div>
          <div className="text-center mt-2"><button className="btn btn-primary btn-lg" onClick={doSpin} disabled={spinning}>SPIN</button></div>
        </div>
      )}

      {step === 3 && winner && (
        <div>
          <ResultCard restaurant={winner} />
          <div className="text-center mt-2">
            <button className="btn btn-outline" onClick={() => { setStep(2); setTimeout(() => drawWheel(canvasRef.current, filtered, 0), 50); }}>Spin Again</button>
            <Link href="/" className="btn btn-ghost">Home</Link>
          </div>
        </div>
      )}
    </>
  );
}
