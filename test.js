
/* ═══════════════════════════════════════════════════════════
   GLOBAL STATE
   ═══════════════════════════════════════════════════════════ */
const state = {
  currentChapter: 1,
  currentStep: 0,
  gameRound: 0,
  gameScore: 0,
  gameSelections: [],
  gameRevealed: false,
  quizScore: 0,
  quizCurrent: 0,
  quizAnswered: false,
  userWeights: [],
  ch6Compared: false,
  focusedAttnWord: 3, // 'not' index
  attnSentence: ['The','movie','was','not','good','at','all'],
  heatmapFocused: -1,
};

/* ═══════════════════════════════════════════════════════════
   CHAPTER NAV
   ═══════════════════════════════════════════════════════════ */
const chapterNames = ['The Hook','Word Web','Meet LSTM','LSTM Fails','Enter Attention','How It Works','Build Attention','Guess Focus','Heatmap','Quiz','Takeaways'];
const nav = document.getElementById('chapter-nav');
chapterNames.forEach((name, i) => {
  const dot = document.createElement('div');
  dot.className = 'nav-dot';
  dot.innerHTML = `<span class="nav-label">${name}</span>`;
  dot.onclick = () => scrollToChapter(i + 1);
  nav.appendChild(dot);
});

function scrollToChapter(n) {
  const el = document.getElementById('ch' + n);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function updateNav() {
  const chapters = document.querySelectorAll('.chapter');
  const dots = document.querySelectorAll('.nav-dot');
  let current = 1;
  chapters.forEach((ch, i) => {
    const rect = ch.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.5) current = i + 1;
  });
  state.currentChapter = current;
  dots.forEach((d, i) => d.classList.toggle('active', i === current - 1));
}

/* ═══════════════════════════════════════════════════════════
   SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Trigger chapter-specific animations
      const chapterId = e.target.closest('.chapter')?.id;
      if (chapterId === 'ch5') animateLSTMPred();
      if (chapterId === 'ch4') animateAttnPred();
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

// Takeaway cards observer
const takeawayObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay) || 0;
      setTimeout(() => e.target.classList.add('visible'), delay);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.takeaway-card').forEach(el => takeawayObserver.observe(el));

window.addEventListener('scroll', updateNav);

/* ═══════════════════════════════════════════════════════════
   CHAPTER 1 — TYPEWRITER
   ═══════════════════════════════════════════════════════════ */
const hookSentence = 'The cat sat on the mat because it was tired.';
const hookWords = hookSentence.split(' ');
let typewriterDone = false;

function runTypewriter() {
  if (typewriterDone) return;
  typewriterDone = true;
  const container = document.getElementById('typewriter-container');
  container.innerHTML = '';
  hookWords.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    span.style.opacity = '0';
    span.style.transition = 'opacity 0.4s ease, text-shadow 0.4s ease';
    span.style.display = 'inline-block';
    if (word === 'it') {
      span.style.color = 'var(--neon-blue)';
      span.id = 'pulse-it';
    }
    container.appendChild(span);
    setTimeout(() => {
      span.style.opacity = '1';
      if (word === 'it') {
        span.style.animation = 'pulseNeon 2s infinite';
        span.style.fontWeight = '700';
      }
    }, 300 + i * 280);
  });
  // Show question and button after typewriter
  setTimeout(() => {
    document.getElementById('hook-question').style.opacity = '1';
  }, 300 + hookWords.length * 280 + 400);
  setTimeout(() => {
    document.getElementById('start-btn').style.opacity = '1';
  }, 300 + hookWords.length * 280 + 900);
}

// Start typewriter when page loads or when ch1 is visible
setTimeout(runTypewriter, 600);

/* ═══════════════════════════════════════════════════════════
   CHAPTER 2 — LSTM CHAIN
   ═══════════════════════════════════════════════════════════ */
function buildLSTMChain(len) {
  const words = ['The','cat','sat','on','the','mat','because','it','was','tired','and','then','finally','went','to','sleep','on','the','warm','bed'];
  const chain = document.getElementById('lstm-chain');
  chain.innerHTML = '';
  const count = Math.min(len, words.length);
  for (let i = 0; i < count; i++) {
    const box = document.createElement('div');
    box.className = 'token-box';
    const influence = Math.max(5, Math.round(100 * Math.exp(-0.35 * (count - 1 - i))));
    const opacity = 0.3 + 0.7 * (influence / 100);
    const scale = 0.7 + 0.3 * (influence / 100);
    box.style.opacity = opacity;
    box.style.transform = `scale(${scale})`;
    box.style.borderColor = `rgba(0,212,255,${0.15 + 0.55 * (influence/100)})`;
    box.textContent = words[i];
    const tt = document.createElement('div');
    tt.className = 'tooltip';
    tt.textContent = `${words[i]}: ${influence}% remaining influence`;
    box.appendChild(tt);
    chain.appendChild(box);
    if (i < count - 1) {
      const conn = document.createElement('div');
      conn.className = 'token-connector';
      const dot = document.createElement('div');
      dot.className = 'pulse-dot';
      dot.style.animationDelay = (i * 0.3) + 's';
      conn.appendChild(dot);
      chain.appendChild(conn);
    }
  }
  // Update gradient bar
  const barWidth = Math.max(5, 100 - (len - 5) * 6);
  document.getElementById('gradient-bar').style.width = barWidth + '%';
}

document.getElementById('lstm-len-slider').addEventListener('input', function() {
  document.getElementById('lstm-len-val').textContent = this.value;
  buildLSTMChain(parseInt(this.value));
});
buildLSTMChain(5);

/* ═══════════════════════════════════════════════════════════
   CHAPTER 3 — LSTM PRED ANIMATION
   ═══════════════════════════════════════════════════════════ */
let ch3Animated = false;
function animateLSTMPred() {
  if (ch3Animated) return;
  ch3Animated = true;
  setTimeout(() => {
    document.getElementById('lstm-pred-bar').style.width = '73%';
  }, 400);
}

