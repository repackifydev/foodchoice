import { restaurants, cuisines, shuffle } from '../data/restaurants.js';

let spinTimeout = null;

export function render() {
  return `
    <div class="page-header">
      <h1>Spin the Wheel</h1>
      <p>Choose a filter, then spin to let destiny decide</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
    </div>

    <div id="spin-step-1">
      <div class="filter-chips">
        <button class="chip selected" data-cuisine="all">All Cuisines</button>
        ${cuisines.map(c => `<button class="chip" data-cuisine="${c}">${c}</button>`).join('')}
      </div>
      <div class="text-center mt-2">
        <button class="btn btn-primary btn-lg" id="spin-start">Next</button>
      </div>
    </div>

    <div id="spin-step-2" class="hidden">
      <div style="position:relative;max-width:400px;margin:0 auto;">
        <canvas id="spin-canvas" width="400" height="400" style="width:100%;cursor:pointer;"></canvas>
        <div style="position:absolute;top:-4px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:16px solid #ff6b35;"></div>
      </div>
      <div class="text-center mt-2">
        <button class="btn btn-primary btn-lg" id="spin-btn">SPIN</button>
      </div>
    </div>

    <div id="spin-step-3" class="hidden">
      <div id="spin-result"></div>
      <div class="text-center mt-2">
        <button class="btn btn-outline" id="spin-again">Spin Again</button>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
  `;
}

export function init(container) {
  let selectedCuisine = 'all';
  let filtered = [...restaurants];
  let spinning = false;

  container.querySelectorAll('[data-cuisine]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('[data-cuisine]').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedCuisine = chip.dataset.cuisine;
    });
  });

  container.querySelector('#spin-start').addEventListener('click', () => {
    filtered = selectedCuisine === 'all' ? [...restaurants] : restaurants.filter(r => r.cuisine === selectedCuisine);
    if (filtered.length < 2) filtered = [...restaurants];
    filtered = shuffle(filtered).slice(0, Math.min(filtered.length, 12));
    drawWheel(container.querySelector('#spin-canvas'), filtered, 0);
    setStep(2);
  });

  container.querySelector('#spin-btn').addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    const canvas = container.querySelector('#spin-canvas');
    const total = filtered.length;
    const winIdx = Math.floor(Math.random() * total);
    const segAngle = 360 / total;
    const targetAngle = 360 * 5 + (360 - winIdx * segAngle - segAngle / 2);

    let current = 0;
    const duration = 4000;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      current = ease * targetAngle;
      drawWheel(canvas, filtered, current);
      if (progress < 1) {
        spinTimeout = requestAnimationFrame(animate);
      } else {
        spinning = false;
        const winner = filtered[winIdx];
        app.saveHistory(winner);
        app.confetti();
        container.querySelector('#spin-result').innerHTML = app.renderResultCard(winner);
        setStep(3);
      }
    }
    spinTimeout = requestAnimationFrame(animate);
  });

  container.querySelector('#spin-again').addEventListener('click', () => setStep(2));

  function setStep(n) {
    [1, 2, 3].forEach(s => {
      container.querySelector(`#spin-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n);
      dot.classList.toggle('done', s < n);
    });
  }

  return () => { if (spinTimeout) cancelAnimationFrame(spinTimeout); };
}

function drawWheel(canvas, items, rotation) {
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 10;
  const total = items.length;
  const arc = (2 * Math.PI) / total;
  const colors = ['#ff6b35', '#f7c948', '#4ecdc4', '#a78bfa', '#ff6b6b',
                  '#22c55e', '#3b82f6', '#e11d48', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1'];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);

  items.forEach((item, i) => {
    const startA = i * arc;
    const endA = startA + arc;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, startA, endA);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(startA + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = `bold ${total > 8 ? 11 : 13}px Inter, sans-serif`;
    const name = item.name.length > 18 ? item.name.slice(0, 17) + '\u2026' : item.name;
    ctx.fillText(name, r - 14, 4);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
