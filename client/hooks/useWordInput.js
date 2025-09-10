import { useState, useCallback } from 'react';

export const useWordInput = (gameState, timeRemaining, clearSubmissionDisplay) => {
  const [currentWord, setCurrentWord] = useState('');

  // Handle letter selection - always works, no blocking
  const handleLetterPress = useCallback((letter) => {
    // Clear any existing submission display when user starts typing
    if (clearSubmissionDisplay) {
      clearSubmissionDisplay();
    }
    
    // Always allow letter selection - validation happens at submission
    setCurrentWord(prev => prev + letter.toLowerCase());
  }, []); // No dependencies on changing state = no unnecessary re-renders!

  // Handle word deletion - always works, no blocking  
  const handleDeleteLetter = useCallback(() => {
    setCurrentWord(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
  }, []); // No dependencies!

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