/* ═══════════════════════════════════════════════════════════
   CHAPTER 4 — ATTENTION VIZ
   ═══════════════════════════════════════════════════════════ */
const attnWeightsMap = {
  0: [0.05, 0.08, 0.05, 0.50, 0.20, 0.05, 0.07], // 'The' focuses on 'not'
  1: [0.06, 0.10, 0.06, 0.45, 0.22, 0.04, 0.07], // 'movie'
  2: [0.04, 0.06, 0.08, 0.48, 0.22, 0.05, 0.07], // 'was'
  3: [0.08, 0.10, 0.12, 0.15, 0.35, 0.10, 0.10], // 'not' focuses on 'good'
  4: [0.05, 0.08, 0.10, 0.45, 0.12, 0.10, 0.10], // 'good' focuses on 'not'
  5: [0.04, 0.05, 0.05, 0.40, 0.30, 0.06, 0.10], // 'at'
  6: [0.03, 0.05, 0.05, 0.42, 0.28, 0.07, 0.10], // 'all'
};

function buildAttnTokens() {
  const container = document.getElementById('attn-tokens');
  container.innerHTML = '';
  state.attnSentence.forEach((word, i) => {
    const box = document.createElement('div');
    box.className = 'token-box';
    box.textContent = word;
    box.style.cursor = 'pointer';
    if (word === 'not') {
      box.style.borderColor = 'var(--neon-purple)';
      box.style.color = 'var(--neon-purple)';
      box.style.boxShadow = '0 0 15px rgba(168,85,247,0.3)';
    }
    if (i === state.focusedAttnWord) {
      box.style.borderColor = 'var(--neon-blue)';
      box.style.boxShadow = '0 0 20px rgba(0,212,255,0.4)';
    }
    box.onclick = () => { state.focusedAttnWord = i; buildAttnTokens(); drawAttnLines(); };
    container.appendChild(box);
    if (i < state.attnSentence.length - 1) {
      const spacer = document.createElement('div');
      spacer.style.width = '24px';
      spacer.style.flexShrink = '0';
      container.appendChild(spacer);
    }
  });
  drawAttnLines();
}

