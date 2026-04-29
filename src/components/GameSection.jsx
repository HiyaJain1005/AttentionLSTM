import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GameSection.css';

// Sentence token indices (0-indexed):
// "The dog chased the ball because it was playful" -> 0:The 1:dog 2:chased 3:the 4:ball 5:because 6:it 7:was 8:playful (9 tokens)
// "She put the book on the shelf after she read it" -> 0:She 1:put 2:the 3:book 4:on 5:the 6:shelf 7:after 8:she 9:read 10:it (11 tokens)
// "The teacher told the student that he needed to study more" -> 0:The 1:teacher 2:told 3:the 4:student 5:that 6:he 7:needed 8:to 9:study 10:more (11 tokens)
// "Birds fly south when winter approaches because they prefer warmth" -> 0:Birds 1:fly 2:south 3:when 4:winter 5:approaches 6:because 7:they 8:prefer 9:warmth (10 tokens)
// "The keys were on the counter but now they are missing" -> 0:The 1:keys 2:were 3:on 4:the 5:counter 6:but 7:now 8:they 9:are 10:missing (11 tokens)
const GAME_ROUNDS = [
  {
    sentence: "The dog chased the ball because it was playful",
    target: "it",
    targetIdx: 6,
    correctAttention: [0.03, 0.42, 0.08, 0.02, 0.06, 0.05, 0.04, 0.12, 0.18],
    topWords: [1, 8], // dog, playful
    explanation: '"it" refers to "dog" — the subject performing the action. Attention correctly focuses on "dog" and "playful" (the predicate).',
  },
  {
    sentence: "She put the book on the shelf after she read it",
    target: "it",
    targetIdx: 10,
    correctAttention: [0.04, 0.05, 0.03, 0.38, 0.03, 0.02, 0.04, 0.05, 0.06, 0.18, 0.12],
    topWords: [3, 9], // book, read
    explanation: '"it" refers to "book" — the object that was read. Attention heavily weights "book" and moderately weights "read".',
  },
  {
    sentence: "The teacher told the student that he needed to study more",
    target: "he",
    targetIdx: 6,
    correctAttention: [0.03, 0.10, 0.04, 0.02, 0.35, 0.03, 0.12, 0.05, 0.03, 0.08, 0.15],
    topWords: [4, 10], // student, more
    explanation: '"he" is ambiguous — it could refer to "teacher" or "student". Attention must use context clues. Here, "student" needs to study.',
  },
  {
    sentence: "Birds fly south when winter approaches because they prefer warmth",
    target: "they",
    targetIdx: 7,
    correctAttention: [0.40, 0.08, 0.03, 0.02, 0.04, 0.06, 0.04, 0.12, 0.05, 0.16],
    topWords: [0, 9], // Birds, warmth
    explanation: '"they" clearly refers to "Birds" — the subject of the sentence. Attention strongly connects to the subject.',
  },
  {
    sentence: "The keys were on the counter but now they are missing",
    target: "they",
    targetIdx: 8,
    correctAttention: [0.02, 0.42, 0.04, 0.03, 0.02, 0.06, 0.03, 0.04, 0.12, 0.05, 0.17],
    topWords: [1, 10], // keys, missing
    explanation: '"they" refers to "keys". Attention connects the pronoun back to the original subject despite distance.',
  },
];

