import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const GameScreen = ({ gameState, onSubmitWord, playerName }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [wordFeedback, setWordFeedback] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local state for shuffled letters (client-side only)
  const [shuffledOuterLetters, setShuffledOuterLetters] = useState([]);
  
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const feedbackHeightAnim = useRef(new Animated.Value(0)).current;
  const roundStartTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Get current player data
  const currentPlayer = gameState?.players.find(p => p.name === playerName);

  // Initialize shuffled letters when puzzle changes
  useEffect(() => {
    if (gameState?.puzzle?.outerLetters) {
      setShuffledOuterLetters([...gameState.puzzle.outerLetters]);
    }
  }, [gameState?.puzzle?.outerLetters]);

  // Timer with useCallback to prevent unnecessary re-renders
  const updateTimer = useCallback(() => {
    if (!roundStartTimeRef.current) return;
    
    const now = Date.now();
    const elapsed = Math.floor((now - roundStartTimeRef.current) / 1000);
    const remaining = Math.max(0, 90 - elapsed);
    
    setTimeRemaining(remaining);
    
    if (remaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameState || gameState.roundStatus !== 'active' || !gameState.roundStartTime) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Store round start time
    roundStartTimeRef.current = new Date(gameState.roundStartTime).getTime();
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set initial time immediately
    updateTimer();
    
    // Update every second
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState?.roundStartTime, gameState?.roundStatus, updateTimer]);

  // Handle letter selection
  const handleLetterPress = useCallback((letter) => {
    if (gameState?.roundStatus !== 'active' || isSubmitting) return;
    
    const newWord = currentWord + letter.toLowerCase();
    const newSelected = [...selectedLetters, letter];
    
    setCurrentWord(newWord);
    setSelectedLetters(newSelected);
  }, [currentWord, selectedLetters, gameState?.roundStatus, isSubmitting]);

  // Handle word deletion (backspace)
  const handleDeleteLetter = useCallback(() => {
    if (currentWord.length > 0 && !isSubmitting) {
      setCurrentWord(currentWord.slice(0, -1));
      setSelectedLetters(selectedLetters.slice(0, -1));
    }
  }, [currentWord, selectedLetters, isSubmitting]);

  // Shuffle function that keeps center letter in place (client-side only)
  const handleShuffleLetters = useCallback(() => {
    if (!shuffledOuterLetters.length || isSubmitting) return;
    
    // Create a shuffled copy of outer letters
    const shuffled = [...shuffledOuterLetters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Update local state only
    setShuffledOuterLetters(shuffled);
  }, [shuffledOuterLetters, isSubmitting]);

  // Word submission handler
  const handleSubmitWord = async () => {
    if (!currentWord || currentWord.length < 4) {
      showFeedback('Word must be at least 4 letters', 'error');
      return;
    }

    if (gameState?.roundStatus !== 'active') {
      showFeedback('Round is not active', 'error');
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    const wordToSubmit = currentWord;
    setIsSubmitting(true);

    try {
      const result = await onSubmitWord(wordToSubmit);
      
      // Always clear word on submit (success case)
      setCurrentWord('');
      setSelectedLetters([]);
      
      // Show success feedback
      const message = result.isPangram 
        ? `PANGRAM! ${result.word.toUpperCase()} - ${result.points} pts!`
        : `${result.word.toUpperCase()} - ${result.points} pts`;
      
      showFeedback(message, result.isPangram ? 'pangram' : 'success');
      
    } catch (error) {
      // Always clear word on error too
      setCurrentWord('');
      setSelectedLetters([]);
      
      // Show user-friendly error messages
      let errorMessage = 'Not in word list';
      if (error.message.includes('already submitted')) {
        errorMessage = 'Already found!';
      } else if (error.message.includes('center letter')) {
        errorMessage = 'Must use center letter';
      } else if (error.message.includes('Invalid word')) {
        errorMessage = 'Not in word list';
      } else if (error.message.includes('time expired')) {
        errorMessage = 'Time\'s up!';
      }
      
      showFeedback(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic feedback with height animation
  const showFeedback = useCallback((message, type) => {
    setWordFeedback({ message, type });
    
    // Animate container height and opacity together
    Animated.parallel([
      Animated.timing(feedbackHeightAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false, // Height animations require native driver false
      }),
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide after delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(feedbackHeightAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setWordFeedback(null);
      });
    }, 2000);
  }, [feedbackAnim, feedbackHeightAnim]);

  // Format time display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get timer color based on remaining time
  const getTimerColor = useCallback(() => {
    if (timeRemaining > 30) return '#4CAF50';
    if (timeRemaining > 10) return '#FF9800';
    return '#F44336';
  }, [timeRemaining]);

  if (!gameState || !gameState.puzzle) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const { centerLetter } = gameState.puzzle;
  // Use shuffled letters for display
  const outerLetters = shuffledOuterLetters.length > 0 ? shuffledOuterLetters : gameState.puzzle.outerLetters;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundText}>
            Round {gameState.currentRound}/{gameState.totalRounds}
          </Text>
        </View>
        
        <View style={[styles.timer, { borderColor: getTimerColor() }]}>
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
        
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{currentPlayer?.roundScore || 0}</Text>
        </View>
      </View>

      {/* Current Word Display */}
      <View style={styles.wordContainer}>
        <Text style={styles.currentWord}>
          {currentWord.toUpperCase()}
        </Text>
      </View>

      {/* Dynamic Message Container */}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            height: feedbackHeightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 50],
            }),
            opacity: feedbackAnim,
          },
        ]}
      >
        {wordFeedback && (
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: 
                  wordFeedback.type === 'pangram' ? '#FF9800' :
                  wordFeedback.type === 'success' ? '#4CAF50' : '#F44336',
              },
            ]}
          >
            <Text style={styles.messageText}>{wordFeedback.message}</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.hexagonContainer}>
        <TouchableOpacity
          style={[styles.hexagon, styles.centerHexagon]}
          onPress={() => handleLetterPress(centerLetter)}
          disabled={gameState.roundStatus !== 'active' || isSubmitting}
        >
          <Text style={styles.centerLetterText}>{centerLetter.toUpperCase()}</Text>
        </TouchableOpacity>

        {/* Outer Letters - Now 70x70 */}
        {outerLetters.map((letter, index) => {
          const angle = (index * 60) * (Math.PI / 180);
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.hexagon,
                styles.outerHexagon,
                {
                  transform: [
                    { translateX: x },
                    { translateY: y },
                  ],
                },
              ]}
              onPress={() => handleLetterPress(letter)}
              disabled={gameState.roundStatus !== 'active' || isSubmitting}
            >
              <Text style={styles.outerLetterText}>{letter.toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Buttons - NOW WITH SHUFFLE */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, isSubmitting && styles.disabledButton]}
          onPress={handleDeleteLetter}
          disabled={!currentWord || isSubmitting}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>

        {/* Shuffle Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.shuffleButton, isSubmitting && styles.disabledButton]}
          onPress={handleShuffleLetters}
          disabled={isSubmitting}
        >
          <Text style={styles.shuffleButtonText}>🔀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.submitButton,
            ((!currentWord || currentWord.length < 4) || isSubmitting) && styles.disabledButton
          ]}
          onPress={handleSubmitWord}
          disabled={!currentWord || currentWord.length < 4 || gameState.roundStatus !== 'active' || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  roundInfo: {
    flex: 1,
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  timer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666666',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  wordContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 60,
  },
  currentWord: {
    fontSize: 28, // Increased from 24
    fontWeight: 'bold',
    color: '#2E2E2E',
    letterSpacing: 2,
    minHeight: 35, // Ensure consistent height even when empty
  },
  // Dynamic message container styles
  messageContainer: {
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  messageBox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 10,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hexagonContainer: {
    height: 280, // Increased from 240 for larger letters
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  hexagon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centerHexagon: {
    backgroundColor: '#E6C200',
    width: 80, // Increased from 70
    height: 80, // Increased from 70
    borderRadius: 40, // Increased from 35
  },
  outerHexagon: {
    backgroundColor: '#F7DA21',
    width: 70, // Increased from 60
    height: 70, // Increased from 60
    borderRadius: 35, // Increased from 30
  },
  centerLetterText: {
    fontSize: 32, // Increased from 28
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  outerLetterText: {
    fontSize: 28, // Increased from 24
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15, // Reduced gap to fit 3 buttons
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 20, // Reduced from 24
    paddingVertical: 12,
    minWidth: 90, // Ensure consistent button sizes
  },
  deleteButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  // Shuffle button styles
  shuffleButton: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#B0D4F1',
  },
  shuffleButtonText: {
    fontSize: 20,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#326891',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default GameScreen;