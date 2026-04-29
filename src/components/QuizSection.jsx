import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuizSection.css';

const QUESTIONS = [
  {
    q: "What is the main limitation of a vanilla LSTM when processing long sequences?",
    options: [
      "It cannot process sequences at all",
      "Earlier information in the sequence tends to decay and weaken over time",
      "It only works with numerical data, not text",
      "It requires too much training data"
    ],
    correct: 1,
    explain: "LSTMs pass information through hidden states sequentially. While gates help, information from early tokens inevitably weakens as the sequence length grows — this is the vanishing context problem.",
    difficulty: 1,
  },
  {
    q: "In the Attention mechanism, what does the 'attention weight' represent?",
    options: [
      "The size of each word in bytes",
      "How much each input word should contribute to understanding the current output position",
      "The number of times each word appears in the training data",
      "The grammatical importance of each word"
    ],
    correct: 1,
    explain: "Attention weights are learned scores that determine how much each input position (encoder hidden state) should influence the current output. Higher weight = more influence on the context vector.",
    difficulty: 1,
  },
  {
    q: "What is the role of the Softmax function in the Attention mechanism?",
    options: [
      "It removes stop words from the sentence",
      "It trains the model faster",
      "It normalizes raw alignment scores into a probability distribution that sums to 1",
      "It encodes words into vectors"
    ],
    correct: 2,
    explain: "Softmax converts raw scores (which can be any value) into a valid probability distribution where all values are positive and sum to 1. This ensures attention weights are interpretable as 'how much to focus on each word'.",
    difficulty: 2,
  },
  {
    q: 'In the sentence "The cat sat on the mat because it was tired", what would attention likely highlight when processing "it"?',
    options: [
      '"the" and "on" — the most frequent words',
      '"cat" — the entity that "it" refers to',
      '"mat" — the closest noun',
      '"because" — the connecting word'
    ],
    correct: 1,
    explain: "Attention can learn to connect pronouns with their referents across the sentence. 'it' refers to 'cat', and a well-trained attention mechanism would assign highest weight to 'cat' for this position.",
    difficulty: 2,
  },
  {
    q: "What is the 'context vector' in Attention?",
    options: [
      "The first word of the sentence",
      "A random noise vector added for regularization",
      "A weighted sum of all encoder hidden states, emphasizing the most relevant information",
      "The final hidden state of the LSTM"
    ],
    correct: 2,
    explain: "The context vector c = Σ αᵢhᵢ is the core output of attention. It combines all encoded representations weighted by their attention scores, producing a rich, focused summary of the most relevant input information.",
    difficulty: 3,
  },
  {
    q: "Why does Attention improve the interpretability of models?",
    options: [
      "It makes the code shorter and easier to read",
      "It produces attention weight maps that show which input words influenced each output decision",
      "It removes the need for any training",
      "It translates the model's internal state into English"
    ],
    correct: 1,
    explain: "Attention weights can be visualized as heatmaps showing which input tokens the model 'focused on' for each decision. This provides transparency into the model's reasoning — a major advantage over black-box approaches.",
    difficulty: 3,
  },
  {
    q: "How does LSTM + Attention handle the 'long-range dependency' problem differently from vanilla LSTM?",
    options: [
      "It simply uses a larger hidden state to store more information",
      "It processes the sequence backwards instead of forwards",
      "It provides direct access to all encoder states via learned weights, bypassing sequential decay",
      "It splits long sentences into shorter ones before processing"
    ],
    correct: 2,
    explain: "Unlike vanilla LSTM which must pass information through each sequential step (causing decay), Attention creates direct connections from any output position to any input position. Distance doesn't matter — the model can 'attend' to word 1 from word 100 just as easily.",
    difficulty: 3,
  },
];

export default function QuizSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = QUESTIONS[currentQ];

  const selectAnswer = useCallback((idx) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    if (idx === question.correct) {
      setCorrectCount(prev => prev + 1);
    }
  }, [answered, question.correct]);

  const nextQuestion = useCallback(() => {
    if (currentQ >= QUESTIONS.length - 1) {
      setCompleted(true);
      return;
    }
    setCurrentQ(prev => prev + 1);
    setSelectedOption(null);
    setAnswered(false);
  }, [currentQ]);

  const resetQuiz = useCallback(() => {
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswered(false);
    setCorrectCount(0);
    setCompleted(false);
  }, []);

  const scorePercent = Math.round((correctCount / QUESTIONS.length) * 100);

  return (
    <section id="quiz" className="quiz-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Section 07</div>
          <h2 className="section-title">
            Test Your <span className="gradient-text">Understanding</span>
          </h2>
          <p className="section-subtitle">
            {QUESTIONS.length} questions from basic to advanced. Immediate feedback on each answer.
          </p>
        </motion.div>

        <div className="quiz-container">
          {!completed ? (
            <>
              {/* Progress */}
              <div className="quiz-progress">
                <div className="progress-info">
                  <span>Question {currentQ + 1} / {QUESTIONS.length}</span>
                  <span className="quiz-score">{correctCount} correct</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    animate={{ width: `${((currentQ) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="difficulty-indicator">
                  Difficulty: {['', '⭐', '⭐⭐', '⭐⭐⭐'][question.difficulty]}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  className="quiz-card"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="quiz-question">{question.q}</h3>

                  <div className="quiz-options">
                    {question.options.map((opt, i) => {
                      let optClass = 'quiz-option';
                      if (answered) {
                        if (i === question.correct) optClass += ' correct';
                        else if (i === selectedOption) optClass += ' wrong';
                      }

                      return (
                        <motion.button
                          key={i}
                          className={optClass}
                          onClick={() => selectAnswer(i)}
                          whileHover={!answered ? { scale: 1.01 } : {}}
                          whileTap={!answered ? { scale: 0.99 } : {}}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {answered && (
                      <motion.div
                        className={`quiz-explanation ${selectedOption === question.correct ? 'correct' : 'wrong'}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="explanation-header">
                          {selectedOption === question.correct ? '✅ Correct!' : '❌ Not quite.'}
                        </div>
                        <p>{question.explain}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {answered && (
                    <motion.div
                      className="quiz-nav"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <button className="btn btn-primary" onClick={nextQuestion}>
                        {currentQ >= QUESTIONS.length - 1 ? 'See Results' : 'Next Question →'}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              className="quiz-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="results-icon">
                {scorePercent >= 80 ? '🏆' : scorePercent >= 50 ? '📚' : '🔄'}
              </div>
              <h3 className="results-title">
                {scorePercent >= 80 ? 'Outstanding!' : 
                 scorePercent >= 50 ? 'Good effort!' : 'Keep learning!'}
              </h3>
              <div className="results-score">
                <span className="score-big">{correctCount}</span>
                <span className="score-divider">/</span>
                <span className="score-total">{QUESTIONS.length}</span>
              </div>
              <p className="results-percentage">{scorePercent}% accuracy</p>
              
              <div className="results-actions">
                <button className="btn btn-primary" onClick={resetQuiz}>
                  Retake Quiz 🔄
                </button>
                <a href="#takeaways" className="btn btn-secondary">
                  View Takeaways →
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
