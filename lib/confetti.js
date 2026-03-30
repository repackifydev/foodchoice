'use client';

export function fireConfetti(duration = 3000) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff6b35', '#f7c948', '#4ecdc4', '#a78bfa', '#ff6b6b', '#22c55e'];
  const pieces = [];
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width, y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 6, h: 10 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 6, vy: 2 + Math.random() * 4,
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10, opacity: 1
    });
  }

  const start = performance.now();
  let anim;
  function draw(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fadeStart = duration * 0.7;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.rotation += p.rotSpeed;
      if (elapsed > fadeStart) p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (duration - fadeStart));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (elapsed < duration) anim = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  anim = requestAnimationFrame(draw);
}
