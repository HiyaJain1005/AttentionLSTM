# Attention Over Memory — How Attention Improves LSTM in NLP

> An interactive, scroll-driven educational experience that makes anyone feel *why* Attention outperforms vanilla LSTM in Natural Language Processing — no prior ML knowledge required.

---

## 📌 Live Demo

Open `attention.html` directly in any modern browser — no build step, no server, no dependencies.

---

## 🧠 What This Project Teaches

This project walks through one of the most important ideas in modern AI — the **Attention Mechanism** — by contrasting it with the older **LSTM (Long Short-Term Memory)** approach, using interactive visualizations, a game, a quiz, and a final report card.

By the end, a complete beginner understands:
- Why LSTMs struggle with long sentences (vanishing gradient / memory decay)
- How Attention lets every word directly "look at" every other word
- The four mathematical steps behind Attention (Encoding → Scores → Softmax → Context Vector)
- Why Attention is the foundation of BERT, GPT, and all modern Transformers

---

## 📂 Project Structure

```
├── attention.html          # Standalone single-file version (self-contained)
├── index.html              # Vite entry point for React app
├── src/
│   ├── main.jsx            # React app entry
│   ├── App.jsx             # Root component, assembles all sections
│   ├── App.css             # Global styles
│   ├── index.css           # Base CSS / resets
│   └── components/
│       ├── Navigation.jsx
│       ├── HeroSection.jsx
│       ├── LSTMSection.jsx
│       ├── AttentionSection.jsx
│       ├── ComparisonSection.jsx
│       ├── WalkthroughSection.jsx
│       ├── PlaygroundSection.jsx
│       ├── GameSection.jsx
│       ├── QuizSection.jsx
│       └── TakeawaysSection.jsx
│   └── context/
│       └── AppContext.jsx   # Global state provider
```

> **Note:** `attention.html` is the fully self-contained version with all CSS, HTML, and JavaScript in one file. The React app (`src/`) is the component-based version using Vite.

---

## 🚀 Getting Started

### Option A — Standalone (Recommended for demo)

Just open `attention.html` in your browser. No installation needed.

```bash
# macOS
open attention.html

# Windows
start attention.html

# Or drag and drop into Chrome / Firefox / Edge
```

### Option B — React App (Vite)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Requires Node.js 18+.

---

## 📖 Chapter Guide

The experience is split into **11 chapters**, each building on the last:

| # | Chapter | What It Shows |
|---|---------|---------------|
| 01 | **The Hook** | Pronoun resolution problem — what does "it" refer to? |
| 02 | **Word Relationship Web** | Physics-based word connection graph — every word linked to every other |
| 03 | **Meet LSTM** | Token chain with memory decay slider — watch early tokens fade |
| 04 | **LSTM Fails** | Sentiment prediction failure — "not good at all" → 73% Positive |
| 05 | **Enter Attention** | Click any word to see its attention arcs across the sentence |
| 06 | **How Attention Works** | 4-step animated walkthrough with ELI5 and formula toggle |
| 07 | **Build Your Own Attention** | Drag sliders to assign attention weights, compare with the model |
| 08 | **Guess the Focus** | 3-round game — pick which words the model attends to |
| 09 | **Heatmap Playground** | Type any sentence, get a full attention weight matrix |
| 10 | **Quiz** | 5 questions testing core concepts |
| 11 | **Key Takeaways + Report Card** | Summary cards + combined score from game and quiz |

---

## ✨ Features

- **Zero dependencies** in the standalone version — pure HTML, CSS, and vanilla JS
- **Physics-based word web** with drag, hover, and edge filtering (Chapter 2)
- **Interactive attention arc visualization** with temperature/focus slider (Chapter 5)
- **ELI5 ↔ Formula toggle** for every step in the walkthrough (Chapter 6)
- **Attention heatmap** that recomputes from any word's perspective (Chapter 9)
- **Neural Report Card** combining game + quiz scores (Chapter 11)
- Fully **responsive** — works on mobile and desktop
- Chapter navigation dots with hover labels (fixed right side)
- Smooth scroll + intersection observer animations throughout

---

## 🎯 Key Concepts Covered

### LSTM Limitations
- Sequential left-to-right processing
- Hidden state degrades over distance (exponential decay)
- Long-range dependencies are hard to capture
- Negation words like "not" can be forgotten before reaching the relevant verb

### Attention Mechanism
- Every word attends to every other word simultaneously
- Scores computed via **dot product** between Query and Key vectors
- Scores normalized via **Softmax** into a probability distribution
- Final output is a **weighted sum** of Value vectors (context vector)

### The Four Steps
```
1. Encoding    →  x_i = Embedding(token_i)  →  x_i ∈ ℝ^d
2. Scores      →  score(i,j) = q_i · k_j
3. Softmax     →  α_j = exp(score_j) / Σ_k exp(score_k)
4. Context     →  context = Σ_j α_j × v_j
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Standalone version | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| React version | React 18, Vite, JSX |
| Fonts | Inter (UI), JetBrains Mono (code/tokens) |
| Visualizations | Canvas API (word web, attention arcs, heatmap) |
| Animations | CSS keyframes + Intersection Observer API |
| State management | React Context API (React version) |

---

## 🎨 Design System

The UI uses a dark neon theme with CSS custom properties:

```css
--neon-blue:    #00d4ff   /* primary accent, attention arcs */
--neon-purple:  #a855f7   /* secondary accent, model weights */
--neon-pink:    #f472b6   /* tertiary accent */
--neon-green:   #34d399   /* correct answers, positive sentiment */
--neon-red:     #ef4444   /* errors, negative sentiment */
--bg:           #0B0F19   /* base background */
--font-sans:    Inter
--font-mono:    JetBrains Mono
```

---

## 📊 Simulated Data Note

The attention weights shown in Chapters 5 and 9 are **simulated for illustration purposes** — they are not produced by a real trained model. The patterns are designed to accurately reflect how real transformer attention behaves (e.g., strong cross-attention between "not" and "good", pronoun-to-noun links, disambiguation via context). The prediction percentages (73%, 89%) are also illustrative simulations.

---

## 🧩 Extending the Project

To add more sentences to the heatmap playground, edit the `presets` array in the script:

```js
const presets = [
  'The cat sat on the mat because it was tired',
  'She did not enjoy the movie at all',
  // Add your sentence here
];
```

To add quiz questions, add objects to the `quizQuestions` array:

```js
{
  q: 'Your question here?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0,  // index of correct option
  explanation: 'Explanation shown after answering.'
}
```

To add game rounds, add objects to the `gameRounds` array:

```js
{
  sentence: 'Your sentence here',
  target: 'word',         // highlighted word (purple)
  answers: ['w1', 'w2'],  // words the model attends to
  explanation: 'Why the model attends to these words.'
}
```

---

## 📚 Further Reading

- [Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762) — the original Transformer paper
- [The Illustrated Transformer — Jay Alammar](https://jalammar.github.io/illustrated-transformer/) — best visual explainer
- [Understanding LSTMs — Christopher Olah](https://colah.github.io/posts/2015-08-Understanding-LSTMs/) — deep dive into LSTM internals
- [BERT: Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805)

---

## 👩‍💻 Author

Built as an interactive educational experience for explaining the Attention mechanism in NLP.

---

## 📄 License

MIT License — free to use, modify, and share.
