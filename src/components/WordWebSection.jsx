import { useEffect, useRef, useState } from 'react';
import './WordWebSection.css';

const WordWebSection = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [sentence, setSentence] = useState('The cat sat on the mat because it was tired');
  const [mode, setMode] = useState('default'); // 'default', 'all', 'strong'
  const stateRef = useRef({
    words: [], nodes: [], edges: [],
    hoveredNode: null, focusedNode: null,
    draggedNode: null, animationId: null
  });

  const initWordWeb = (inputSentence) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
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
    
    const state = stateRef.current;
    state.words = inputSentence.trim().split(/\s+/).filter(w => w.length > 0);
    const stopWords = new Set(['the','a','an','is','was','were','are','on','in','at','to','of','and','or','but','it','that','this','by','because']);
    
    state.nodes = state.words.map((word, i) => {
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
    
    state.edges = [];
    for (let i = 0; i < state.nodes.length; i++) {
      for (let j = i + 1; j < state.nodes.length; j++) {
        const n1 = state.nodes[i];
        const n2 = state.nodes[j];
        let strength = 0.1 + Math.random() * 0.3; // base weak
        
        const w1 = n1.word.toLowerCase();
        const w2 = n2.word.toLowerCase();
        
        if ((w1 === 'it' && ['cat', 'tired'].includes(w2)) || (w2 === 'it' && ['cat', 'tired'].includes(w1))) {
          strength = 0.85 + Math.random() * 0.1;
        }
        if ((['cat', 'mat'].includes(w1) && ['tired', 'sat'].includes(w2)) || (['cat', 'mat'].includes(w2) && ['tired', 'sat'].includes(w1))) {
          strength = 0.6 + Math.random() * 0.2;
        }
        if (Math.abs(i - j) === 1 && strength < 0.5) strength += 0.2;
        
        strength = Math.min(0.99, Math.max(0.01, strength));
        
        state.edges.push({
          source: i, target: j, strength: strength,
          length: 150 - (strength * 80)
        });
      }
    }
    
    if (state.animationId) cancelAnimationFrame(state.animationId);
    updateWordWeb(ctx, cw, ch);
  };

  const updateWordWeb = (ctx, cw, ch) => {
    const state = stateRef.current;
    const repulsion = 2000;
    const springK = 0.04;
    const dampening = 0.85;
    
    for (let i = 0; i < state.nodes.length; i++) {
      for (let j = i + 1; j < state.nodes.length; j++) {
        const n1 = state.nodes[i];
        const n2 = state.nodes[j];
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
    
    state.edges.forEach(edge => {
      const n1 = state.nodes[edge.source];
      const n2 = state.nodes[edge.target];
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const force = (dist - edge.length) * springK * edge.strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      
      n1.vx += fx / n1.mass; n1.vy += fy / n1.mass;
      n2.vx -= fx / n2.mass; n2.vy -= fy / n2.mass;
    });
    
    state.nodes.forEach(n => {
      const dx = (cw / 2) - n.x;
      const dy = (ch / 2) - n.y;
      n.vx += dx * 0.01; n.vy += dy * 0.01; // center gravity
      
      if (state.draggedNode && state.draggedNode.id === n.id) {
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
    state.animationId = requestAnimationFrame(() => updateWordWeb(ctx, cw, ch));
  };

  const drawWordWeb = (ctx, cw, ch) => {
    const state = stateRef.current;
    ctx.clearRect(0, 0, cw, ch);
    
    let showEdges = state.edges;
    let modeHover = state.hoveredNode !== null;
    let modeFocus = state.focusedNode !== null;
    let activeNodeId = state.focusedNode !== null ? state.focusedNode : state.hoveredNode;
    
    if (mode === 'strong') {
      showEdges = state.edges.filter(e => e.strength >= 0.6);
    } else if (mode === 'default' && !modeHover && !modeFocus) {
      showEdges = state.edges.filter(e => e.strength > 0.65);
    }
    
    // Edges
    showEdges.forEach(edge => {
      let isActiveEdge = (activeNodeId !== null) && (edge.source === activeNodeId || edge.target === activeNodeId);
      if ((modeHover || modeFocus) && !isActiveEdge && mode === 'default') return;
      
      const n1 = state.nodes[edge.source];
      const n2 = state.nodes[edge.target];
      
      let opacity = isActiveEdge ? edge.strength : edge.strength * 0.3;
      if (mode === 'all') opacity = edge.strength * 0.6;
      if (mode === 'strong') opacity = edge.strength * 0.8;
      
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
    state.nodes.forEach(n => {
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
  };

  useEffect(() => {
    initWordWeb(sentence);

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const cw = containerRef.current.offsetWidth;
        const ch = containerRef.current.offsetHeight;
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = cw * dpr;
        canvasRef.current.height = ch * dpr;
        canvasRef.current.style.width = cw + 'px';
        canvasRef.current.style.height = ch + 'px';
        const ctx = canvasRef.current.getContext('2d');
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (stateRef.current.animationId) {
        cancelAnimationFrame(stateRef.current.animationId);
      }
    };
  }, [sentence, mode]); // Re-init or handle mode changes

  const getMousePos = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getNodeAt = (x, y) => {
    const state = stateRef.current;
    for (let i = state.nodes.length - 1; i >= 0; i--) {
      const n = state.nodes[i];
      const dx = n.x - x;
      const dy = n.y - y;
      if ((dx * dx + dy * dy) <= n.radius * n.radius) return n;
    }
    return null;
  };

  const handleMouseMove = (e) => {
    const state = stateRef.current;
    const pos = getMousePos(e);
    if (state.draggedNode) {
      state.draggedNode.x = pos.x;
      state.draggedNode.y = pos.y;
    } else {
      const hovered = getNodeAt(pos.x, pos.y);
      state.hoveredNode = hovered ? hovered.id : null;
      if (containerRef.current) {
        containerRef.current.style.cursor = hovered ? 'grab' : 'default';
      }
    }
  };

  const handleMouseDown = (e) => {
    const state = stateRef.current;
    const pos = getMousePos(e);
    const clicked = getNodeAt(pos.x, pos.y);
    if (clicked) {
      state.draggedNode = clicked;
      state.focusedNode = clicked.id;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    } else {
      state.focusedNode = null;
    }
  };

  const handleMouseUp = () => {
    const state = stateRef.current;
    state.draggedNode = null;
    if (state.hoveredNode && containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    const state = stateRef.current;
    state.hoveredNode = null;
    state.draggedNode = null;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <section id="word-web" className="word-web-section">
      <div className="glow-orb blue" style={{ top: '20%', left: '-5%' }} />
      <div className="container">
        <h2 className="section-title">The Word Relationship <span className="gradient-text">Web</span></h2>
        <p className="section-desc">
          In attention, every word can look at every other word — with different strengths. But how does a model learn which connections actually matter?
        </p>

        <div className="card web-card">
          <div className="web-controls">
            <input 
              type="text" 
              className="web-input" 
              value={sentence} 
              onChange={(e) => setSentence(e.target.value)} 
            />
            <div className="toggle-row">
              <button 
                className={`toggle-btn ${mode === 'all' ? 'active' : ''}`} 
                onClick={() => setMode(mode === 'all' ? 'default' : 'all')}
              >
                Show All Connections
              </button>
              <button 
                className={`toggle-btn ${mode === 'strong' ? 'active' : ''}`} 
                onClick={() => setMode(mode === 'strong' ? 'default' : 'strong')}
              >
                Show Only Strong Links
              </button>
            </div>
          </div>
          
          <div 
            id="ch2-web-container" 
            ref={containerRef} 
            className="web-container"
          >
            <canvas 
              ref={canvasRef} 
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        </div>

        <div className="web-footer">
          <a href="#lstm" className="btn btn-primary pulse-btn">But how does a model find these connections? →</a>
          <div className="web-takeaway card card-glow">
            <span className="dim">LSTM reads left to right and tries to remember.</span> <strong className="gradient-text">Attention reads everything at once.</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WordWebSection;
