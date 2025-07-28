import { useState, useEffect, useCallback } from 'react';
import { TRANSFORMED_PRACTICE_PUZZLES } from '../data/practiceData';

export const usePractice = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [gameState, setGameState] = useState('ready'); // ready, countdown, playing, finished
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [foundWords, setFoundWords] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [timer, setTimer] = useState(null);
  const [usedPuzzleIndices, setUsedPuzzleIndices] = useState(new Set());
  const [countdown, setCountdown] = useState(3);

  // Start countdown before practice round
  const startPractice = useCallback(() => {
    // Reset if all puzzles used
    let availableIndices = [];
    for (let i = 0; i < TRANSFORMED_PRACTICE_PUZZLES.length; i++) {
      if (!usedPuzzleIndices.has(i)) {
        availableIndices.push(i);
      }
    }

    if (availableIndices.length === 0) {
      // Reset and use all puzzles again
      setUsedPuzzleIndices(new Set());
      availableIndices = TRANSFORMED_PRACTICE_PUZZLES.map((_, i) => i);
    }

    // Pick random puzzle
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const puzzle = TRANSFORMED_PRACTICE_PUZZLES[randomIndex];
    
    setUsedPuzzleIndices(prev => new Set([...prev, randomIndex]));
    setCurrentPuzzle(puzzle);
    setFoundWords([]);
    setCurrentScore(0);
    setTimeRemaining(90);
    
    // Start countdown
    setCountdown(3);
    setGameState('countdown');
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Start the actual game after countdown
          setGameState('playing');
          
          // Start game timer
          const gameTimer = setInterval(() => {
            setTimeRemaining(time => {
              if (time <= 1) {
                clearInterval(gameTimer);
                setGameState('finished');
                return 0;
              }
              return time - 1;
            });
          }, 1000);
          
          setTimer(gameTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    console.log(`🎯 Practice countdown started for: ${puzzle.displayDate}`);
  }, [usedPuzzleIndices]);

  // Submit a word
  const submitWord = useCallback((word) => {
    if (!currentPuzzle || gameState !== 'playing') {
      return { success: false, error: 'Game not active' };
    }

    const lowercaseWord = word.toLowerCase();
    
    // Check if word already found
    if (foundWords.some(w => w.word === lowercaseWord)) {
      return { success: false, error: 'Already found' };
    }

    // Check if word is valid
    if (!currentPuzzle.validWords.includes(lowercaseWord)) {
      return { success: false, error: 'Not a valid word' };
    }

    // Check if word contains center letter
    if (!lowercaseWord.includes(currentPuzzle.centerLetter)) {
      return { success: false, error: 'Must contain center letter' };
    }

    // Add the word
    const points = currentPuzzle.wordPoints[lowercaseWord] || 0;
    const isPangram = currentPuzzle.pangrams.includes(lowercaseWord);
    
    const wordEntry = {
      word: lowercaseWord,
      points,
      isPangram,
      submittedAt: new Date().toISOString()
    };

    setFoundWords(prev => [...prev, wordEntry]);
    setCurrentScore(prev => prev + points);

    return { 
      success: true, 
      points,
      isPangram,
      totalScore: currentScore + points,
      wordCount: foundWords.length + 1
    };
  }, [currentPuzzle, gameState, foundWords, currentScore]);

  // End practice round early
  const endPractice = useCallback(() => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setGameState('finished');
  }, [timer]);

  // Reset practice state
  const resetPractice = useCallback(() => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setCurrentPuzzle(null);
    setGameState('ready');
    setFoundWords([]);
    setCurrentScore(0);
    setTimeRemaining(90);
  }, [timer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  return {
    // State
    currentPuzzle,
    gameState,
    timeRemaining,
    foundWords,
    currentScore,
    countdown,
    
    // Actions
    startPractice,
    submitWord,
    endPractice,
    resetPractice
  };
};