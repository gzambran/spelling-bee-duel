import { View, Text, StyleSheet } from 'react-native';

const RoundBreakdown = ({ gameState, currentPlayerName, opponentName }) => {
  // Get round breakdown for both players in a consolidated format
  const getRoundBreakdown = () => {
    if (!gameState?.roundResults || !Array.isArray(gameState.roundResults)) {
      console.warn('roundResults not available in gameState');
      return [];
    }
    
    return gameState.roundResults.map((round, index) => {
      if (!round?.players) {
        console.warn(`Round ${index + 1} missing players data`);
        return {
          round: round?.round || index + 1,
          currentPlayer: { points: 0, words: 0 },
          opponent: { points: 0, words: 0 }
        };
      }
      
      const currentPlayerData = Object.values(round.players).find(p => p.name === currentPlayerName);
      const opponentData = Object.values(round.players).find(p => p.name === opponentName);
      
      return {
        round: round.round,
        currentPlayer: {
          points: currentPlayerData?.roundScore || 0,
          words: currentPlayerData?.wordCount || 0
        },
        opponent: {
          points: opponentData?.roundScore || 0,
          words: opponentData?.wordCount || 0
        }
      };
    });
  };

  const roundsData = getRoundBreakdown();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Round Breakdown</Text>
      
      {/* Header row with player names */}
      <View style={styles.headerRow}>
        <View style={styles.roundColumn}>
          <Text style={styles.headerText}>Round</Text>
        </View>
        <View style={styles.playerColumn}>
          <Text style={styles.headerText}>{currentPlayerName}</Text>
        </View>
        <View style={styles.playerColumn}>
          <Text style={styles.headerText}>{opponentName}</Text>
        </View>
      </View>

      {/* Round data rows */}
      {roundsData.map((roundData, index) => (
        <View key={index} style={styles.dataRow}>
          <View style={styles.roundColumn}>
            <Text style={styles.roundText}>{roundData.round}</Text>
          </View>
          <View style={styles.playerColumn}>
            <Text style={styles.pointsText}>{roundData.currentPlayer.points} pts</Text>
            <Text style={styles.wordsText}>({roundData.currentPlayer.words} words)</Text>
          </View>
          <View style={styles.playerColumn}>
            <Text style={styles.pointsText}>{roundData.opponent.points} pts</Text>
            <Text style={styles.wordsText}>({roundData.opponent.words} words)</Text>
          </View>
        </View>
      ))}

      {/* Totals row */}
      <View style={styles.totalRow}>
        <View style={styles.roundColumn}>
          <Text style={styles.totalLabel}>Total</Text>
        </View>
        <View style={styles.playerColumn}>
          <Text style={styles.totalPoints}>
            {gameState?.players?.find(p => p.name === currentPlayerName)?.totalScore || 0} pts
          </Text>
          <Text style={styles.totalWords}>
            ({roundsData.reduce((sum, round) => sum + round.currentPlayer.words, 0)} words)
          </Text>
        </View>
        <View style={styles.playerColumn}>
          <Text style={styles.totalPoints}>
            {gameState?.players?.find(p => p.name === opponentName)?.totalScore || 0} pts
          </Text>
          <Text style={styles.totalWords}>
            ({roundsData.reduce((sum, round) => sum + round.opponent.words, 0)} words)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 6,
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: '#326891',
    borderRadius: 8,
    marginTop: 8,
  },
  roundColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  playerColumn: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  roundText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  wordsText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalWords: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
});

export default RoundBreakdown;