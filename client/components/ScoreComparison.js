import { View, Text, StyleSheet, Animated } from 'react-native';

const ScoreComparison = ({ 
  currentPlayerData, 
  opponentData, 
  isCurrentRoundWinner, 
  isRoundTie, 
  slideAnim 
}) => {
  return (
    <Animated.View 
      style={[
        styles.scoreCard,
        {
          opacity: slideAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <View style={styles.scoreRow}>
        <View style={[
          styles.playerScore,
          isCurrentRoundWinner && !isRoundTie && styles.winnerScore
        ]}>
          <Text style={styles.playerNameText}>{currentPlayerData.name}</Text>
          <Text style={styles.roundScoreText}>{currentPlayerData.roundScore}</Text>
          <Text style={styles.totalScoreText}>Total: {currentPlayerData.totalScore}</Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={[
          styles.playerScore,
          !isCurrentRoundWinner && !isRoundTie && styles.winnerScore
        ]}>
          <Text style={styles.playerNameText}>{opponentData.name}</Text>
          <Text style={styles.roundScoreText}>{opponentData.roundScore}</Text>
          <Text style={styles.totalScoreText}>Total: {opponentData.totalScore}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scoreCard: {
    backgroundColor: '#FFFBF2',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8B94E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerScore: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFBF2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D9A93D',
  },
  winnerScore: {
    borderColor: '#8B4513',
    backgroundColor: '#FFFBF2',
  },
  playerNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  roundScoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 4,
  },
  totalScoreText: {
    fontSize: 12,
    color: '#666666',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
});

export default ScoreComparison;