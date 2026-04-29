import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './ComparisonSection.css';

export default function ComparisonSection() {
  const { tokens, getAttentionWeights, getLSTMDecay, showReasoning, setShowReasoning } = useApp();
  const [selectedWord, setSelectedWord] = useState('it');
  
  const attWeights = getAttentionWeights(selectedWord);
  const lstmDecay = getLSTMDecay();
  const targetIdx = tokens.indexOf(selectedWord);

  // Simulate predictions
  const lstmPrediction = {
    question: `What does "${selectedWord}" refer to?`,
    answer: selectedWord === 'it' ? '"mat" (most recent noun)' : `Context unclear`,
    correct: false,
    confidence: 0.42,
  };

  const attentionPrediction = {
    question: `What does "${selectedWord}" refer to?`,
    answer: selectedWord === 'it' ? '"cat" (highest attention weight)' : `Contextually relevant word`,
    correct: true,
    confidence: 0.89,
  };

  return (
    <section id="comparison" className="comparison-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Section 03</div>
          <h2 className="section-title">
            Side-by-Side: <span className="gradient-text">LSTM vs Attention</span>
          </h2>
          <p className="section-subtitle">
            See how the same input produces different results with and without Attention.
          </p>
        </motion.div>

        {/* Target word selector */}
        <div className="target-selector">
          <span className="selector-label">Target word:</span>
          <div className="selector-tokens">
            {tokens.map((t, i) => (
              <button
                key={i}
                className={`selector-token ${selectedWord === t ? 'active' : ''}`}
                onClick={() => setSelectedWord(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Split comparison */}
        <div className="split-screen">
          {/* LSTM Panel */}
          <motion.div
            className="split-panel lstm"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="panel-header">
              <div className="panel-badge lstm-badge">Vanilla LSTM</div>
              <div className="panel-status wrong">
                <span className="status-dot"></span>
                Likely Incorrect
              </div>
            </div>

            {/* LSTM token view */}
            <div className="panel-tokens">
              {tokens.map((token, i) => (
                <span
                  key={i}
                  className="panel-token"
                  style={{
                    opacity: 0.2 + lstmDecay[i] * 0.8,
                    borderColor: token === selectedWord ? 'var(--accent-amber)' : 'var(--border-subtle)',
                  }}
                >
                  {token}
                </span>
              ))}
            </div>

            {/* Prediction */}
            <div className="prediction-box wrong">
              <div className="prediction-label">Model's Guess</div>
              <div className="prediction-answer">{lstmPrediction.answer}</div>
              <div className="confidence-bar">
                <div className="confidence-label">
                  Confidence: {Math.round(lstmPrediction.confidence * 100)}%
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ background: 'var(--accent-red)' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${lstmPrediction.confidence * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  className="reasoning-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="reasoning-title">Hidden State Decay</div>
                  <div className="reasoning-bars">
                    {tokens.map((token, i) => (
                      <div key={i} className="reasoning-bar-row">
                        <span className="reasoning-token">{token}</span>
                        <div className="reasoning-bar-track">
                          <motion.div
                            className="reasoning-bar-fill"
                            style={{
                              background: lstmDecay[i] > 0.5 ? 'var(--accent-green)' :
                                lstmDecay[i] > 0.25 ? 'var(--accent-amber)' : 'var(--accent-red)',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${lstmDecay[i] * 100}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                          />
                        </div>
                        <span className="reasoning-value">{(lstmDecay[i] * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Attention Panel */}
          <motion.div
            className="split-panel attention"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="panel-header">
              <div className="panel-badge attention-badge">LSTM + Attention</div>
              <div className="panel-status correct">
                <span className="status-dot"></span>
                Correct
              </div>
            </div>

            {/* Attention token view */}
            <div className="panel-tokens">
              {tokens.map((token, i) => {
                const w = attWeights[i] || 0;
                const maxW = Math.max(...attWeights);
                const normalized = w / maxW;
                return (
                  <span
                    key={i}
                    className="panel-token"
                    style={{
                      opacity: 0.3 + normalized * 0.7,
                      borderColor: token === selectedWord ? 'var(--accent-purple)' :
                        normalized > 0.5 ? 'var(--accent-blue)' : 'var(--border-subtle)',
                      background: normalized > 0.5 ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)',
                    }}
                  >
                    {token}
                  </span>
                );
              })}
            </div>

            {/* Prediction */}
            <div className="prediction-box correct">
              <div className="prediction-label">Model's Guess</div>
              <div className="prediction-answer">{attentionPrediction.answer}</div>
              <div className="confidence-bar">
                <div className="confidence-label">
                  Confidence: {Math.round(attentionPrediction.confidence * 100)}%
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ background: 'var(--accent-green)' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${attentionPrediction.confidence * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  className="reasoning-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="reasoning-title">Attention Weights</div>
                  <div className="reasoning-bars">
                    {tokens.map((token, i) => {
                      const w = attWeights[i] || 0;
                      return (
                        <div key={i} className="reasoning-bar-row">
                          <span className="reasoning-token">{token}</span>
                          <div className="reasoning-bar-track">
                            <motion.div
                              className="reasoning-bar-fill"
                              style={{ background: 'var(--accent-blue)' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${w * 100}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                          </div>
                          <span className="reasoning-value">{(w * 100).toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Toggle reasoning */}
        <div className="toggle-row">
          <button
            className={`btn ${showReasoning ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowReasoning(!showReasoning)}
          >
            {showReasoning ? '🔍 Hide Internal Reasoning' : '🔍 Show Internal Reasoning'}
          </button>
        </div>
      </div>
    </section>
  );
}