function drawAttnLines() {
  const canvas = document.getElementById('attn-canvas');
  const container = document.getElementById('attn-viz');
  const tokens = container.querySelectorAll('.token-box');
  // Use devicePixelRatio for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const cw = container.offsetWidth;
  const ch = container.offsetHeight;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);

  const focusIdx = state.focusedAttnWord;
  const tempScaler = parseInt(document.getElementById('focus-slider').value);
  let weights = [...(attnWeightsMap[focusIdx] || attnWeightsMap[0])];

  // Apply temperature scaling
  weights = weights.map(w => Math.pow(w, tempScaler / 3));
  const sum = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => w / sum);

  const focusToken = tokens[focusIdx];
  if (!focusToken) return;
  const fRect = focusToken.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();
  const fX = fRect.left + fRect.width / 2 - cRect.left;
  const fY = fRect.top + fRect.height / 2 - cRect.top;

  // Minimum Y for arcs — keep 20px from top of the canvas
  const minArcY = 20;

  tokens.forEach((tok, i) => {
    if (i === focusIdx) return;
    const tRect = tok.getBoundingClientRect();
    const tX = tRect.left + tRect.width / 2 - cRect.left;
    const tY = tRect.top + tRect.height / 2 - cRect.top;
    const w = weights[i];

    // Arc height scales with weight but is clamped within visible canvas
    const rawArcY = Math.min(fY, tY) - 30 - w * 70;
    const cpY = Math.max(minArcY + 16, rawArcY); // clamp so arcs & labels stay in view

    ctx.beginPath();
    ctx.moveTo(fX, fY);
    ctx.quadraticCurveTo((fX + tX) / 2, cpY, tX, tY);

    const hue = w > 0.3 ? 270 : 200;
    ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${0.2 + w * 0.8})`;
    ctx.lineWidth = 1 + w * 8;
    ctx.stroke();

    // Weight label — positioned just above the arc apex, clamped to stay visible
    const labelY = Math.max(minArcY, cpY - 6);
    ctx.fillStyle = `rgba(255,255,255,${0.5 + w * 0.5})`;
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText((w * 100).toFixed(0) + '%', (fX + tX) / 2, labelY);
  });
}

document.getElementById('focus-slider').addEventListener('input', function() {
  document.getElementById('focus-val').textContent = this.value;
  drawAttnLines();
});

buildAttnTokens();
window.addEventListener('resize', () => { drawAttnLines(); });

let ch4Animated = false;
function animateAttnPred() {
  if (ch4Animated) return;
  ch4Animated = true;
  setTimeout(() => {
    document.getElementById('attn-pred-bar').style.width = '89%';
  }, 400);
}

/* ═══════════════════════════════════════════════════════════
   CHAPTER 5 — WALKTHROUGH STEPS
   ═══════════════════════════════════════════════════════════ */
const steps = [
  {
    title: 'Step 1: Encoding',
    eli5: 'Each word gets turned into a list of numbers (a vector) that captures its meaning. Think of it like giving each word a unique fingerprint.',
    formula: 'x_i = Embedding(token_i)  →  x_i ∈ ℝ^d',
    viz: 'encoding'
  },
  {
    title: 'Step 2: Score Calculation',
    eli5: 'We compare every word to every other word using a dot product — a mathematical way to measure "How related are these two words?"',
    formula: 'score(i,j) = q_i · k_j = Σ q_i[d] × k_j[d]',
    viz: 'scores'
  },
  {
    title: 'Step 3: Softmax Normalization',
    eli5: 'The raw scores get squished into probabilities that add up to 1. This is the "attention distribution" — how much focus each word deserves.',
    formula: 'α_j = exp(score_j) / Σ_k exp(score_k)',
    viz: 'softmax'
  },
  {
    title: 'Step 4: Context Vector',
    eli5: 'We create a weighted mix of all word vectors, where each word contributes proportionally to its attention weight. This "context vector" is the final output.',
    formula: 'context = Σ_j α_j × v_j',
    viz: 'context'
  }
];

let showMode = 'eli5'; // 'eli5' or 'formula'

function buildStepIndicator() {
  const ind = document.getElementById('step-indicator');
  ind.innerHTML = '';
  steps.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'step-dot' + (i === state.currentStep ? ' active' : '') + (i < state.currentStep ? ' done' : '');
    ind.appendChild(dot);
  });
}

function renderStep() {
  const step = steps[state.currentStep];
  const container = document.getElementById('step-content');
  buildStepIndicator();
  document.getElementById('step-prev').style.opacity = state.currentStep === 0 ? '0.3' : '1';
  document.getElementById('step-next').textContent = state.currentStep === steps.length - 1 ? 'Done ✓' : 'Next →';

  let vizHTML = '';
  const sampleWords = ['The', 'cat', 'sat'];

  if (step.viz === 'encoding') {
    vizHTML = `<div style="display:flex;gap:30px;justify-content:center;align-items:center;flex-wrap:wrap;margin:20px 0;">
      ${sampleWords.map((w, i) => `<div style="text-align:center;">
        <div style="font-family:var(--font-mono);color:var(--neon-blue);margin-bottom:8px;">${w}</div>
        <div style="display:flex;gap:2px;justify-content:center;">
          ${Array.from({length:6}, (_,j) => {
            const h = 10 + Math.random() * 25;
            const hue = 190 + i * 40;
            return `<div class="vector-dim" style="height:${h}px;background:hsl(${hue},70%,${50+j*3}%);animation:floatUp ${1.5+j*0.2}s ease infinite;animation-delay:${i*0.3+j*0.1}s;"></div>`;
          }).join('')}
        </div>
        <div class="mono dim" style="font-size:0.6rem;margin-top:4px;">[0.2, -0.5, 0.8, ...]</div>
      </div>`).join('<div style="font-size:1.5rem;color:var(--text-dim);">→</div>')}
    </div>`;
  } else if (step.viz === 'scores') {
    vizHTML = `<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:20px 0;">
      ${['cat·sat', 'cat·the', 'sat·cat'].map((pair, i) => {
        const score = (2.5 + Math.random() * 3).toFixed(1);
        return `<div class="card" style="padding:16px;text-align:center;min-width:100px;animation:fadeSlideIn 0.5s ease;animation-delay:${i*0.3}s;animation-fill-mode:both;">
          <div class="mono dim" style="font-size:0.75rem;">${pair}</div>
          <div style="font-size:1.8rem;font-weight:700;color:var(--neon-purple);margin:8px 0;">${score}</div>
          <div class="dim" style="font-size:0.7rem;">dot product</div>
        </div>`;
      }).join('')}
    </div>`;
  } else if (step.viz === 'softmax') {
    const vals = [0.65, 0.25, 0.10];
    vizHTML = `<div style="display:flex;gap:12px;justify-content:center;align-items:flex-end;margin:20px 0;height:120px;">
      ${vals.map((v, i) => `<div style="text-align:center;">
        <div class="mono" style="font-size:0.75rem;color:var(--neon-blue);margin-bottom:4px;">${(v*100).toFixed(0)}%</div>
        <div style="width:50px;height:${v*100}px;background:linear-gradient(180deg,var(--neon-blue),var(--neon-purple));border-radius:6px 6px 0 0;transition:height 1s ease;box-shadow:0 0 10px rgba(0,212,255,${v});"></div>
        <div class="mono dim" style="font-size:0.7rem;margin-top:4px;">${sampleWords[i]}</div>
      </div>`).join('')}
    </div>
    <div class="mono dim" style="font-size:0.75rem;text-align:center;">Σ = 100% (probabilities sum to 1)</div>`;
  } else if (step.viz === 'context') {
    vizHTML = `<div style="text-align:center;margin:20px 0;">
      <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin-bottom:20px;">
        ${['0.65 × v_cat', '0.25 × v_sat', '0.10 × v_the'].map((t, i) => `<div style="background:rgba(0,212,255,${0.1+i*0.05});padding:8px 14px;border-radius:8px;font-family:var(--font-mono);font-size:0.8rem;border:1px solid rgba(0,212,255,0.2);animation:fadeSlideIn 0.5s ease;animation-delay:${i*0.2}s;animation-fill-mode:both;">${t}</div>`).join('<span style="color:var(--text-dim);">+</span>')}
      </div>
      <div style="font-size:1.2rem;color:var(--text-dim);margin:10px 0;">↓ weighted sum</div>
      <div style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(168,85,247,0.15));border:2px solid var(--neon-blue);border-radius:12px;font-family:var(--font-mono);font-weight:700;box-shadow:0 0 25px rgba(0,212,255,0.3);animation:borderGlow 2s infinite;">
        Context Vector
      </div>
      <div class="dim" style="font-size:0.8rem;margin-top:10px;">→ fed into output layer for prediction</div>
    </div>`;
  }

  container.innerHTML = `
    <div class="step-content">
      <h3 style="margin-bottom:6px;">${step.title}</h3>
      <div class="toggle-row">
        <button class="toggle-btn ${showMode==='eli5'?'active':''}" onclick="showMode='eli5';renderStep();">🗣️ ELI5</button>
        <button class="toggle-btn ${showMode==='formula'?'active':''}" onclick="showMode='formula';renderStep();">📐 Show Formula</button>
      </div>
      <p style="max-width:500px;margin:0 auto 16px;color:var(--text-dim);font-size:0.95rem;">
        ${showMode === 'eli5' ? step.eli5 : `<code style="font-family:var(--font-mono);color:var(--neon-purple);font-size:1rem;">${step.formula}</code>`}
      </p>
      ${vizHTML}
    </div>
  `;
}

function changeStep(dir) {
  const next = state.currentStep + dir;
  if (next < 0 || next >= steps.length) return;
  state.currentStep = next;
  renderStep();
}
renderStep();

/* Auto-advance timer */
let stepAutoTimer = null;
function startAutoAdvance() {
  clearInterval(stepAutoTimer);
  stepAutoTimer = setInterval(() => {
    if (state.currentStep < steps.length - 1) {
      state.currentStep++;
      renderStep();
    } else {
      clearInterval(stepAutoTimer);
    }
  }, 6000);
}

/* ═══════════════════════════════════════════════════════════
   CHAPTER 6 — BUILD YOUR OWN ATTENTION
   ═══════════════════════════════════════════════════════════ */
const ch6Words = ['I', 'absolutely', 'loved', 'the', 'terrible', 'ending'];
const ch6ModelWeights = [0.05, 0.18, 0.22, 0.03, 0.35, 0.17];
const ch6Sentiments = { positive: ['absolutely', 'loved'], negative: ['terrible'] };

function buildWeightGrid() {
  const grid = document.getElementById('weight-grid');
  grid.innerHTML = '';
  state.userWeights = ch6Words.map(() => 0.167);
  ch6Words.forEach((word, i) => {
    const item = document.createElement('div');
    item.className = 'weight-item';
    item.innerHTML = `
      <div class="word">${word}</div>
      <input type="range" min="0" max="100" value="17" id="w-slider-${i}" data-idx="${i}" />
      <div class="val" id="w-val-${i}">17%</div>
      <div class="model-bar" id="w-model-${i}" style="width:0;opacity:0;"></div>
    `;
    grid.appendChild(item);
    item.querySelector('input').addEventListener('input', function() {
      state.userWeights[i] = parseInt(this.value) / 100;
      document.getElementById('w-val-' + i).textContent = this.value + '%';
      updateUserPred();
    });
  });
}

function updateUserPred() {
  // Compute sentiment from weights
  let posScore = 0, negScore = 0;
  ch6Words.forEach((w, i) => {
    if (ch6Sentiments.positive.includes(w.toLowerCase())) posScore += state.userWeights[i];
    if (ch6Sentiments.negative.includes(w.toLowerCase())) negScore += state.userWeights[i];
  });
  const total = posScore + negScore || 1;
  const conf = Math.round(Math.max(posScore, negScore) / total * 100);
  const sentiment = posScore > negScore ? 'Positive' : negScore > posScore ? 'Negative' : 'Neutral';
  document.getElementById('user-pred').textContent = sentiment;
  document.getElementById('user-conf').textContent = conf + '%';
}

function compareWeights() {
  if (state.ch6Compared) return;
  state.ch6Compared = true;
  // Show model bars
  ch6ModelWeights.forEach((w, i) => {
    const bar = document.getElementById('w-model-' + i);
    bar.style.opacity = '1';
    setTimeout(() => { bar.style.width = (w * 100) + '%'; }, i * 150);
  });
  // Calculate overlap
  const normalized = normalizeWeights(state.userWeights);
  let overlap = 0;
  ch6ModelWeights.forEach((w, i) => {
    overlap += Math.min(normalized[i], w);
  });
  const pct = Math.round(overlap * 100);
  const emoji = pct > 70 ? '🔥' : pct > 40 ? '👍' : '🤔';
  document.getElementById('compare-result').style.display = 'block';
  document.getElementById('compare-result').innerHTML = `
    <div style="font-size:1.3rem;font-weight:700;margin-bottom:8px;">You matched <span class="gradient-text">${pct}%</span> of model attention ${emoji}</div>
    <div style="font-size:0.85rem;color:var(--text-dim);">Purple bars = model weights. The model focused heavily on <strong style="color:var(--neon-purple);">"terrible"</strong> — catching the negative sentiment.</div>
  `;
}

function normalizeWeights(w) {
  const s = w.reduce((a, b) => a + b, 0) || 1;
  return w.map(v => v / s);
}

buildWeightGrid();

/* ═══════════════════════════════════════════════════════════
   CHAPTER 7 — GUESS THE FOCUS GAME
   ═══════════════════════════════════════════════════════════ */
const gameRounds = [
  {
    sentence: 'The bank by the river was flooded',
    target: 'bank',
    answers: ['river', 'flooded'],
    explanation: '"bank" is ambiguous — the model attends to "river" and "flooded" to resolve it as a riverbank, not a financial institution.'
  },
  {
    sentence: 'She did not enjoy the movie at all',
    target: 'enjoy',
    answers: ['not', 'all'],
    explanation: '"enjoy" needs "not" (negation) and "all" (intensifier) to correctly interpret the negative sentiment.'
  },
  {
    sentence: 'The dog chased the cat that scratched it',
    target: 'it',
    answers: ['dog', 'cat'],
    explanation: '"it" is a pronoun — the model attends to "dog" and "cat" to resolve the co-reference (it = the dog).'
  }
];

function renderGameRound() {
  if (state.gameRound >= gameRounds.length) {
    showGameFinal();
    return;
  }
  const round = gameRounds[state.gameRound];
  state.gameSelections = [];
  state.gameRevealed = false;
  document.getElementById('game-round-label').textContent = `Round ${state.gameRound + 1}/${gameRounds.length}`;
  document.getElementById('game-progress-fill').style.width = (state.gameRound / gameRounds.length * 100) + '%';
  document.getElementById('game-reveal-btn').style.display = 'inline-flex';
  document.getElementById('game-feedback').style.display = 'none';

  const sentDiv = document.getElementById('game-sentence');
  sentDiv.innerHTML = '';
  round.sentence.split(' ').forEach(word => {
    const span = document.createElement('span');
    span.className = 'game-word';
    span.textContent = word;
    if (word.toLowerCase() === round.target.toLowerCase()) {
      span.classList.add('target');
      span.style.pointerEvents = 'none';
    } else {
      span.onclick = () => toggleGameWord(span, word);
    }
    sentDiv.appendChild(span);
  });
}

function toggleGameWord(el, word) {
  if (state.gameRevealed) return;
  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    state.gameSelections = state.gameSelections.filter(w => w !== word.toLowerCase());
  } else {
    if (state.gameSelections.length >= 3) return; // Max 3 selections
    el.classList.add('selected');
    state.gameSelections.push(word.toLowerCase());
  }
}

function revealGameAnswer() {
  if (state.gameRevealed) return;
  state.gameRevealed = true;
  const round = gameRounds[state.gameRound];
  const words = document.querySelectorAll('#game-sentence .game-word');
  let roundScore = 0;

  words.forEach(w => {
    const word = w.textContent.toLowerCase();
    const isAnswer = round.answers.includes(word);
    const isSelected = state.gameSelections.includes(word);
    if (isAnswer && isSelected) { w.classList.add('correct'); w.classList.remove('selected'); roundScore++; }
    else if (isAnswer && !isSelected) { w.classList.add('correct'); }
    else if (!isAnswer && isSelected) { w.classList.add('wrong'); w.classList.remove('selected'); }
  });

  state.gameScore += roundScore;
  const fb = document.getElementById('game-feedback');
  fb.style.display = 'block';
  fb.innerHTML = `
    <div style="margin-bottom:8px;">${roundScore === round.answers.length ? '🎯 Perfect!' : roundScore > 0 ? '👍 Partially correct!' : '❌ Not quite!'}</div>
    <div style="color:var(--text-dim);font-size:0.85rem;">${round.explanation}</div>
  `;

  document.getElementById('game-reveal-btn').textContent = state.gameRound < gameRounds.length - 1 ? 'Next Round →' : 'See Results →';
  document.getElementById('game-reveal-btn').onclick = () => {
    state.gameRound++;
    renderGameRound();
  };
}

function showGameFinal() {
  const total = gameRounds.reduce((s, r) => s + r.answers.length, 0);
  const pct = Math.round(state.gameScore / total * 100);
  const label = pct >= 80 ? 'You think like Attention 🔥' : pct >= 50 ? 'Good instincts! 💡' : 'Needs tuning ⚙️';
  document.getElementById('game-progress-fill').style.width = '100%';
  document.querySelector('#ch7 .card').style.display = 'none';
  document.getElementById('game-final').style.display = 'block';
  document.getElementById('game-final').innerHTML = `
    <div class="report-card">
      <h3 class="gradient-text">Game Results</h3>
      <div class="score-big gradient-text">${pct}%</div>
      <p style="font-size:1.1rem;margin-bottom:10px;">${label}</p>
      <div class="stat-row">
        <div class="stat"><div class="stat-val" style="color:var(--neon-green);">${state.gameScore}</div><div class="stat-label">Correct</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--text-dim);">${total}</div><div class="stat-label">Total</div></div>
      </div>
    </div>
  `;
}

renderGameRound();

/* ═══════════════════════════════════════════════════════════
   CHAPTER 8 — HEATMAP PLAYGROUND
   ═══════════════════════════════════════════════════════════ */
const presets = [
  'The cat sat on the mat because it was tired',
  'She did not enjoy the movie at all',
  'The bank by the river was flooded',
  'I love this product it is amazing',
  'Despite being late he finished first',
];

function buildPresets() {
  const row = document.getElementById('preset-chips');
  presets.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = p.slice(0, 35) + (p.length > 35 ? '...' : '');
    chip.onclick = () => {
      document.getElementById('heatmap-input').value = p;
      renderHeatmap();
    };
    row.appendChild(chip);
  });
}

function simAttnWeights(words, focusIdx) {
  // Simple simulated attention using word similarity heuristics
  const n = words.length;
  const weights = [];
  const focus = words[focusIdx].toLowerCase();
  // Content words get more weight
  const stopWords = new Set(['the','a','an','is','was','were','are','on','in','at','to','of','and','or','but','it','that','this','by']);
  const negWords = new Set(['not','never','no','neither','nor','barely','hardly']);

  for (let i = 0; i < n; i++) {
    const w = words[i].toLowerCase();
    let score = 0.5;
    // Self attention boost
    if (i === focusIdx) score += 0.5;
    // Content word boost
    if (!stopWords.has(w)) score += 1.5;
    // Negation boost
    if (negWords.has(w)) score += 2;
    // Distance penalty (mild)
    score -= Math.abs(i - focusIdx) * 0.05;
    // Sentiment words boost
    if (['love','loved','amazing','great','terrible','awful','hate','beautiful','ugly','enjoy','enjoyed'].includes(w)) score += 1.5;
    // Position variety
    score += Math.random() * 0.3;
    weights.push(Math.max(0.1, score));
  }
  // Normalize
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
}

function renderHeatmap() {
  const input = document.getElementById('heatmap-input').value.trim();
  if (!input) return;
  const words = input.split(/\s+/);
  state.heatmapFocused = state.heatmapFocused >= 0 && state.heatmapFocused < words.length ? state.heatmapFocused : 0;
  const weights = simAttnWeights(words, state.heatmapFocused);
  const maxW = Math.max(...weights);
  const display = document.getElementById('heatmap-display');
  display.innerHTML = '';

  words.forEach((word, i) => {
    const el = document.createElement('div');
    el.className = 'heatmap-word' + (i === state.heatmapFocused ? ' focused' : '');
    el.textContent = word;
    const intensity = weights[i] / maxW;
    // Cool to hot: blue (0) -> purple (0.33) -> orange (0.66) -> red (1)
    const hue = 240 - intensity * 240; // 240 (blue) -> 0 (red)
    const sat = 60 + intensity * 40;
    const light = 30 + intensity * 30;
    el.style.background = `hsla(${hue}, ${sat}%, ${light}%, 0.4)`;
    el.style.color = `hsl(${hue}, ${sat}%, ${Math.min(90, light + 30)}%)`;
    el.style.borderColor = `hsla(${hue}, ${sat}%, ${light}%, 0.6)`;
    const weightPct = (weights[i] * 100).toFixed(1);
    el.title = `Weight: ${weightPct}%`;
    el.onclick = () => {
      state.heatmapFocused = i;
      renderHeatmap();
    };
    display.appendChild(el);
  });
}

buildPresets();
renderHeatmap();

document.getElementById('heatmap-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { state.heatmapFocused = 0; renderHeatmap(); }
});

/* ═══════════════════════════════════════════════════════════
   CHAPTER 9 — QUIZ
   ═══════════════════════════════════════════════════════════ */
const quizQuestions = [
  {
    q: 'What is the main limitation of vanilla LSTM?',
    options: [
      'It cannot process text at all',
      'It struggles with long-range dependencies due to memory decay',
      'It only works on numbers, not text',
      'It requires too much training data'
    ],
    correct: 1,
    explanation: 'LSTMs process sequences step-by-step. Information from early tokens decays as the hidden state travels through many timesteps, making long-range dependencies hard to capture.'
  },
  {
    q: 'What does the Attention mechanism allow the model to do?',
    options: [
      'Skip words it thinks are unimportant',
      'Process words in random order',
      'Directly attend to any word in the sequence regardless of distance',
      'Replace the entire LSTM architecture'
    ],
    correct: 2,
    explanation: 'Attention creates direct connections between all positions in a sequence, allowing the model to "look at" any word regardless of how far away it is.'
  },
  {
    q: 'In the sentence "She did not enjoy it," which word should receive the highest attention when predicting sentiment?',
    options: ['"She"', '"not"', '"enjoy"', '"it"'],
    correct: 1,
    explanation: '"not" is the critical negation word that flips the sentiment from positive to negative. Attention correctly identifies its importance.'
  },
  {
    q: 'What mathematical operation is used to compute attention scores between two word vectors?',
    options: ['Cross product', 'Dot product', 'Division', 'Modulo'],
    correct: 1,
    explanation: 'The dot product measures the similarity between two vectors. Higher dot products mean the words are more "related" in the model\'s learned representation space.'
  },
  {
    q: 'The Attention mechanism is the foundation of which modern architecture?',
    options: ['Convolutional Neural Networks (CNNs)', 'Random Forests', 'Transformers (BERT, GPT)', 'Support Vector Machines'],
    correct: 2,
    explanation: 'The 2017 paper "Attention Is All You Need" introduced the Transformer, which uses self-attention as its core mechanism. BERT, GPT, and virtually all modern NLP models are Transformers.'
  }
];

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (state.quizCurrent >= quizQuestions.length) {
    showQuizFinal();
    return;
  }
  const q = quizQuestions[state.quizCurrent];
  state.quizAnswered = false;
  container.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:0.8rem;color:var(--neon-blue);margin-bottom:10px;">Question ${state.quizCurrent + 1} of ${quizQuestions.length}</div>
    <h3 style="margin-bottom:20px;font-size:1.1rem;">${q.q}</h3>
    <div id="quiz-options">
      ${q.options.map((opt, i) => `<button class="quiz-option" data-idx="${i}" onclick="answerQuiz(${i})">${opt}</button>`).join('')}
    </div>
    <div id="quiz-explanation" style="display:none;"></div>
    <div style="text-align:center;margin-top:16px;">
      <div class="quiz-score-display">Score: <span class="gradient-text">${state.quizScore}</span> / ${quizQuestions.length}</div>
    </div>
  `;
}

