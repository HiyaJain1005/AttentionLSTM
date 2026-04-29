import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './LSTMSection.css';

export default function LSTMSection() {
  const { tokens, getLSTMDecay } = useApp();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [animationStep, setAnimationStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const decay = getLSTMDecay();

  useEffect(() => {
    if (inView && !isAnimating) {
      setIsAnimating(true);
      let step = 0;
      const interval = setInterval(() => {
        setAnimationStep(step);
        step++;
        if (step >= tokens.length) {
          clearInterval(interval);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [inView]);

  const getOpacity = (idx) => {
    if (animationStep < 0) return 0.2;
    if (idx > animationStep) return 0.15;
    // Decay based on distance from current step
    const distance = animationStep - idx;
    return Math.max(0.15, 1 - distance * 0.12);
  };

  const getInfluence = (idx) => {
    if (hoveredIdx === null) return null;
    const distance = Math.abs(hoveredIdx - idx);
    return Math.max(0, 100 - distance * 15);
  };

  return (
    <section id="lstm" className="lstm-section" ref={ref}>
      <div className="glow-orb blue" style={{ top: '20%', right: '5%' }} />
      
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Section 01</div>
          <h2 className="section-title">
            The Vanilla LSTM Problem
          </h2>
          <p className="section-subtitle">
            LSTMs process sequences left-to-right, passing a hidden state. 
            But earlier information <strong>fades</strong> as the sequence grows longer.
          </p>
        </motion.div>

        {/* Token sequence with hidden state animation */}
        <div className="lstm-visualization">
          <div className="lstm-tokens-row">
            {tokens.map((token, i) => (
              <motion.div
                key={i}
                className="lstm-token-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: i <= animationStep ? 1 : 0.2,
                  y: i <= animationStep ? 0 : 20,
                }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Hidden state arrow */}
                {i > 0 && (
                  <motion.div 
                    className="hidden-state-arrow"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ 
                      scaleX: i <= animationStep ? 1 : 0,
                      opacity: i <= animationStep ? getOpacity(i) : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="arrow-line" style={{
                      background: `linear-gradient(90deg, 
                        rgba(59,130,246,${getOpacity(i-1)}), 
                        rgba(139,92,246,${getOpacity(i)}))`
                    }} />
                    <div className="arrow-head">→</div>
                  </motion.div>
                )}
                
                {/* Token */}
                <div 
                  className={`token lstm-token ${hoveredIdx === i ? 'active' : ''}`}
                  style={{ opacity: getOpacity(i) }}
                >
                  {token}
                </div>

                {/* Memory bar */}
                <div className="memory-bar-container">
                  <motion.div
                    className="memory-bar"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: i <= animationStep ? `${decay[i] * 100}%` : '0%',
                    }}
                    style={{
                      background: `linear-gradient(90deg, 
                        ${decay[i] > 0.5 ? '#10B981' : decay[i] > 0.25 ? '#F59E0B' : '#EF4444'}, 
                        transparent)`
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <span className="memory-label">
                    {i <= animationStep ? `${Math.round(decay[i] * 100)}%` : ''}
                  </span>
                </div>

                {/* Influence tooltip */}
                {hoveredIdx !== null && hoveredIdx !== i && (
                  <motion.div
                    className="influence-badge"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {getInfluence(i)}% influence
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Decay visualization */}
          <motion.div
            className="decay-info"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="decay-chart">
              {decay.map((d, i) => (
                <div key={i} className="decay-bar-wrapper">
                  <motion.div
                    className="decay-bar"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${d * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    style={{
                      background: d > 0.5 ? 'var(--accent-green)' : 
                                  d > 0.25 ? 'var(--accent-amber)' : 'var(--accent-red)',
                    }}
                  />
                  <span className="decay-token-label">{tokens[i]}</span>
                </div>
              ))}
            </div>
            <p className="decay-caption">
              <span className="decay-icon">⚠️</span>
              Memory strength of the <strong>first word "The"</strong> by the time the model reaches each position. 
              Long-term dependencies <span className="text-red">weaken dramatically</span>.
            </p>
          </motion.div>

          {/* Key insight */}
          <motion.div
            className="insight-callout"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <div className="insight-icon">💡</div>
            <div>
              <strong>The Problem:</strong> When the model reaches "it", the information about "cat" 
              (6 words back) has significantly decayed. The LSTM <em>might</em> guess wrong about 
              what "it" refers to.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
