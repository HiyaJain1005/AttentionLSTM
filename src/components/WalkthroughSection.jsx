import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WalkthroughSection.css';

const STEPS = [
  {
    id: 1,
    title: 'Encoding',
    subtitle: 'Convert words to vectors',
    icon: '📝',
    color: '#06B6D4',
    eli5: 'Imagine every word gets turned into a unique recipe card with specific ingredients (numbers). These numbers capture the meaning and relationships of each word.',
    technical: 'Each token in the input sequence is passed through the LSTM encoder, producing a sequence of hidden states h₁, h₂, ..., hₙ. Each hidden state captures contextual information up to that point.',
    formula: 'hₜ = LSTM(xₜ, hₜ₋₁)',
    formulaExplain: 'Each hidden state hₜ is computed using the current input xₜ and the previous hidden state hₜ₋₁.',
    diagram: [
      { label: 'x₁', sub: '"The"', type: 'input' },
      { label: 'x₂', sub: '"cat"', type: 'input' },
      { label: 'x₃', sub: '"sat"', type: 'input' },
      { label: '...', sub: '', type: 'dots' },
      { label: 'xₙ', sub: '"tired"', type: 'input' },
    ],
    diagramArrows: true,
    outputLabel: 'Hidden States: h₁, h₂, h₃, ..., hₙ',
  },
  {
    id: 2,
    title: 'Score Calculation',
    subtitle: 'How much should we "attend" to each word?',
    icon: '⚡',
    color: '#3B82F6',
    eli5: 'The model asks: "For the word I\'m currently looking at, how relevant is each other word?" It gives a relevance score to every word in the sentence.',
    technical: 'For each decoder state sₜ, we compute alignment scores eₜᵢ between sₜ and each encoder hidden state hᵢ. This measures compatibility between the current output position and each input position.',
    formula: 'eₜᵢ = score(sₜ, hᵢ) = sₜᵀ · W · hᵢ',
    formulaExplain: 'The score function computes how well the decoder state sₜ aligns with each encoder hidden state hᵢ. W is a learnable weight matrix.',
    diagram: [
      { label: 'e₁', sub: '3.2', type: 'score' },
      { label: 'e₂', sub: '8.7', type: 'score-high' },
      { label: 'e₃', sub: '2.1', type: 'score' },
      { label: 'e₄', sub: '1.5', type: 'score' },
      { label: 'e₅', sub: '4.8', type: 'score' },
    ],
    outputLabel: 'Raw alignment scores (unnormalized)',
  },
  {
    id: 3,
    title: 'Softmax Normalization',
    subtitle: 'Turn scores into probabilities',
    icon: '📊',
    color: '#8B5CF6',
    eli5: 'We take those relevance scores and squish them into percentages that add up to 100%. This way, we know exactly how much to focus on each word.',
    technical: 'The raw scores are normalized using the softmax function to produce attention weights αₜᵢ. This ensures all weights are positive and sum to 1, creating a valid probability distribution over the input sequence.',
    formula: 'αₜᵢ = exp(eₜᵢ) / Σⱼ exp(eₜⱼ)',
    formulaExplain: 'Softmax converts raw scores into a probability distribution. Higher scores get disproportionately more weight.',
    diagram: [
      { label: 'α₁', sub: '0.05', type: 'weight' },
      { label: 'α₂', sub: '0.52', type: 'weight-high' },
      { label: 'α₃', sub: '0.03', type: 'weight' },
      { label: 'α₄', sub: '0.02', type: 'weight' },
      { label: 'α₅', sub: '0.38', type: 'weight' },
    ],
    outputLabel: 'Attention weights (sum = 1.0)',
  },
  {
    id: 4,
    title: 'Context Vector',
    subtitle: 'The weighted summary',
    icon: '🎯',
    color: '#EC4899',
    eli5: 'Finally, we create a smart summary of the entire sentence, but we pay way more attention to the important words. It\'s like reading a paragraph but highlighting the key parts — those highlighted parts dominate your understanding.',
    technical: 'The context vector cₜ is computed as the weighted sum of all encoder hidden states, using the attention weights. This vector captures the most relevant information from the entire input for the current decoding step.',
    formula: 'cₜ = Σᵢ αₜᵢ · hᵢ',
    formulaExplain: 'The context vector is a weighted combination of all hidden states. Words with higher attention weights contribute more to the final representation.',
    diagram: [
      { label: 'c', sub: 'Context', type: 'context' },
    ],
    outputLabel: 'Rich context vector used for prediction',
  },
];

