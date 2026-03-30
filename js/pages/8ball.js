import { restaurants, getRandom } from '../data/restaurants.js';

const responses = [
  'Signs point to', 'Without a doubt', 'The stars say',
  'My sources say', 'It is certain', 'The oracle reveals',
  'Outlook good for', 'Yes, definitely go to',
  'Ask again after coffee... but probably', 'The spirits whisper',
];

export function render() {
  return `
    <div class="page-header">
      <h1>Magic 8-Ball</h1>
      <p>Shake the mystic orb for your lunch destiny</p>
    </div>
    <div class="steps">
      <div class="step-dot active" data-step="1"></div>
      <div class="step-dot" data-step="2"></div>
      <div class="step-dot" data-step="3"></div>
    </div>

    <div id="ball-step-1">
      <div class="text-center mb-4">
        <p style="color:var(--text-muted);font-size:14px;">Ask a lunch question (optional)</p>
        <input type="text" id="ball-question" placeholder="Should I get tacos today?"
          style="padding:10px 18px;border-radius:var(--radius-full);border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-size:15px;width:100%;max-width:400px;margin:12px auto;display:block;font-family:var(--font);outline:none;transition:var(--transition);">
      </div>
      <div class="text-center">
        <button class="btn btn-primary btn-lg" id="ball-ask">Ask the 8-Ball</button>
      </div>
    </div>

    <div id="ball-step-2" class="hidden">
      <div class="text-center mb-4">
        <p id="ball-user-question" style="font-style:italic;color:var(--text-muted);font-size:14px;"></p>
      </div>
      <div class="eight-ball" id="the-ball">
        <div class="eight-ball-window">
          <div class="eight-ball-text" id="ball-answer">8</div>
        </div>
      </div>
      <div class="text-center mt-4">
        <p style="color:var(--text-muted);font-size:13px;" id="ball-instruction">Click the ball to shake</p>
      </div>
    </div>

    <div id="ball-step-3" class="hidden">
      <div class="text-center mb-4">
        <p id="ball-response-text" style="font-size:18px;font-weight:600;"></p>
      </div>
      <div id="ball-result"></div>
      <div class="text-center mt-4">
        <button class="btn btn-outline" id="ball-again">Shake Again</button>
        <a href="#/" class="btn btn-ghost">Home</a>
      </div>
    </div>
  `;
}

export function init(container) {
  let shaking = false;

  container.querySelector('#ball-question').addEventListener('focus', e => { e.target.style.borderColor = 'var(--accent-4)'; });
  container.querySelector('#ball-question').addEventListener('blur', e => { e.target.style.borderColor = 'var(--border)'; });

  container.querySelector('#ball-ask').addEventListener('click', () => {
    const question = container.querySelector('#ball-question').value || 'What should I eat for lunch?';
    container.querySelector('#ball-user-question').textContent = `"${question}"`;
    container.querySelector('#ball-answer').textContent = '8';
    container.querySelector('#ball-answer').classList.remove('visible');
    setStep(2);
  });

  container.querySelector('#the-ball').addEventListener('click', () => {
    if (shaking) return;
    shaking = true;
    const ball = container.querySelector('#the-ball');
    const answerEl = container.querySelector('#ball-answer');
    const instruction = container.querySelector('#ball-instruction');

    answerEl.classList.remove('visible');
    answerEl.textContent = '';
    instruction.textContent = 'Consulting the spirits...';
    ball.classList.add('shaking');

    setTimeout(() => {
      ball.classList.remove('shaking');
      const restaurant = getRandom(restaurants);
      const response = responses[Math.floor(Math.random() * responses.length)];

      answerEl.textContent = restaurant.name;
      answerEl.classList.add('visible');
      instruction.textContent = 'The ball has spoken.';

      setTimeout(() => {
        app.confetti();
        app.saveHistory(restaurant);
        container.querySelector('#ball-response-text').textContent = `${response}... ${restaurant.name}`;
        container.querySelector('#ball-result').innerHTML = app.renderResultCard(restaurant);
        setStep(3);
        shaking = false;
      }, 1500);
    }, 800);
  });

  container.querySelector('#ball-again').addEventListener('click', () => {
    container.querySelector('#ball-answer').textContent = '8';
    container.querySelector('#ball-answer').classList.remove('visible');
    container.querySelector('#ball-instruction').textContent = 'Click the ball to shake';
    setStep(2);
  });

  function setStep(n) {
    [1, 2, 3].forEach(s => {
      container.querySelector(`#ball-step-${s}`).classList.toggle('hidden', s !== n);
      const dot = container.querySelector(`.step-dot[data-step="${s}"]`);
      dot.classList.toggle('active', s === n);
      dot.classList.toggle('done', s < n);
    });
  }
}
