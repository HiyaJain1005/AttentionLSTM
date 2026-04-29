import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './HeroSection.css';

const SENTENCE_WORDS = ["The", "cat", "sat", "on", "the", "mat", "because", "it", "was", "tired."];

export default function HeroSection() {
  const [phase, setPhase] = useState(0); // 0=typing, 1=question, 2=ready
  const [visibleWords, setVisibleWords] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [highlightIt, setHighlightIt] = useState(false);

  useEffect(() => {
    if (phase === 0) {
      const interval = setInterval(() => {
        setVisibleWords(prev => {
          if (prev >= SENTENCE_WORDS.length) {
            clearInterval(interval);
            setTimeout(() => {
              setShowQuestion(true);
              setHighlightIt(true);
              setPhase(1);
            }, 600);
            return prev;
          }
          return prev + 1;
        });
      }, 280);
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <section id="hook" className="hero-section">
      {/* Background orbs */}
      <div className="glow-orb blue" style={{ top: '10%', left: '10%' }} />
      <div className="glow-orb purple" style={{ top: '60%', right: '5%' }} />
      
      {/* Grid pattern */}
      <div className="hero-grid-bg" />

      <div className="container hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="badge-dot" />
          Interactive Deep Learning Simulation
        </motion.div>

        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          How Does a Model{' '}
          <span className="gradient-text">Understand Context?</span>
        </motion.h1>

        {/* Animated sentence */}
        <motion.div 
          className="sentence-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="sentence-line">
            {SENTENCE_WORDS.map((word, i) => (
              <motion.span
                key={i}
                className={`sentence-word ${highlightIt && word === 'it' ? 'highlight-word' : ''} ${highlightIt && word === 'cat' ? 'highlight-ref' : ''}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ 
                  opacity: i < visibleWords ? 1 : 0, 
                  y: i < visibleWords ? 0 : 15 
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              className="cursor-blink"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >|</motion.span>
          </div>
        </motion.div>

        {/* Attention line connecting "it" to "cat" */}
        <AnimatePresence>
          {highlightIt && (
            <motion.div
              className="attention-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <svg className="attention-line-svg" viewBox="0 0 600 60" preserveAspectRatio="none">
                <motion.path
                  d="M 95 50 Q 300 -20 465 50"
                  fill="none"
                  stroke="url(#attention-gradient)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
                <defs>
                  <linearGradient id="attention-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <AnimatePresence>
          {showQuestion && (
            <motion.div
              className="hero-question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p>How does a model know <em>what <span className="gradient-text">"it"</span> refers to</em>?</p>
              <p className="hero-sub-q">Can it remember that <span className="highlight-ref-text">"cat"</span> appeared 6 words ago?</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          className="hero-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: showQuestion ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <a href="#lstm" className="btn btn-primary hero-btn">
            Explore Attention →
          </a>
          <a href="#walkthrough" className="btn btn-secondary hero-btn">
            Learn the Math
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, y: [0, 8, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
