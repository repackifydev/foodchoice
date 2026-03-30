let confettiCanvas = null;
let confettiCtx = null;
let confettiPieces = [];
let confettiAnim = null;

export function confetti(duration = 3000) {
  if (!confettiCanvas) {
    confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');
  }
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = ['#ff6b35', '#f7c948', '#4ecdc4', '#a78bfa', '#ff6b6b', '#22c55e'];
  confettiPieces = [];
  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  const start = performance.now();
  function draw(now) {
    const elapsed = now - start;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    const fadeStart = duration * 0.7;
    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.rotSpeed;
      if (elapsed > fadeStart) {
        p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (duration - fadeStart));
      }
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = p.opacity;
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confettiCtx.restore();
    });

    if (elapsed < duration) {
      confettiAnim = requestAnimationFrame(draw);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
  if (confettiAnim) cancelAnimationFrame(confettiAnim);
  confettiAnim = requestAnimationFrame(draw);
}

export function screenFlash(color = '#FFD600', duration = 200) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: ${color}; opacity: 0.4; pointer-events: none; z-index: 9998;
    transition: opacity ${duration}ms ease;
  `;
  document.body.appendChild(flash);
  requestAnimationFrame(() => {
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), duration);
  });
}
