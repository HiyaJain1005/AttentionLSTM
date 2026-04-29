import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './AttentionSection.css';

export default function AttentionSection() {
  const { tokens, focusWord, setFocusWord, sharpness, setSharpness, getAttentionWeights } = useApp();
  const [weights, setWeights] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef(null);
  const tokensRef = useRef([]);

  const updateWeights = useCallback(() => {
    setIsAnimating(true);
    const w = getAttentionWeights(focusWord);
    setWeights(w);
    setTimeout(() => setIsAnimating(false), 500);
  }, [focusWord, sharpness, getAttentionWeights]);

  useEffect(() => {
    updateWeights();
  }, [updateWeights]);

  const getWeightColor = (weight) => {
    const maxW = Math.max(...weights);
    const normalized = weight / maxW;
    if (normalized > 0.7) return 'var(--accent-purple)';
    if (normalized > 0.4) return 'var(--accent-blue)';
    if (normalized > 0.2) return 'var(--accent-cyan)';
    return 'var(--text-dim)';
  };

  const getWeightWidth = (weight) => {
    const maxW = Math.max(...weights);
    return Math.max(1, (weight / maxW) * 5);
  };

  const focusIdx = tokens.indexOf(focusWord);

  return (
    <section id="attention" className="attention-section">
      <div className="glow-orb purple" style={{ top: '10%', left: '5%' }} />
      <div className="glow-orb blue" style={{ bottom: '10%', right: '10%' }} />
      
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Section 02</div>
          <h2 className="section-title">
            The <span className="gradient-text">Attention</span> Solution
          </h2>
          <p className="section-subtitle">
            Instead of relying on a single hidden state, Attention allows the model to 
            <strong> look back at every word</strong> and decide which ones matter most.
          </p>
        </motion.div>

        {/* Attention visualization */}
        <div className="attention-viz-container">
          {/* Connection lines SVG */}
          <div className="attention-connections-area">
            <svg className="attention-svg" ref={svgRef} viewBox="0 0 800 100" preserveAspectRatio="xMidYMid meet">
              {weights.length > 0 && tokens.map((_, i) => {
                if (i === focusIdx) return null;
                const totalTokens = tokens.length;
                const focusX = (focusIdx / (totalTokens - 1)) * 760 + 20;
                const tokenX = (i / (totalTokens - 1)) * 760 + 20;
                const midY = 10;
                
                return (
                  <motion.path
                    key={`line-${i}-${focusWord}`}
                    d={`M ${tokenX} 90 Q ${(tokenX + focusX) / 2} ${midY} ${focusX} 90`}
                    fill="none"
                    stroke={getWeightColor(weights[i])}
                    strokeWidth={getWeightWidth(weights[i])}
                    strokeOpacity={0.6 + (weights[i] / Math.max(...weights)) * 0.4}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Tokens row */}
          <div className="attention-tokens-row">
            {tokens.map((token, i) => {
              const isFocus = token === focusWord;
              const weight = weights[i] || 0;
              const maxW = Math.max(...weights, 0.01);
              const normalized = weight / maxW;
              
              return (
                <motion.div
                  key={i}
                  ref={el => tokensRef.current[i] = el}
                  className={`attention-token-wrap ${isFocus ? 'focus-token' : ''}`}
                  onClick={() => setFocusWord(token)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`token ${isFocus ? 'active' : ''}`}
                    style={{
                      opacity: isFocus ? 1 : 0.3 + normalized * 0.7,
                      borderColor: isFocus ? 'var(--accent-purple)' :
                        normalized > 0.5 ? 'var(--accent-blue)' : 'var(--border-subtle)',
                      boxShadow: normalized > 0.5 && !isFocus ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
                    }}
                  >
                    {token}
                  </div>
                  
                  {/* Weight bar */}
                  <div className="weight-bar-container">
                    <motion.div
                      className="weight-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${normalized * 100}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        background: isFocus ? 'var(--accent-purple)' : 'var(--accent-blue)',
                      }}
                    />
                  </div>
                  <span className="weight-label">
                    {(weight * 100).toFixed(1)}%
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="attention-controls">
            <div className="control-group">
              <label className="control-label">
                🎯 Click any word to set as target
              </label>
              <div className="current-focus">
                Focusing on: <span className="focus-badge">{focusWord}</span>
              </div>
            </div>
            
            <div className="slider-control">
              <label className="control-label">
                Focus Strength (Sharpness): <span className="slider-value">{sharpness.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={sharpness}
                onChange={e => setSharpness(parseFloat(e.target.value))}
              />
              <div className="slider-labels">
                <span>Diffuse</span>
                <span>Sharp</span>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <motion.div
            className="insight-callout attention-insight"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="insight-icon">🧠</div>
            <div>
              <strong>The Solution:</strong> When the model processes "it", Attention assigns a 
              <strong style={{ color: 'var(--accent-purple)' }}> high weight to "cat"</strong> — directly accessing relevant context 
              regardless of distance. No information loss!
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
