import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

// Pre-computed attention weights for common sentences
const ATTENTION_DATA = {
  "The cat sat on the mat because it was tired": {
    tokens: ["The", "cat", "sat", "on", "the", "mat", "because", "it", "was", "tired"],
    weights: {
      "The": [0.15, 0.08, 0.05, 0.03, 0.12, 0.04, 0.02, 0.35, 0.06, 0.10],
      "cat": [0.05, 0.20, 0.12, 0.03, 0.04, 0.08, 0.05, 0.25, 0.08, 0.10],
      "sat": [0.03, 0.15, 0.18, 0.08, 0.03, 0.10, 0.05, 0.20, 0.08, 0.10],
      "on": [0.02, 0.05, 0.12, 0.20, 0.03, 0.35, 0.05, 0.08, 0.05, 0.05],
      "the": [0.10, 0.05, 0.03, 0.08, 0.15, 0.30, 0.05, 0.10, 0.07, 0.07],
      "mat": [0.03, 0.05, 0.08, 0.15, 0.10, 0.22, 0.05, 0.12, 0.10, 0.10],
      "because": [0.03, 0.08, 0.10, 0.03, 0.03, 0.05, 0.20, 0.18, 0.15, 0.15],
      "it": [0.05, 0.38, 0.08, 0.02, 0.04, 0.06, 0.05, 0.12, 0.08, 0.12],
      "was": [0.03, 0.12, 0.05, 0.02, 0.03, 0.05, 0.08, 0.22, 0.20, 0.20],
      "tired": [0.03, 0.25, 0.05, 0.02, 0.03, 0.05, 0.08, 0.18, 0.12, 0.19],
    },
    lstmDecay: [1.0, 0.85, 0.68, 0.52, 0.38, 0.28, 0.20, 0.14, 0.10, 0.07],
  }
};

// Simulated attention for user sentences
function computeSimulatedAttention(tokens, targetIdx, sharpness = 1.0) {
  const n = tokens.length;
  const weights = [];
  
  for (let i = 0; i < n; i++) {
    // Distance-based base score
    const distance = Math.abs(i - targetIdx);
    let score = Math.exp(-distance * 0.3 * sharpness);
    
    // Boost for syntactically related positions
    if (i === targetIdx) score *= 1.5;
    if (i === 0) score *= 1.2; // Subject typically important
    if (i === n - 1) score *= 1.1; // Last word often relevant
    
    // Add some randomness for realism
    score *= (0.8 + Math.random() * 0.4);
    weights.push(score);
  }
  
  // Softmax normalization with temperature
  const temperature = 1.0 / Math.max(sharpness, 0.1);
  const maxW = Math.max(...weights);
  const expWeights = weights.map(w => Math.exp((w - maxW) / temperature));
  const sum = expWeights.reduce((a, b) => a + b, 0);
  return expWeights.map(w => w / sum);
}

function computeLSTMDecay(length) {
  const decay = [];
  for (let i = 0; i < length; i++) {
    decay.push(Math.pow(0.78, length - 1 - i));
  }
  return decay;
}

export function AppProvider({ children }) {
  const [activeSentence] = useState("The cat sat on the mat because it was tired");
  const [focusWord, setFocusWord] = useState("it");
  const [sharpness, setSharpness] = useState(1.0);
  const [showReasoning, setShowReasoning] = useState(false);

  const tokens = activeSentence.split(' ');
  
  const getAttentionWeights = (target, customTokens = null) => {
    const t = customTokens || tokens;
    const data = ATTENTION_DATA[activeSentence];
    if (data && data.weights[target] && !customTokens) {
      const raw = data.weights[target];
      // Apply sharpness
      const maxW = Math.max(...raw);
      const adjusted = raw.map(w => Math.pow(w / maxW, sharpness) * maxW);
      const sum = adjusted.reduce((a, b) => a + b, 0);
      return adjusted.map(w => w / sum);
    }
    const targetIdx = t.indexOf(target);
    if (targetIdx === -1) return t.map(() => 1 / t.length);
    return computeSimulatedAttention(t, targetIdx, sharpness);
  };

  const getLSTMDecay = (customTokens = null) => {
    const t = customTokens || tokens;
    const data = ATTENTION_DATA[activeSentence];
    if (data && !customTokens) return data.lstmDecay;
    return computeLSTMDecay(t.length);
  };

  return (
    <AppContext.Provider value={{
      activeSentence,
      tokens,
      focusWord,
      setFocusWord,
      sharpness,
      setSharpness,
      showReasoning,
      setShowReasoning,
      getAttentionWeights,
      getLSTMDecay,
      computeSimulatedAttention,
      computeLSTMDecay,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
