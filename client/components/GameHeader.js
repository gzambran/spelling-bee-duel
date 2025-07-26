import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GameHeader = ({ gameState, timeRemaining, currentScore }) => {
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

  return (
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
        <Text style={styles.scoreValue}>{currentScore}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default GameHeader;