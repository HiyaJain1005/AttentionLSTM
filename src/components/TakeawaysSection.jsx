import { motion } from 'framer-motion';
import './TakeawaysSection.css';

const TAKEAWAYS = [
  {
    icon: '🧩',
    title: 'LSTM Struggles with Long Dependencies',
    description: 'As sequences grow longer, the hidden state loses information about earlier tokens. The model\'s memory of distant words fades exponentially, leading to poor understanding of long-range relationships.',
    color: '#EF4444',
  },
  {
    icon: '🎯',
    title: 'Attention Provides Direct Access',
    description: 'Instead of relying on a single bottleneck hidden state, Attention creates direct connections from each output position to every input position. Distance no longer determines how much information flows.',
    color: '#3B82F6',
  },
  {
    icon: '🔍',
    title: 'Improved Interpretability',
    description: 'Attention weights can be visualized as heatmaps, showing exactly which words influenced each decision. This transparency helps debug models and build trust in their outputs.',
    color: '#8B5CF6',
  },
  {
    icon: '📈',
    title: 'Better Performance on NLP Tasks',
    description: 'From machine translation to question answering, LSTM+Attention consistently outperforms vanilla LSTMs — achieving higher accuracy, better BLEU scores, and more coherent outputs.',
    color: '#10B981',
  },
  {
    icon: '🚀',
    title: 'Foundation for Transformers',
    description: 'The Attention mechanism in LSTM models paved the way for the Transformer architecture (2017), which uses self-attention exclusively and powers models like GPT, BERT, and beyond.',
    color: '#F59E0B',
  },
];

export default function TakeawaysSection() {
  return (
    <section id="takeaways" className="takeaways-section">
      <div className="glow-orb blue" style={{ top: '30%', right: '10%' }} />
      
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Key Insights</div>
          <h2 className="section-title">
            What You've <span className="gradient-text">Learned</span>
          </h2>
          <p className="section-subtitle">
            The essential takeaways from this simulation.
          </p>
        </motion.div>

        <div className="takeaways-grid">
          {TAKEAWAYS.map((item, i) => (
            <motion.div
              key={i}
              className="takeaway-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ '--card-color': item.color }}
            >
              <div className="takeaway-icon">{item.icon}</div>
              <h3 className="takeaway-title">{item.title}</h3>
              <p className="takeaway-desc">{item.description}</p>
              <div className="takeaway-accent" />
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          className="summary-box"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="summary-title">The Bottom Line</h3>
          <p className="summary-text">
            <strong>Attention doesn't replace LSTM</strong> — it supercharges it. By allowing the model to 
            dynamically focus on the most relevant parts of the input at each step, Attention solves the 
            fundamental memory bottleneck of sequential processing. This insight led to the 
            <strong> Transformer revolution</strong> that powers modern AI.
          </p>
        </motion.div>

        {/* Footer */}
        <div className="page-footer">
          <div className="footer-divider" />
          <p className="footer-text">
            Built as an interactive educational experience · Improvement of LSTM using Attention Mechanism in NLP
          </p>
          <p className="footer-credit">
            <span className="gradient-text">Attention × LSTM</span> · Interactive Deep Learning Simulation
          </p>
        </div>
      </div>
    </section>
  );
}
