import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './PlaygroundSection.css';

// Stable attention computation (no randomness) for playground
function computePlaygroundAttention(tokens, targetIdx, sharpness = 1.5) {
  const n = tokens.length;
  const weights = [];
  
  for (let i = 0; i < n; i++) {
    const distance = Math.abs(i - targetIdx);
    let score = Math.exp(-distance * 0.4 * sharpness);
    
    if (i === targetIdx) score *= 2.0;
    if (i === 0) score *= 1.3;
    if (i === n - 1) score *= 1.15;
    
    // Use deterministic "random" based on character codes
    const charSum = tokens[i].split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    score *= (0.7 + (charSum % 60) / 100);
    
    weights.push(score);
  }
  
  const maxW = Math.max(...weights);
  const expW = weights.map(w => Math.exp((w - maxW) / (1 / Math.max(sharpness, 0.1))));
  const sum = expW.reduce((a, b) => a + b, 0);
  return expW.map(w => w / sum);
}

export default function PlaygroundSection() {
  const [inputText, setInputText] = useState('The student studied hard for the exam because she wanted to pass');
  const [tokens, setTokens] = useState([]);
  const [targetWord, setTargetWord] = useState(null);
  const [weights, setWeights] = useState([]);
  const [isProcessed, setIsProcessed] = useState(false);

  const processText = useCallback(() => {
    const t = inputText.trim().split(/\s+/).filter(Boolean);
    setTokens(t);
    
    if (t.length > 0) {
      const defaultTarget = t.length > 3 ? Math.floor(t.length * 0.7) : 0;
      setTargetWord(defaultTarget);
      const w = computePlaygroundAttention(t, defaultTarget);
      setWeights(w);
      setIsProcessed(true);
    }
  }, [inputText]);

  const selectTarget = useCallback((idx) => {
    setTargetWord(idx);
    const w = computePlaygroundAttention(tokens, idx);
    setWeights(w);
  }, [tokens]);

  const getHeatColor = (weight) => {
    const maxW = Math.max(...weights, 0.01);
    const normalized = weight / maxW;
    
    if (normalized > 0.8) return { bg: 'rgba(139, 92, 246, 0.5)', border: 'rgba(139, 92, 246, 0.7)' };
    if (normalized > 0.6) return { bg: 'rgba(59, 130, 246, 0.4)', border: 'rgba(59, 130, 246, 0.6)' };
    if (normalized > 0.4) return { bg: 'rgba(6, 182, 212, 0.3)', border: 'rgba(6, 182, 212, 0.5)' };
    if (normalized > 0.2) return { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)' };
    return { bg: 'rgba(255, 255, 255, 0.03)', border: 'var(--border-subtle)' };
  };

  return (
    <section id="playground" className="playground-section">
      <div className="glow-orb blue" style={{ top: '20%', right: '5%' }} />
      
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Section 05</div>
          <h2 className="section-title">
            Attention <span className="gradient-text">Playground</span>
          </h2>
          <p className="section-subtitle">
            Type any sentence and see how attention distributes across words.
            Click any word to set it as the target.
          </p>
        </motion.div>

        <div className="playground-container">
          {/* Input area */}
          <div className="playground-input-area">
            <div className="input-row">
              <input
                type="text"
                className="input-field playground-input"
                value={inputText}
                onChange={e => {
                  setInputText(e.target.value);
                  setIsProcessed(false);
                }}
                placeholder="Type a sentence here..."
                onKeyDown={e => e.key === 'Enter' && processText()}
              />
              <button className="btn btn-primary" onClick={processText}>
                Analyze ⚡
              </button>
            </div>
          </div>

          {/* Tokenization */}
          {isProcessed && tokens.length > 0 && (
            <motion.div
              className="playground-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Tokens display */}
              <div className="result-section">
                <div className="result-label">
                  <span className="result-icon">🔤</span> Tokenization ({tokens.length} tokens)
                </div>
                <div className="tokenized-display">
                  {tokens.map((token, i) => (
                    <span key={i} className="tokenized-item">
                      <span className="token-index">{i}</span>
                      {token}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target selection */}
              <div className="result-section">
                <div className="result-label">
                  <span className="result-icon">🎯</span> Click a word to set as target
                </div>
                <div className="target-words">
                  {tokens.map((token, i) => (
                    <motion.button
                      key={i}
                      className={`target-word-btn ${targetWord === i ? 'active' : ''}`}
                      onClick={() => selectTarget(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {token}
                    </motion.button>
                  ))}
                </div>
                {targetWord !== null && (
                  <p className="target-info">
                    Target: <span className="focus-badge">{tokens[targetWord]}</span>
                  </p>
                )}
              </div>

              {/* Heatmap */}
              <div className="result-section">
                <div className="result-label">
                  <span className="result-icon">🔥</span> Attention Heatmap
                </div>
                <div className="heatmap-display">
                  {tokens.map((token, i) => {
                    const color = getHeatColor(weights[i]);
                    return (
                      <motion.div
                        key={i}
                        className={`heatmap-word ${targetWord === i ? 'target' : ''}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          backgroundColor: color.bg,
                          borderColor: color.border,
                        }}
                        onClick={() => selectTarget(i)}
                      >
                        <span className="heatmap-token">{token}</span>
                        <span className="heatmap-weight">{(weights[i] * 100).toFixed(1)}%</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Bar chart */}
              <div className="result-section">
                <div className="result-label">
                  <span className="result-icon">📊</span> Weight Distribution
                </div>
                <div className="weight-chart">
                  {tokens.map((token, i) => {
                    const maxW = Math.max(...weights);
                    const barWidth = (weights[i] / maxW) * 100;
                    return (
                      <div key={i} className="weight-row">
                        <span className="weight-token">{token}</span>
                        <div className="weight-track">
                          <motion.div
                            className="weight-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.5, delay: i * 0.04 }}
                            style={{
                              background: targetWord === i ? 
                                'var(--gradient-accent)' : 'var(--gradient-secondary)',
                            }}
                          />
                        </div>
                        <span className="weight-pct">{(weights[i] * 100).toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
