const fs = require('fs');
let html = fs.readFileSync('attention.html', 'utf8');

// 1. Initial manual replaces
html = html.replace(`scrollToChapter(2)`, `scrollToChapter(3)`);
html = html.replace(`scrollToChapter(10)`, `scrollToChapter(11)`);

// 2. Loop carefully to rename IDs and section titles backward
for (let i = 10; i >= 2; i--) {
    let nextIdx = i + 1;
    let oldStr0 = i < 10 ? `0${i}` : `${i}`;
    let newStr0 = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;
    html = html.replace(`<div class="chapter-tag">Chapter ${oldStr0}</div>`, `<div class="chapter-tag">Chapter ${newStr0}</div>`);
    html = html.replace(`id="ch${i}"`, `id="ch${nextIdx}"`);
    html = html.replace(`CHAPTER ${i} —`, `CHAPTER ${nextIdx} —`);
}

// 3. Fix JS references 
html = html.replace(`chapterId === 'ch3'`, `chapterId === 'ch4'`);
html = html.replace(`chapterId === 'ch4'`, `chapterId === 'ch5'`);

html = html.replace(
    "const chapterNames = ['The Hook','Meet LSTM','LSTM Fails','Enter Attention','How It Works','Build Attention','Guess Focus','Heatmap','Quiz','Takeaways'];",
    "const chapterNames = ['The Hook','Word Web','Meet LSTM','LSTM Fails','Enter Attention','How It Works','Build Attention','Guess Focus','Heatmap','Quiz','Takeaways'];"
);

// 4. Inject new Chapter 2 HTML
const ch2Html = `<!-- ═══════════════════════════════════════════════════════════
     CHAPTER 2 — THE WORD RELATIONSHIP WEB
     ═══════════════════════════════════════════════════════════ -->
<section class="chapter" id="ch2">
  <div class="bg-glow bg-glow-blue" style="top:20%;left:-100px;"></div>
  <div class="chapter-inner animate-in" style="max-width: 1000px;">
    <div class="chapter-tag">Chapter 02</div>
    <h2 class="chapter-title">The Word Relationship <span class="gradient-text">Web</span></h2>
    <p class="chapter-desc" id="ch2-narrative" style="transition: opacity 0.5s;">Every word is connected to every other word — with different strengths. A good model must discover which connections matter.</p>
    
    <div class="card" style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 15px;">
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <input type="text" id="ch2-input" class="heatmap-input" style="flex: 1; min-width: 250px; font-size: 0.9rem; padding: 10px 15px;" value="The cat sat on the mat because it was tired" />
        <div class="toggle-row" style="margin: 0;">
          <button class="toggle-btn" id="ch2-toggle-all">Show All Connections</button>
          <button class="toggle-btn" id="ch2-toggle-strong">Show Only Strong Links</button>
        </div>
      </div>
      
      <div id="ch2-web-container" style="width: 100%; height: 500px; background: var(--bg2); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden; cursor: grab;">
        <canvas id="ch2-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
      </div>
    </div>
    
    <div style="text-align:center; margin-top: 40px;">
        <button class="btn btn-primary" onclick="scrollToChapter(3)" style="animation: pulseNeon 2s infinite;">But how does a model find these connections? →</button>
        <div style="margin-top: 20px;">
          <div class="card card-glow" style="display: inline-block; padding: 15px 25px; font-size: 0.9rem;">
            <span style="color:var(--text-dim);">LSTM reads left to right and tries to remember.</span> <strong class="gradient-text">Attention reads everything at once.</strong>
          </div>
        </div>
    </div>
  </div>
</section>

`;

const splitPattern = `<!-- ═══════════════════════════════════════════════════════════
     CHAPTER 3 — MEET LSTM`;
     
html = html.replace(splitPattern, ch2Html + splitPattern);

// 5. Inject new Chapter 2 JS physics engine
const ch2JS = `/* ═══════════════════════════════════════════════════════════
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
  
  ch2State.words = sentence.trim().split(/\\s+/).filter(w => w.length > 0);
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
    ctx.strokeStyle = \`hsla(\${colorInt}, 80%, 65%, \${opacity})\`;
    ctx.lineWidth = isActiveEdge ? edge.strength * 4 : Math.max(1, edge.strength * 2);
    ctx.stroke();
    
    if (isActiveEdge && edge.strength > 0.2) {
      const mx = (n1.x + n2.x) / 2;
      const my = (n1.y + n2.y) / 2;
      ctx.fillStyle = \`rgba(255,255,255,\${opacity + 0.2})\`;
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
    ctx.fillStyle = \`hsla(\${n.hue}, 80%, 15%, \${opacity})\`;
    ctx.fill();
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.strokeStyle = \`hsla(\${n.hue}, 80%, \${isActive ? 80 : 65}%, \${opacity})\`;
    ctx.stroke();
    
    if (isActive) {
      ctx.shadowColor = \`hsla(\${n.hue}, 80%, 65%, 0.8)\`;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = \`rgba(255,255,255,\${opacity})\`;
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

`;

html = html.replace('updateNav();', ch2JS + '\\nupdateNav();');

fs.writeFileSync('attention.html', html, 'utf8');
console.log('Successfully updated attention.html');