function answerQuiz(idx) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;
  const q = quizQuestions[state.quizCurrent];
  const options = document.querySelectorAll('.quiz-option');
  options.forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === q.correct) opt.classList.add('correct-answer');
    if (i === idx && idx !== q.correct) opt.classList.add('wrong-answer');
  });
  if (idx === q.correct) state.quizScore++;
  document.getElementById('quiz-explanation').style.display = 'block';
  document.getElementById('quiz-explanation').innerHTML = `
    <div class="quiz-explanation">
      ${idx === q.correct ? '✅ Correct!' : '❌ Incorrect.'} ${q.explanation}
    </div>
    <button class="btn btn-primary btn-small" style="margin-top:12px;" onclick="state.quizCurrent++;renderQuiz();">
      ${state.quizCurrent < quizQuestions.length - 1 ? 'Next Question →' : 'See Results →'}
    </button>
  `;
  // Update score display
  document.querySelector('.quiz-score-display').innerHTML = `Score: <span class="gradient-text">${state.quizScore}</span> / ${quizQuestions.length}`;
}

function showQuizFinal() {
  const container = document.getElementById('quiz-container');
  const pct = Math.round(state.quizScore / quizQuestions.length * 100);
  container.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <h3 class="gradient-text" style="margin-bottom:10px;">Quiz Complete!</h3>
      <div style="font-size:3rem;font-weight:900;margin:10px 0;" class="gradient-text">${state.quizScore}/${quizQuestions.length}</div>
      <p style="color:var(--text-dim);">${pct >= 80 ? 'Outstanding! You really understand Attention! 🔥' : pct >= 60 ? 'Good job! Review the concepts above to improve. 💡' : 'Keep learning! Try scrolling through the chapters again. 📚'}</p>
      <button class="btn btn-primary" style="margin-top:20px;" onclick="scrollToChapter(11)">See Final Report →</button>
    </div>
  `;
  // Generate final report
  generateFinalReport();
}

renderQuiz();

/* ═══════════════════════════════════════════════════════════
   FINAL REPORT CARD
   ═══════════════════════════════════════════════════════════ */
function generateFinalReport() {
  const totalGame = gameRounds.reduce((s, r) => s + r.answers.length, 0);
  const gamePct = Math.round(state.gameScore / totalGame * 100);
  const quizPct = Math.round(state.quizScore / quizQuestions.length * 100);
  const overall = Math.round((gamePct + quizPct) / 2);
  const grade = overall >= 90 ? 'A+' : overall >= 80 ? 'A' : overall >= 70 ? 'B+' : overall >= 60 ? 'B' : overall >= 50 ? 'C' : 'D';
  const title = overall >= 80 ? 'Attention Master 🔥' : overall >= 60 ? 'Attention Apprentice 💡' : 'Attention Student 📚';

  document.getElementById('final-report').innerHTML = `
    <div class="report-card" id="neural-report-card">
      <div style="font-family:var(--font-mono);font-size:0.7rem;letter-spacing:2px;color:var(--neon-blue);margin-bottom:6px;">NEURAL REPORT CARD</div>
      <h3 class="gradient-text" style="font-size:1.5rem;">${title}</h3>
      <div class="score-big gradient-text">${grade}</div>
      <div class="stat-row">
        <div class="stat">
          <div class="stat-val" style="color:var(--neon-blue);">${gamePct}%</div>
          <div class="stat-label">Game Score</div>
        </div>
        <div class="stat">
          <div class="stat-val" style="color:var(--neon-purple);">${quizPct}%</div>
          <div class="stat-label">Quiz Score</div>
        </div>
        <div class="stat">
          <div class="stat-val" style="color:var(--neon-green);">${overall}%</div>
          <div class="stat-label">Overall</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:var(--text-dim);margin-top:16px;">How Attention Fixed LSTM • Interactive Learning</div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   CHAPTER 2 — WORD WEB PHYSICS
   ═══════════════════════════════════════════════════════════ */
const ch2State = {
  words: [], nodes: [], edges: [],
  hoveredNode: null, focusedNode: null,
  mode: 'default', animationId: null, draggedNode: null
};

function initWordWeb(sentence) {
  const container = document.getElementById('ch2-web-container');
  const canvas = document.getElementById('ch2-canvas');
  if (!container || !canvas) return;
  const ctx = canvas.getContext('2d');
  
  const dpr = window.devicePixelRatio || 1;
  const cw = container.offsetWidth;
  const ch = container.offsetHeight;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  ctx.scale(dpr, dpr);
  
  ch2State.words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
  const stopWords = new Set(['the','a','an','is','was','were','are','on','in','at','to','of','and','or','but','it','that','this','by','because']);
  
  ch2State.nodes = ch2State.words.map((word, i) => {
    return {
      id: i, word: word,
      x: cw / 2 + (Math.random() - 0.5) * (cw * 0.5),
      y: ch / 2 + (Math.random() - 0.5) * (ch * 0.5),
      vx: 0, vy: 0,
      radius: 20 + Math.min(word.length * 2.5, 25),
      isStopWord: stopWords.has(word.toLowerCase()),
      mass: stopWords.has(word.toLowerCase()) ? 0.8 : 1.5,
      hue: stopWords.has(word.toLowerCase()) ? 200 : 270
    };
  });
  
  ch2State.edges = [];
  for (let i = 0; i < ch2State.nodes.length; i++) {
    for (let j = i + 1; j < ch2State.nodes.length; j++) {
      const n1 = ch2State.nodes[i];
      const n2 = ch2State.nodes[j];
      let strength = 0.1 + Math.random() * 0.3; // base weak
      
      const w1 = n1.word.toLowerCase();
      const w2 = n2.word.toLowerCase();
      
      if ((w1 === 'it' && ['cat', 'tired'].includes(w2)) || (w2 === 'it' && ['cat', 'tired'].includes(w1))) {
        strength = 0.85 + Math.random() * 0.1;
      }
      if (['cat', 'mat'].includes(w1) && ['tired', 'sat'].includes(w2) || ['cat', 'mat'].includes(w2) && ['tired', 'sat'].includes(w1)) {
        strength = 0.6 + Math.random() * 0.2;
      }
      if (Math.abs(i - j) === 1 && strength < 0.5) strength += 0.2;
      
      strength = Math.min(0.99, Math.max(0.01, strength));
      
      ch2State.edges.push({
        source: i, target: j, strength: strength,
        length: 150 - (strength * 80)
      });
    }
  }
  
  if (ch2State.animationId) cancelAnimationFrame(ch2State.animationId);
  updateWordWeb(ctx, cw, ch);
}

function updateWordWeb(ctx, cw, ch) {
  const repulsion = 2000;
  const springK = 0.04;
  const dampening = 0.85;
  
  for (let i = 0; i < ch2State.nodes.length; i++) {
    for (let j = i + 1; j < ch2State.nodes.length; j++) {
      const n1 = ch2State.nodes[i];
      const n2 = ch2State.nodes[j];
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) || 1;
      
      const repForce = repulsion / distSq;
      const fx = (dx / dist) * repForce;
      const fy = (dy / dist) * repForce;
      
      n1.vx -= fx / n1.mass; n1.vy -= fy / n1.mass;
      n2.vx += fx / n2.mass; n2.vy += fy / n2.mass;
    }
  }
  
  ch2State.edges.forEach(edge => {
    const n1 = ch2State.nodes[edge.source];
    const n2 = ch2State.nodes[edge.target];
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    
    const force = (dist - edge.length) * springK * edge.strength;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    
    n1.vx += fx / n1.mass; n1.vy += fy / n1.mass;
    n2.vx -= fx / n2.mass; n2.vy -= fy / n2.mass;
  });
  
  ch2State.nodes.forEach(n => {
    const dx = (cw / 2) - n.x;
    const dy = (ch / 2) - n.y;
    n.vx += dx * 0.01; n.vy += dy * 0.01; // center gravity
    
    if (ch2State.draggedNode && ch2State.draggedNode.id === n.id) {
       n.vx = 0; n.vy = 0;
    } else {
       n.vx *= dampening; n.vy *= dampening;
       n.x += n.vx; n.y += n.vy;
    }
    
    // Bounds checking
    n.x = Math.max(n.radius, Math.min(cw - n.radius, n.x));
    n.y = Math.max(n.radius, Math.min(ch - n.radius, n.y));
  });
  
  drawWordWeb(ctx, cw, ch);
  ch2State.animationId = requestAnimationFrame(() => updateWordWeb(ctx, cw, ch));
}

