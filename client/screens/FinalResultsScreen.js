import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const FinalResultsScreen = ({ 
  finalResults, 
  gameState, 
  onPlayAgain, 
  onBackToLobby, 
  playerName 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get player data
  const currentPlayer = gameState?.players.find(p => p.name === playerName);
  const opponent = gameState?.players.find(p => p.name !== playerName);

  // Animate in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get round breakdown for each player
  const getRoundBreakdown = (playerName) => {
    return gameState.roundResults.map((round, index) => {
      const playerData = Object.values(round.players).find(p => p.name === playerName);
      return {
        round: round.round,
        points: playerData?.roundScore || 0,
        words: playerData?.wordCount || 0
      };
    });
  };

  if (!finalResults || !gameState || !currentPlayer || !opponent) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading final results...</Text>
      </View>
    );
  }

  const isWinner = finalResults.winner?.name === playerName;
  const isTie = finalResults.isTie;
  
  const currentPlayerBreakdown = getRoundBreakdown(playerName);
  const opponentBreakdown = getRoundBreakdown(opponent.name);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Winner Announcement */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.gameOverText}>Game Over!</Text>
          
          {isTie ? (
            <View style={styles.tieContainer}>
              <Text style={styles.tieText}>It's a Tie!</Text>
              <Text style={styles.tieSubtext}>
                Both players scored {finalResults.finalScores[0].totalScore} points
              </Text>
            </View>
          ) : (
            <View style={styles.winnerContainer}>
              <Text style={[
                styles.winnerText,
                { color: isWinner ? '#4CAF50' : '#F44336' }
              ]}>
                {isWinner ? '🎉 You Won! 🎉' : `${finalResults.winner.name} Wins!`}
              </Text>
              <Text style={styles.winnerSubtext}>
                {finalResults.winner.totalScore} points, {finalResults.winner.totalWords} words
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Final Scores */}
        <Animated.View 
          style={[
            styles.finalScoreCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.finalScoreTitle}>Final Scores</Text>
          
          <View style={styles.finalScoreRow}>
            <View style={[
              styles.playerFinalScore,
              isWinner && !isTie && styles.winnerFinalScore
            ]}>
              <Text style={styles.finalPlayerName}>{currentPlayer.name}</Text>
              <Text style={styles.finalScoreValue}>{currentPlayer.totalScore}</Text>
              <Text style={styles.finalWordsCount}>{finalResults.finalScores.find(p => p.name === playerName)?.totalWords} words</Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={[
              styles.playerFinalScore,
              !isWinner && !isTie && styles.winnerFinalScore
            ]}>
              <Text style={styles.finalPlayerName}>{opponent.name}</Text>
              <Text style={styles.finalScoreValue}>{opponent.totalScore}</Text>
              <Text style={styles.finalWordsCount}>{finalResults.finalScores.find(p => p.name === opponent.name)?.totalWords} words</Text>
            </View>
          </View>
        </Animated.View>

        {/* Round Breakdown */}
        <Animated.View 
          style={[
            styles.breakdownCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.breakdownTitle}>Round Breakdown</Text>
          
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownColumn}>
              <Text style={styles.breakdownPlayerName}>{currentPlayer.name}</Text>
              
              {currentPlayerBreakdown.map((roundData, index) => (
                <View key={index} style={styles.roundRow}>
                  <Text style={styles.roundLabel}>Round {roundData.round}</Text>
                  <View style={styles.roundStats}>
                    <Text style={styles.roundPoints}>{roundData.points} pts</Text>
                    <Text style={styles.roundWords}>({roundData.words} words)</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={styles.totalStats}>
                  <Text style={styles.totalPoints}>{currentPlayer.totalScore} pts</Text>
                  <Text style={styles.totalWords}>
                    ({finalResults.finalScores.find(p => p.name === playerName)?.totalWords} words)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownColumn}>
              <Text style={styles.breakdownPlayerName}>{opponent.name}</Text>
              
              {opponentBreakdown.map((roundData, index) => (
                <View key={index} style={styles.roundRow}>
                  <Text style={styles.roundLabel}>Round {roundData.round}</Text>
                  <View style={styles.roundStats}>
                    <Text style={styles.roundPoints}>{roundData.points} pts</Text>
                    <Text style={styles.roundWords}>({roundData.words} words)</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={styles.totalStats}>
                  <Text style={styles.totalPoints}>{opponent.totalScore} pts</Text>
                  <Text style={styles.totalWords}>
                    ({finalResults.finalScores.find(p => p.name === opponent.name)?.totalWords} words)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={onPlayAgain}
          >
            <Text style={styles.playAgainButtonText}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backToLobbyButton}
            onPress={onBackToLobby}
          >
            <Text style={styles.backToLobbyButtonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 16,
  },
  winnerContainer: {
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  winnerSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  tieContainer: {
    alignItems: 'center',
  },
  tieText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  tieSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  finalScoreCard: {
    backgroundColor: '#F8F6F0',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  finalScoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 20,
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerFinalScore: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  winnerFinalScore: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  finalPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  finalScoreValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 4,
  },
  finalWordsCount: {
    fontSize: 14,
    color: '#666666',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  breakdownCard: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 20,
  },
  breakdownContainer: {
    flexDirection: 'row',
  },
  breakdownColumn: {
    flex: 1,
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  breakdownPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 16,
  },
  roundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 6,
  },
  roundLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E2E2E',
  },
  roundStats: {
    alignItems: 'flex-end',
  },
  roundPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  roundWords: {
    fontSize: 11,
    color: '#666666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#326891',
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalStats: {
    alignItems: 'flex-end',
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
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  playAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLobbyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#326891',
  },
  backToLobbyButtonText: {
    color: '#326891',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default FinalResultsScreen;