import { useState, useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';

export const useSubmissionDisplay = () => {
  // Unified state for both word and notification
  const [submissionDisplay, setSubmissionDisplay] = useState(null);
  
  // Animation states
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const displayTimeoutRef = useRef(null);

  // NYT-style feedback messages based on word length/points
  const getSuccessMessage = (points, isPangram) => {
    if (isPangram) {
      return 'PANGRAM!';
    }
    
    // Different encouragement based on points
    if (points >= 25) return 'Awesome!';
    if (points >= 16) return 'Great!';
    if (points >= 9) return 'Nice!';
    return 'Good!';
  };

  // Show a word submission (both word and notification together)
  const showSubmission = useCallback((word, isValid, points = 0, isPangram = false, errorMessage = '') => {
    // Clear any existing timeout
    if (displayTimeoutRef.current) {
      clearTimeout(displayTimeoutRef.current);
      displayTimeoutRef.current = null;
    }

    // Create the unified display object
    const message = isValid 
      ? `${getSuccessMessage(points, isPangram)} ${points} points`
      : errorMessage;
    
    const messageType = isPangram ? 'pangram' : (isValid ? 'success' : 'error');

    const display = {
      word: word ? word.toUpperCase() : '', // Handle empty word for status messages
      message,
      messageType,
      isValid
    };

    // Set the display immediately (animations handled in component)
    setSubmissionDisplay(display);

    // Set timeout to clear both word and notification together
    displayTimeoutRef.current = setTimeout(() => {
      clearSubmissionDisplay();
    }, 2000);
  }, []);

  // Clear the entire submission display (word + notification)
  const clearSubmissionDisplay = useCallback(() => {
    // Use functional update to check current state without depending on it
    setSubmissionDisplay(current => {
      // Early exit if nothing to clear - prevents wasteful operations!
      if (current === null) {
        return current; // Return same state = no re-render
      }
      
      // Clear timeout
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
        displayTimeoutRef.current = null;
      }
      
      // Reset animation values for next use
      fadeAnim.setValue(0);
      scaleAnim.setValue(1);
      
      return null; // Clear the display
    });
  }, [fadeAnim, scaleAnim]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
      }
    };
  }, []);

  return {
    submissionDisplay, // { word, message, messageType, isValid } or null
    fadeAnim,
    scaleAnim,
    showSubmission,
    clearSubmissionDisplay
  };
};