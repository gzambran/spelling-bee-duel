import { View, Text, StyleSheet } from 'react-native';

const FinalScoreComparison = ({ gameState, finalResults, playerName }) => {
  if (!gameState || !finalResults) {
    return null;
  }

  const currentPlayer = gameState.players.find(p => p.name === playerName);
  const opponent = gameState.players.find(p => p.name !== playerName);

  if (!currentPlayer || !opponent) {
    return null;
  }

  const isWinner = finalResults.winner?.name === playerName;
  const isTie = finalResults.isTie;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Final Scores</Text>
      
      <View style={styles.scoreRow}>
        {/* Current Player Score */}
        <View style={[
          styles.playerScore,
          isWinner && !isTie && styles.winnerScore
        ]}>
          <Text style={styles.playerName}>{currentPlayer.name}</Text>
          <Text style={styles.scoreValue}>{currentPlayer.totalScore}</Text>
          <Text style={styles.wordsCount}>
            {finalResults.finalScores?.find(p => p.name === playerName)?.totalWords || 0} words
          </Text>
        </View>

        {/* VS Separator */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Opponent Score */}
        <View style={[
          styles.playerScore,
          !isWinner && !isTie && styles.winnerScore
        ]}>
          <Text style={styles.playerName}>{opponent.name}</Text>
          <Text style={styles.scoreValue}>{opponent.totalScore}</Text>
          <Text style={styles.wordsCount}>
            {finalResults.finalScores?.find(p => p.name === opponent.name)?.totalWords || 0} words
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E8B94E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerScore: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D9A93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  winnerScore: {
    borderColor: '#8B4513',
    backgroundColor: '#FFFBF2',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 36,
  },
  wordsCount: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666666',
  },
});

export default FinalScoreComparison;