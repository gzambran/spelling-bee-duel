import { useState, useCallback } from 'react';

export const useWordInput = (gameState, timeRemaining, clearSubmissionDisplay) => {
  const [currentWord, setCurrentWord] = useState('');

  const handleLetterPress = useCallback((letter) => {
    setCurrentWord(prev => prev + letter.toLowerCase());
  }, []);

  const handleDeleteLetter = useCallback(() => {
    setCurrentWord(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
  }, []);

  // Clear the current word
  const clearCurrentWord = useCallback(() => {
    setCurrentWord('');
  }, []);

  return {
    // State
    currentWord,
    
    // Actions
    handleLetterPress,
    handleDeleteLetter,
    clearCurrentWord,
  };
};