import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Navigation.css';

const NAV_ITEMS = [
  { id: 'hook', label: 'Intro' },
  { id: 'lstm', label: 'LSTM' },
  { id: 'attention', label: 'Attention' },
  { id: 'comparison', label: 'Compare' },
  { id: 'walkthrough', label: 'Steps' },
  { id: 'playground', label: 'Playground' },
  { id: 'game', label: 'Game' },
  { id: 'quiz', label: 'Quiz' },
];

export default function Navigation() {
  return (
    <motion.nav 
      className="nav"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nav-inner">
        <div className="nav-logo">⚡ Attention × LSTM</div>
        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}
