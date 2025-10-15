import { useState, useCallback } from 'react';

export const useWordInput = (gameState, timeRemaining, clearSubmissionDisplay) => {
  const [currentWord, setCurrentWord] = useState('');

  // Handle letter selection
  const handleLetterPress = useCallback((letter) => {
    // Clear any existing submission display when user starts typing
    // This clears the old word/message when starting a new word
    if (clearSubmissionDisplay) {
      clearSubmissionDisplay();
    }
    
    // Update the current word
    setCurrentWord(prev => prev + letter.toLowerCase());
  }, [clearSubmissionDisplay]);

  // Handle word deletion
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