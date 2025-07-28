import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSubmissionDisplay } from '../hooks/useSubmissionDisplay';
import { useWordInput } from '../hooks/useWordInput';
import GameHeader from './GameHeader';
import LetterHexagon from './LetterHexagon';
import SubmissionDisplay from './SubmissionDisplay';
import GameActions from './GameActions';

const PracticeGame = ({ practiceState, onBackToLobby }) => {
  const { currentPuzzle, timeRemaining, currentScore, submitWord, endPractice } = practiceState;
  
  const {
    submissionDisplay,
    fadeAnim,
    scaleAnim,
    showSubmission,
    clearSubmissionDisplay
  } = useSubmissionDisplay();
  
  const {
    currentWord,
    selectedLetters,
    isSubmitting,
    handleLetterPress,
    handleDeleteLetter,
    clearCurrentWord,
    setIsSubmitting,
    canSubmit,
    canDelete,
    canInteract
  } = useWordInput({ roundStatus: 'active' }, timeRemaining, clearSubmissionDisplay);

  const [shuffledOuterLetters, setShuffledOuterLetters] = useState([]);

  // Initialize shuffled letters when puzzle loads
  useEffect(() => {
    if (currentPuzzle?.outerLetters) {
      setShuffledOuterLetters([...currentPuzzle.outerLetters]);
    }
  }, [currentPuzzle]);

  // Handle shuffle letters
  const handleShuffleLetters = () => {
    if (currentPuzzle?.outerLetters) {
      const shuffled = [...currentPuzzle.outerLetters].sort(() => Math.random() - 0.5);
      setShuffledOuterLetters(shuffled);
    }
  };

  // Handle word submission
  const handleSubmitWord = () => {
    if (!canSubmit || currentWord.length < 4) {
      showSubmission(currentWord, false, 0, false, 'Word must be at least 4 letters');
      clearCurrentWord();
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const result = submitWord(currentWord);
    const wordToShow = currentWord;
    clearCurrentWord();
    
    if (result.success) {
      showSubmission(wordToShow, true, result.points, result.isPangram, `+${result.points} points${result.isPangram ? ' 🌟 PANGRAM!' : ''}`);
    } else {
      showSubmission(wordToShow, false, 0, false, result.error);
    }
    
    setIsSubmitting(false);
  };

  // Handle ending practice early
  const handleEndPractice = () => {
    Alert.alert(
      'End Practice?',
      'Are you sure you want to end this practice round?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End', style: 'destructive', onPress: endPractice }
      ]
    );
  };

  if (!currentPuzzle) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading puzzle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <GameHeader
        gameState={{ currentRound: 1, totalRounds: 1 }}
        timeRemaining={timeRemaining}
        currentScore={currentScore}
      />

      {/* Current Word Display */}
      <View style={styles.wordContainer}>
        <Text style={styles.currentWord}>
          {submissionDisplay ? submissionDisplay.word : currentWord.toUpperCase()}
        </Text>
      </View>

      {/* Submission Display */}
      <SubmissionDisplay 
        submissionDisplay={submissionDisplay}
        fadeAnim={fadeAnim}
        scaleAnim={scaleAnim}
      />

      {/* Letter Hexagon and Action Buttons */}
      <View style={styles.gameArea}>
        <LetterHexagon
          centerLetter={currentPuzzle.centerLetter}
          outerLetters={shuffledOuterLetters.length > 0 ? shuffledOuterLetters : currentPuzzle.outerLetters}
          onLetterPress={handleLetterPress}
          canInteract={canInteract}
        />
        
        {/* Action Buttons - moved closer to letters */}
        <View style={styles.actionButtonsContainer}>
          <GameActions
            onDeleteLetter={handleDeleteLetter}
            onShuffleLetter={handleShuffleLetters}
            onSubmitWord={handleSubmitWord}
            canDelete={canDelete}
            canInteract={canInteract}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
          />
        </View>
      </View>

      {/* End Practice Button - Narrower */}
      <View style={styles.endButtonContainer}>
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndPractice}
          activeOpacity={0.8}
        >
          <Text style={styles.endButtonText}>End Practice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#2E2E2E',
    textAlign: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 60,
  },
  currentWord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E2E2E',
    letterSpacing: 2,
    minHeight: 35,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionButtonsContainer: {
    marginTop: 20,
  },
  endButtonContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  endButton: {
    backgroundColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PracticeGame;