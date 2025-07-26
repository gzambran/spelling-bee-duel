import { useState, useCallback } from 'react';

export const useWordInput = (gameState, timeRemaining, clearSubmissionDisplay) => {
  const [currentWord, setCurrentWord] = useState('');
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle letter selection
  const handleLetterPress = useCallback((letter) => {
    if (gameState?.roundStatus !== 'active' || isSubmitting || timeRemaining <= 0) return;
    
    // If there's a submission display showing, clear it when user starts typing
    if (clearSubmissionDisplay) {
      clearSubmissionDisplay();
    }
    
    const newWord = currentWord + letter.toLowerCase();
    const newSelected = [...selectedLetters, letter];
    
    setCurrentWord(newWord);
    setSelectedLetters(newSelected);
  }, [currentWord, selectedLetters, gameState?.roundStatus, isSubmitting, timeRemaining, clearSubmissionDisplay]);

  // Handle word deletion (backspace)
  const handleDeleteLetter = useCallback(() => {
    if (currentWord.length > 0 && !isSubmitting && timeRemaining > 0) {
      setCurrentWord(currentWord.slice(0, -1));
      setSelectedLetters(selectedLetters.slice(0, -1));
    }
  }, [currentWord, selectedLetters, isSubmitting, timeRemaining]);

  // Clear the current word and selection
  const clearCurrentWord = useCallback(() => {
    setCurrentWord('');
    setSelectedLetters([]);
  }, []);

  // Check if we can submit (basic validation)
  const canSubmit = useCallback(() => {
    return currentWord.length >= 4 && 
           gameState?.roundStatus === 'active' && 
           !isSubmitting && 
           timeRemaining > 0;
  }, [currentWord.length, gameState?.roundStatus, isSubmitting, timeRemaining]);

  // Check if we can delete
  const canDelete = useCallback(() => {
    return currentWord.length > 0 && !isSubmitting && timeRemaining > 0;
  }, [currentWord.length, isSubmitting, timeRemaining]);

  // Check if we can interact (press letters, etc.)
  const canInteract = useCallback(() => {
    return gameState?.roundStatus === 'active' && !isSubmitting && timeRemaining > 0;
  }, [gameState?.roundStatus, isSubmitting, timeRemaining]);

  return {
    // State
    currentWord,
    selectedLetters,
    isSubmitting,
    
    // Actions
    handleLetterPress,
    handleDeleteLetter,
    clearCurrentWord,
    setIsSubmitting,
    
    // Computed values
    canSubmit: canSubmit(),
    canDelete: canDelete(),
    canInteract: canInteract()
  };
};