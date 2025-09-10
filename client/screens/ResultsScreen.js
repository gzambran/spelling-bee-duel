import { useState, useEffect, useRef } from 'react';
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

const ResultsScreen = ({ roundResult, gameState, onPlayerReady, onShowFinalResults }) => {
  const [isReady, setIsReady] = useState(false);
  const [recordNotifications, setRecordNotifications] = useState([]);
  const slideAnim = new Animated.Value(0);
  
  // Toast animation for opponent ready notification
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [showToast, setShowToast] = useState(false);

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

  // Get running totals for players (used in Round 2)
  const getPlayerTotals = () => {
    if (!gameState?.players) {
      return { currentPlayerTotal: 0, opponentTotal: 0 };
    }
    
    const currentPlayer = gameState.players.find(p => p.name === currentPlayerName);
    const opponent = gameState.players.find(p => p.name === opponentName);
    
    return {
      currentPlayerTotal: currentPlayer?.totalScore || 0,
      opponentTotal: opponent?.totalScore || 0
    };
  };

  const { currentPlayerTotal, opponentTotal } = getPlayerTotals();

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

  // Get opponent ready status
  const getOpponentReadyStatus = () => {
    if (!gameState?.players) return false;
    
    const opponent = gameState.players.find(p => p.name === opponentName);
    return opponent?.ready || false;
  };

  const opponentIsReady = getOpponentReadyStatus();

  // Handle opponent ready toast
  useEffect(() => {
    if (opponentIsReady && !isReady && !showToast) {
      setShowToast(true);
      
      // Animate in
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowToast(false);
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [opponentIsReady, isReady, showToast, toastAnim]);

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

  const handleButtonPress = () => {
    if (isLastRound) {
      // Navigate to final results - no server communication
      if (onShowFinalResults) {
        onShowFinalResults();
      }
    } else {
      // Normal round progression
      handleReady();
    }
  };

  // Check if we should show running totals (Round 2 only)
  const shouldShowRunningTotals = roundResult.round === 2;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <RecordNotification 
        records={recordNotifications}
        onDismiss={dismissRecordNotifications}
      />

      {/* Floating Toast for Opponent Ready */}
      {showToast && (
        <Animated.View 
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.toastText}>
            {opponentName} is ready!
          </Text>
        </Animated.View>
      )}

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

          {/* Score Display with Winner Emoji */}
          <View style={styles.simpleScoreDisplay}>
            <View style={styles.scoreColumn}>
              <Text style={styles.playerScoreName}>{currentPlayerName}</Text>
              <View style={styles.scoreRow}>
                <Text style={[
                  styles.playerScoreValue,
                  isCurrentRoundWinner && !isRoundTie && styles.winnerScoreValue
                ]}>
                  {currentPlayerData.roundScore}
                </Text>
                {isCurrentRoundWinner && !isRoundTie && (
                  <Text style={styles.winnerEmoji}>👑</Text>
                )}
              </View>
              {/* Show running total for Round 2 only */}
              {shouldShowRunningTotals && (
                <Text style={styles.runningTotalText}>
                  (Total: {currentPlayerTotal})
                </Text>
              )}
            </View>
            
            <Text style={styles.vsText}>VS</Text>
            
            <View style={styles.scoreColumn}>
              <Text style={styles.playerScoreName}>{opponentName}</Text>
              <View style={styles.scoreRow}>
                <Text style={[
                  styles.playerScoreValue,
                  !isCurrentRoundWinner && !isRoundTie && styles.winnerScoreValue
                ]}>
                  {opponentData.roundScore}
                </Text>
                {!isCurrentRoundWinner && !isRoundTie && (
                  <Text style={styles.winnerEmoji}>👑</Text>
                )}
              </View>
              {/* Show running total for Round 2 only */}
              {shouldShowRunningTotals && (
                <Text style={styles.runningTotalText}>
                  (Total: {opponentTotal})
                </Text>
              )}
            </View>
          </View>

          {/* Tie indicator */}
          {isRoundTie && (
            <Text style={styles.tieText}>🤝 It's a tie!</Text>
          )}
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

        {/* Ready Button */}
        <TouchableOpacity
          style={[styles.readyButton, isReady && styles.readyButtonPressed]}
          onPress={handleButtonPress}
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
    marginBottom: 20,
  },
  tieText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D9A93D',
    marginTop: 10,
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
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  winnerEmoji: {
    fontSize: 24,
    marginLeft: 8,
  },
  runningTotalText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
    fontWeight: '500',
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
  toastContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ResultsScreen;