export default function WalkthroughSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [explainMode, setExplainMode] = useState('eli5'); // 'eli5' | 'technical'
  const [showFormula, setShowFormula] = useState(false);

  const step = STEPS[activeStep];

  return (
    <section id="walkthrough" className="walkthrough-section">
      <div className="glow-orb purple" style={{ top: '30%', left: '0%' }} />
      
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Section 04</div>
          <h2 className="section-title">
            How Attention Works: <span className="gradient-text">Step by Step</span>
          </h2>
          <p className="section-subtitle">
            Four stages transform a simple sequence into a context-aware representation.
          </p>
        </motion.div>

        {/* Step navigation */}
        <div className="step-nav">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`step-nav-item ${activeStep === i ? 'active' : ''} ${i < activeStep ? 'completed' : ''}`}
              onClick={() => setActiveStep(i)}
              style={{ '--step-color': s.color }}
            >
              <div className="step-nav-number">{s.id}</div>
              <div className="step-nav-label">{s.title}</div>
            </button>
          ))}
          <div className="step-nav-line">
            <motion.div
              className="step-nav-progress"
              animate={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            className="step-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="step-header-row">
              <div className="step-icon" style={{ background: `${step.color}20`, color: step.color }}>
                {step.icon}
              </div>
              <div>
                <h3 className="step-title">
                  Step {step.id}: {step.title}
                </h3>
                <p className="step-subtitle-text">{step.subtitle}</p>
              </div>
            </div>

            {/* Mode toggles */}
            <div className="step-toggles">
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${explainMode === 'eli5' ? 'active' : ''}`}
                  onClick={() => setExplainMode('eli5')}
                >
                  🧒 Explain Simply
                </button>
                <button
                  className={`toggle-btn ${explainMode === 'technical' ? 'active' : ''}`}
                  onClick={() => setExplainMode('technical')}
                >
                  🎓 Technical
                </button>
              </div>
              
              <button
                className={`btn btn-ghost ${showFormula ? 'active-ghost' : ''}`}
                onClick={() => setShowFormula(!showFormula)}
              >
                {showFormula ? '🔢 Hide Formula' : '🔢 Show Formula'}
              </button>
            </div>

            {/* Explanation */}
            <div className="step-explanation">
              <AnimatePresence mode="wait">
                <motion.p
                  key={explainMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {explainMode === 'eli5' ? step.eli5 : step.technical}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Formula */}
            <AnimatePresence>
              {showFormula && (
                <motion.div
                  className="formula-box"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="formula-display">
                    {step.formula}
                  </div>
                  <p className="formula-explain">{step.formulaExplain}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Diagram */}
            <div className="step-diagram">
              <div className="diagram-nodes">
                {step.diagram.map((node, i) => (
                  <motion.div
                    key={i}
                    className={`diagram-node ${node.type}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    style={{ '--node-color': step.color }}
                  >
                    <span className="node-label">{node.label}</span>
                    {node.sub && <span className="node-sub">{node.sub}</span>}
                  </motion.div>
                ))}
              </div>
              {step.diagramArrows && (
                <div className="diagram-arrow-row">
                  <svg width="100%" height="30" viewBox="0 0 500 30" preserveAspectRatio="xMidYMid meet">
                    <motion.path
                      d="M 50 5 L 50 25 M 140 5 L 140 25 M 230 5 L 230 25 M 370 5 L 370 25 M 450 5 L 450 25"
                      fill="none"
                      stroke={step.color}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay: 0.5 }}
                    />
                  </svg>
                </div>
              )}
              <div className="diagram-output">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {step.outputLabel}
                </motion.span>
              </div>
            </div>

            {/* Next/Prev */}
            <div className="step-nav-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
              >
                ← Previous
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
                disabled={activeStep === STEPS.length - 1}
              >
                Next Step →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
