import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const ResultsScreen = ({ roundResults, gameState, onNextRound, playerName }) => {

  const [readyPressed, setReadyPressed] = useState(false);
  const slideAnim = new Animated.Value(0);

  // Get player data from results
  const currentPlayerData = roundResults?.players 
    ? Object.values(roundResults.players).find(p => p.name === playerName)
    : null;
  
  const opponentData = roundResults?.players 
    ? Object.values(roundResults.players).find(p => p.name !== playerName)
    : null;

  // Get current game state player data for ready status
  const currentGamePlayer = gameState?.players.find(p => p.name === playerName);
  const opponentGamePlayer = gameState?.players.find(p => p.name !== playerName);

  // Animate in on mount
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle ready for next round
  const handleNextRound = async () => {
    setReadyPressed(true);
    try {
      await onNextRound();
    } catch (error) {
      setReadyPressed(false);
      // Error handled by parent
    }
  };

  // Get words sorted by points (descending)
  const getSortedWords = (words) => {
    return [...words].sort((a, b) => b.points - a.points);
  };

  if (!roundResults || !currentPlayerData || !opponentData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  const isCurrentRoundWinner = currentPlayerData.roundScore > opponentData.roundScore;
  const isRoundTie = currentPlayerData.roundScore === opponentData.roundScore;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: slideAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.roundTitle}>
            Round {roundResults.round} Results
          </Text>
          
          {isRoundTie ? (
            <Text style={styles.tieText}>It's a tie!</Text>
          ) : (
            <Text style={styles.winnerText}>
              {isCurrentRoundWinner ? 'You won this round!' : `${opponentData.name} won this round!`}
            </Text>
          )}
        </Animated.View>

        {/* Score Comparison */}
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

        {/* Word Lists */}
        <View style={styles.wordsContainer}>
          <View style={styles.wordColumn}>
            <Text style={styles.columnTitle}>Your Words ({currentPlayerData.wordCount})</Text>
            <ScrollView style={styles.wordsList}>
              {getSortedWords(currentPlayerData.words).map((wordEntry, index) => {
                const opponentFoundIt = opponentData.words.some(w => 
                  w.word.toLowerCase() === wordEntry.word.toLowerCase()
                );
                
                return (
                  <View key={index} style={[
                    styles.wordItem,
                    !opponentFoundIt && styles.uniqueWordItem
                  ]}>
                    <Text style={[
                      styles.wordText,
                      wordEntry.isPangram && styles.pangramWord,
                      !opponentFoundIt && styles.uniqueWordText
                    ]}>
                      {wordEntry.word.toUpperCase()}
                    </Text>
                    <Text style={styles.wordPoints}>
                      {wordEntry.points}{wordEntry.isPangram ? '★' : ''}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.wordColumn}>
            <Text style={styles.columnTitle}>{opponentData.name}'s Words ({opponentData.wordCount})</Text>
            <ScrollView style={styles.wordsList}>
              {getSortedWords(opponentData.words).map((wordEntry, index) => {
                const playerFoundIt = currentPlayerData.words.some(w => 
                  w.word.toLowerCase() === wordEntry.word.toLowerCase()
                );
                
                return (
                  <View key={index} style={[
                    styles.wordItem,
                    !playerFoundIt && styles.uniqueWordItem
                  ]}>
                    <Text style={[
                      styles.wordText,
                      wordEntry.isPangram && styles.pangramWord,
                      !playerFoundIt && styles.uniqueWordText
                    ]}>
                      {wordEntry.word.toUpperCase()}
                    </Text>
                    <Text style={styles.wordPoints}>
                      {wordEntry.points}{wordEntry.isPangram ? '★' : ''}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Ready Status */}
        <View style={styles.readySection}>
          {currentGamePlayer?.ready && (
            <Text style={styles.readyStatus}>
              ✅ You're ready! Waiting for {opponentData.name}...
            </Text>
          )}
          
          {opponentGamePlayer?.ready && !currentGamePlayer?.ready && (
            <Text style={styles.readyStatus}>
              {opponentData.name} is ready!
            </Text>
          )}
        </View>

        {/* Next Round Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.nextRoundButton,
              (readyPressed || currentGamePlayer?.ready) && styles.disabledButton
            ]}
            onPress={handleNextRound}
            disabled={readyPressed || currentGamePlayer?.ready}
          >
            <Text style={styles.nextRoundButtonText}>
              {gameState.currentRound >= gameState.totalRounds 
                ? 'Ready for Final Results'
                : `Ready for Round ${gameState.currentRound + 1}`
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC543',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  roundTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513', 
  },
  tieText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D9A93D',
  },
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

  wordsContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  wordColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  wordsList: {
    maxHeight: 300,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FFFBF2',
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E8B94E',
  },
  uniqueWordItem: {
    backgroundColor: '#FFFBF2',
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513',
  },
  wordText: {
    fontSize: 14,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  uniqueWordText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  pangramWord: {
    color: '#D9A93D',
    fontWeight: 'bold',
  },
  wordPoints: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },

  readySection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  readyStatus: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  nextRoundButton: {
    backgroundColor: '#FFFBF2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9A93D',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextRoundButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E8B94E',
    borderColor: '#D9A93D',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default ResultsScreen;