export default function GameSection() {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const round = GAME_ROUNDS[currentRound];
  const tokens = round.sentence.split(' ');

  const toggleWord = useCallback((idx) => {
    if (revealed) return;
    if (idx === round.targetIdx) return; // Can't select target word
    
    setSelectedWords(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      if (prev.length >= 3) return prev; // Max 3 selections
      return [...prev, idx];
    });
  }, [revealed, round.targetIdx]);

  const checkAnswer = useCallback(() => {
    setRevealed(true);
    setTotalAttempts(prev => prev + 1);
    
    // Calculate overlap score
    const correctSet = new Set(round.topWords);
    const selectedSet = new Set(selectedWords);
    let overlap = 0;
    selectedSet.forEach(idx => {
      if (correctSet.has(idx)) overlap++;
    });
    
    const roundScore = Math.round((overlap / round.topWords.length) * 100);
    setScore(prev => prev + roundScore);
  }, [selectedWords, round.topWords]);

  const nextRound = useCallback(() => {
    if (currentRound >= GAME_ROUNDS.length - 1) {
      setGameComplete(true);
      return;
    }
    setCurrentRound(prev => prev + 1);
    setSelectedWords([]);
    setRevealed(false);
  }, [currentRound]);

  const resetGame = useCallback(() => {
    setCurrentRound(0);
    setSelectedWords([]);
    setRevealed(false);
    setScore(0);
    setTotalAttempts(0);
    setGameComplete(false);
  }, []);

  const avgScore = totalAttempts > 0 ? Math.round(score / totalAttempts) : 0;
  const feedback = avgScore >= 70 ? 'You think like Attention 🔥' : 
                   avgScore >= 40 ? 'Getting there! ⚙️' : 'Needs tuning 🔧';

  return (
    <section id="game" className="game-section">
      <div className="glow-orb purple" style={{ bottom: '10%', left: '5%' }} />
      
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Section 06</div>
          <h2 className="section-title">
            🎮 <span className="gradient-text">Guess the Focus</span>
          </h2>
          <p className="section-subtitle">
            Can you predict which words the attention mechanism will focus on?
            Select the top 2 words you think get the highest attention.
          </p>
        </motion.div>

        <div className="game-container">
          {!gameComplete ? (
            <>
              {/* Progress */}
              <div className="game-progress">
                <div className="progress-info">
                  <span>Round {currentRound + 1} / {GAME_ROUNDS.length}</span>
                  <span>Score: {score}</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    animate={{ width: `${((currentRound) / GAME_ROUNDS.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Round */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRound}
                  className="game-round"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="game-instruction">
                    The model is trying to understand{' '}
                    <span className="game-target">"{tokens[round.targetIdx]}"</span>.
                    Which words will it attend to most? (pick 2)
                  </div>

                  {/* Sentence tokens */}
                  <div className="game-tokens">
                    {tokens.map((token, i) => {
                      const isTarget = i === round.targetIdx;
                      const isSelected = selectedWords.includes(i);
                      const isCorrect = revealed && round.topWords.includes(i);
                      const isWrongSelection = revealed && isSelected && !round.topWords.includes(i);
                      
                      let tokenClass = 'game-token';
                      if (isTarget) tokenClass += ' target';
                      if (isSelected && !revealed) tokenClass += ' selected';
                      if (isCorrect && revealed) tokenClass += ' correct';
                      if (isWrongSelection) tokenClass += ' wrong';
                      
                      return (
                        <motion.button
                          key={i}
                          className={tokenClass}
                          onClick={() => toggleWord(i)}
                          disabled={isTarget || revealed}
                          whileHover={!isTarget && !revealed ? { scale: 1.05 } : {}}
                          whileTap={!isTarget && !revealed ? { scale: 0.95 } : {}}
                        >
                          {token}
                          {revealed && isCorrect && <span className="token-mark">✓</span>}
                          {isWrongSelection && <span className="token-mark">✗</span>}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Attention bars (revealed) */}
                  {revealed && (
                    <motion.div
                      className="game-reveal"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="reveal-title">Actual Attention Distribution</div>
                      <div className="reveal-bars">
                        {tokens.map((token, i) => {
                          const w = round.correctAttention[i] || 0;
                          const maxW = Math.max(...round.correctAttention);
                          return (
                            <div key={i} className="reveal-bar-row">
                              <span className="reveal-token">{token}</span>
                              <div className="reveal-track">
                                <motion.div
                                  className="reveal-fill"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(w / maxW) * 100}%` }}
                                  transition={{ duration: 0.4, delay: i * 0.04 }}
                                  style={{
                                    background: round.topWords.includes(i) ? 
                                      'var(--gradient-accent)' : 'var(--gradient-secondary)',
                                  }}
                                />
                              </div>
                              <span className="reveal-pct">{(w * 100).toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="reveal-explanation">
                        <strong>💡 Why?</strong> {round.explanation}
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="game-actions">
                    {!revealed ? (
                      <button
                        className="btn btn-primary"
                        onClick={checkAnswer}
                        disabled={selectedWords.length < 2}
                      >
                        Check Answer ({selectedWords.length}/2 selected)
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={nextRound}>
                        {currentRound >= GAME_ROUNDS.length - 1 ? 'See Results' : 'Next Round →'}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            /* Game complete */
            <motion.div
              className="game-complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="complete-icon">
                {avgScore >= 70 ? '🔥' : avgScore >= 40 ? '⚙️' : '🔧'}
              </div>
              <h3 className="complete-title">{feedback}</h3>
              <div className="complete-stats">
                <div className="stat">
                  <span className="stat-value">{score}</span>
                  <span className="stat-label">Total Score</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{totalAttempts}</span>
                  <span className="stat-label">Rounds</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{avgScore}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={resetGame}>
                Play Again 🔄
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