function drawWordWeb(ctx, cw, ch) {
  ctx.clearRect(0, 0, cw, ch);
  
  let showEdges = ch2State.edges;
  let modeHover = ch2State.hoveredNode !== null;
  let modeFocus = ch2State.focusedNode !== null;
  let activeNodeId = ch2State.focusedNode !== null ? ch2State.focusedNode : ch2State.hoveredNode;
  
  if (ch2State.mode === 'strong') {
    showEdges = ch2State.edges.filter(e => e.strength >= 0.6);
  } else if (ch2State.mode === 'default' && !modeHover && !modeFocus) {
    showEdges = ch2State.edges.filter(e => e.strength > 0.65);
  }
  
  // Edges
  showEdges.forEach(edge => {
    let isActiveEdge = (activeNodeId !== null) && (edge.source === activeNodeId || edge.target === activeNodeId);
    if ((modeHover || modeFocus) && !isActiveEdge && ch2State.mode === 'default') return;
    
    const n1 = ch2State.nodes[edge.source];
    const n2 = ch2State.nodes[edge.target];
    
    let opacity = isActiveEdge ? edge.strength : edge.strength * 0.3;
    if (ch2State.mode === 'all') opacity = edge.strength * 0.6;
    if (ch2State.mode === 'strong') opacity = edge.strength * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    const colorInt = isActiveEdge ? (edge.strength > 0.6 ? 280 : 200) : 200;
    ctx.strokeStyle = `hsla(${colorInt}, 80%, 65%, ${opacity})`;
    ctx.lineWidth = isActiveEdge ? edge.strength * 4 : Math.max(1, edge.strength * 2);
    ctx.stroke();
    
    if (isActiveEdge && edge.strength > 0.2) {
      const mx = (n1.x + n2.x) / 2;
      const my = (n1.y + n2.y) / 2;
      ctx.fillStyle = `rgba(255,255,255,${opacity + 0.2})`;
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(edge.strength * 100) + '%', mx, my - 5);
    }
  });
  
  // Nodes
  ch2State.nodes.forEach(n => {
    let isActive = activeNodeId === n.id;
    let isConnected = false;
    
    if (activeNodeId !== null) {
      isConnected = showEdges.some(e => 
        (e.source === activeNodeId && e.target === n.id) || 
        (e.target === activeNodeId && e.source === n.id)
      );
    }
    
    let opacity = 1.0;
    if ((modeHover || modeFocus)) {
       opacity = (isActive || isConnected) ? 1.0 : 0.2;
    }
    
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${n.hue}, 80%, 15%, ${opacity})`;
    ctx.fill();
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.strokeStyle = `hsla(${n.hue}, 80%, ${isActive ? 80 : 65}%, ${opacity})`;
    ctx.stroke();
    
    if (isActive) {
      ctx.shadowColor = `hsla(${n.hue}, 80%, 65%, 0.8)`;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.font = '13px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.word, n.x, n.y);
  });
}

const setupWordWebEvents = () => {
    const canvas = document.getElementById('ch2-canvas');
    if (!canvas) return;
    const container = document.getElementById('ch2-web-container');
    let rect = canvas.getBoundingClientRect();
    
    window.addEventListener('resize', () => {
      if (state.currentChapter !== 2) return;
      rect = canvas.getBoundingClientRect();
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    });
    
    const getMousePos = (e) => {
      rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    
    const getNodeAt = (x, y) => {
      for (let i = ch2State.nodes.length - 1; i >= 0; i--) {
        const n = ch2State.nodes[i];
        const dx = n.x - x;
        const dy = n.y - y;
        if ((dx * dx + dy * dy) <= n.radius * n.radius) return n;
      }
      return null;
    };
    
    canvas.addEventListener('mousemove', (e) => {
      const pos = getMousePos(e);
      if (ch2State.draggedNode) {
        ch2State.draggedNode.x = pos.x;
        ch2State.draggedNode.y = pos.y;
      } else {
        const hovered = getNodeAt(pos.x, pos.y);
        ch2State.hoveredNode = hovered ? hovered.id : null;
        container.style.cursor = hovered ? 'grab' : 'default';
      }
    });
    
    canvas.addEventListener('mousedown', (e) => {
      const pos = getMousePos(e);
      const clicked = getNodeAt(pos.x, pos.y);
      if (clicked) {
        ch2State.draggedNode = clicked;
        ch2State.focusedNode = clicked.id;
        container.style.cursor = 'grabbing';
        document.getElementById('ch2-narrative').style.opacity = '0';
      } else {
        ch2State.focusedNode = null;
      }
    });
    
    window.addEventListener('mouseup', () => { 
      ch2State.draggedNode = null; 
      if (ch2State.hoveredNode) container.style.cursor = 'grab';
    });
    canvas.addEventListener('mouseleave', () => { 
      ch2State.hoveredNode = null; 
      ch2State.draggedNode = null;
      container.style.cursor = 'default';
    });
    
    document.getElementById('ch2-input').addEventListener('change', (e) => {
      initWordWeb(e.target.value);
    });
    
    document.getElementById('ch2-toggle-all').addEventListener('click', (e) => {
      ch2State.mode = ch2State.mode === 'all' ? 'default' : 'all';
      e.target.classList.toggle('active', ch2State.mode === 'all');
      document.getElementById('ch2-toggle-strong').classList.remove('active');
    });
    
    document.getElementById('ch2-toggle-strong').addEventListener('click', (e) => {
      ch2State.mode = ch2State.mode === 'strong' ? 'default' : 'strong';
      e.target.classList.toggle('active', ch2State.mode === 'strong');
      document.getElementById('ch2-toggle-all').classList.remove('active');
    });
    
    const ch2Observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        rect = canvas.getBoundingClientRect();
        if (ch2State.nodes.length === 0) {
            initWordWeb(document.getElementById('ch2-input').value);
        }
      }
    });
    ch2Observer.observe(document.getElementById('ch2'));
};

setTimeout(() => {
    setupWordWebEvents();
}, 200);

\nupdateNav();
