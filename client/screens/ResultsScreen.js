import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

import socketService from '../services/socketService';
import WordsComparison from '../components/WordsComparison';
import RecordNotification from '../components/RecordNotification';

const ResultsScreen = ({ roundResult, gameState, onPlayerReady }) => {
  const [isReady, setIsReady] = useState(false);
  const [recordNotifications, setRecordNotifications] = useState([]);
  const slideAnim = new Animated.Value(0);

  // Identify current player - try multiple approaches for robustness
  const getCurrentPlayerName = () => {
    // Method 1: Use socket ID if available in players data
    if (socketService.socket?.id && roundResult?.players) {
      const players = Object.entries(roundResult.players);
      const currentPlayerEntry = players.find(([socketId]) => socketId === socketService.socket.id);
      if (currentPlayerEntry) {
        return currentPlayerEntry[1].name;
      }
    }
    
    // Method 2: Use gameState to find current player
    if (gameState?.players?.length > 0 && socketService.socket?.id) {
      const currentPlayer = gameState.players.find(p => p.socketId === socketService.socket.id);
      if (currentPlayer) {
        return currentPlayer.name;
      }
    }
    
    // Method 3: Fallback to first player (not ideal but prevents crashes)
    if (roundResult?.players) {
      const firstPlayer = Object.values(roundResult.players)[0];
      return firstPlayer?.name || 'You';
    }
    
    return 'You';
  };

  // Get player data from round results
  const getPlayerData = () => {
    if (!roundResult?.players) {
      return {
        currentPlayerData: null,
        opponentData: null,
        currentPlayerName: 'You',
        opponentName: 'Opponent'
      };
    }

    const currentPlayerName = getCurrentPlayerName();
    const players = Object.values(roundResult.players);
    
    const currentPlayerData = players.find(p => p.name === currentPlayerName);
    const opponentData = players.find(p => p.name !== currentPlayerName);

    return {
      currentPlayerData,
      opponentData,
      currentPlayerName,
      opponentName: opponentData?.name || 'Opponent'
    };
  };

  const { currentPlayerData, opponentData, currentPlayerName, opponentName } = getPlayerData();

  // Calculate round winner status
  const getRoundWinnerStatus = () => {
    if (!currentPlayerData || !opponentData) {
      return { isCurrentRoundWinner: false, isRoundTie: false };
    }
    
    const isCurrentRoundWinner = currentPlayerData.roundScore > opponentData.roundScore;
    const isRoundTie = currentPlayerData.roundScore === opponentData.roundScore;
    
    return { isCurrentRoundWinner, isRoundTie };
  };

  const { isCurrentRoundWinner, isRoundTie } = getRoundWinnerStatus();

  // Utility function to sort words by points (descending)
  const getSortedWords = (words) => {
    if (!Array.isArray(words)) return [];
    return [...words].sort((a, b) => b.points - a.points);
  };

  // Animation on mount
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Listen for record notifications when round ends
  useEffect(() => {
    const handleRoundEnded = (data) => {
      // Check if this round has record notifications for the current user
      if (data.recordNotifications && socketService.socket?.id) {
        const myRecords = data.recordNotifications[socketService.socket.id];
        if (myRecords && myRecords.roundRecords.length > 0) {
          console.log('🎉 Round records broken:', myRecords.roundRecords);
          setRecordNotifications(myRecords.roundRecords);
        }
      }
    };

    // Set up listener
    socketService.on('round-ended', handleRoundEnded);

    // Check if we already have record notifications from props
    if (roundResult?.recordsUpdated && socketService.socket?.id) {
      const myRecords = roundResult.recordsUpdated[socketService.socket.id];
      if (myRecords && myRecords.roundRecords && myRecords.roundRecords.length > 0) {
        setRecordNotifications(myRecords.roundRecords);
      }
    }

    return () => {
      socketService.off('round-ended', handleRoundEnded);
    };
  }, [roundResult]);

  const handleReady = async () => {
    try {
      setIsReady(true);
      await socketService.setPlayerReady(true);
      if (onPlayerReady) {
        onPlayerReady();
      }
    } catch (error) {
      console.error('Error setting player ready:', error);
      setIsReady(false);
    }
  };

  const dismissRecordNotifications = () => {
    setRecordNotifications([]);
  };

  // Loading state
  if (!roundResult || !gameState || !currentPlayerData || !opponentData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  const isLastRound = gameState.currentRound >= gameState.totalRounds;
  const buttonText = isLastRound 
    ? 'Continue to Final Results' 
    : `Ready for Round ${gameState.currentRound + 1}`;

  // Get opponent ready status
  const getOpponentReadyStatus = () => {
    if (!gameState?.players) return false;
    
    const opponent = gameState.players.find(p => p.name === opponentName);
    return opponent?.ready || false;
  };

  const opponentIsReady = getOpponentReadyStatus();

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <RecordNotification 
        records={recordNotifications}
        onDismiss={dismissRecordNotifications}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.title}>
            Round {roundResult.round} Results
          </Text>
          
          {isRoundTie ? (
            <Text style={styles.tieText}>It's a tie!</Text>
          ) : (
            <Text style={styles.winnerText}>
              {isCurrentRoundWinner ? 'You won this round!' : `${opponentName} won this round!`}
            </Text>
          )}

          {/* Simplified Score Display */}
          <View style={styles.simpleScoreDisplay}>
            <View style={styles.scoreColumn}>
              <Text style={styles.playerScoreName}>{currentPlayerName}</Text>
              <Text style={[
                styles.playerScoreValue,
                isCurrentRoundWinner && !isRoundTie && styles.winnerScoreValue
              ]}>
                {currentPlayerData.roundScore}
              </Text>
            </View>
            
            <Text style={styles.vsText}>VS</Text>
            
            <View style={styles.scoreColumn}>
              <Text style={styles.playerScoreName}>{opponentName}</Text>
              <Text style={[
                styles.playerScoreValue,
                !isCurrentRoundWinner && !isRoundTie && styles.winnerScoreValue
              ]}>
                {opponentData.roundScore}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Detailed Word Lists */}
        <Animated.View 
          style={[
            styles.wordsSection,
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
          <WordsComparison
            currentPlayerData={currentPlayerData}
            opponentData={opponentData}
            getSortedWords={getSortedWords}
          />
        </Animated.View>

        {/* Ready Status */}
        {opponentIsReady && !isReady && (
          <View style={styles.opponentReadyMessage}>
            <Text style={styles.opponentReadyText}>
              {opponentName} is ready!
            </Text>
          </View>
        )}

        {/* Ready Button */}
        <TouchableOpacity
          style={[styles.readyButton, isReady && styles.readyButtonPressed]}
          onPress={handleReady}
          disabled={isReady}
          activeOpacity={0.8}
        >
          <Text style={[styles.readyButtonText, isReady && styles.readyButtonTextPressed]}>
            {isReady ? 'Waiting for opponent...' : buttonText}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC543',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 30,
  },
  loadingText: {
    fontSize: 18,
    color: '#2E2E2E',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 20,
  },
  tieText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D9A93D',
    marginBottom: 20,
  },
  simpleScoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 30,
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
  scoreColumn: {
    alignItems: 'center',
    minWidth: 80,
  },
  playerScoreName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  playerScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  winnerScoreValue: {
    color: '#8B4513',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginHorizontal: 30,
  },
  wordsSection: {
    marginBottom: 20,
  },
  opponentReadyMessage: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  opponentReadyText: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
  },
  readyButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#654321',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  readyButtonPressed: {
    backgroundColor: '#654321',
    borderColor: '#4A2C17',
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  readyButtonTextPressed: {
    color: '#CCCCCC',
  },
});

export default ResultsScreen;