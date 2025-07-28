import { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Text,
} from 'react-native';

import WinnerAnnouncement from '../components/WinnerAnnouncement';
import FinalScoreComparison from '../components/FinalScoreComparison';
import RoundBreakdown from '../components/RoundBreakdown';
import ActionButtons from '../components/ActionButtons';
import socketService from '../services/socketService';

const FinalResultsScreen = ({ 
  finalResults, 
  gameState, 
  onPlayAgain, 
  onBackToLobby, 
  playerName 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Enhanced player identification with multiple fallback strategies
  const getCurrentPlayerData = () => {
    if (!gameState?.players) return null;
    
    // Strategy 1: Match by exact playerName
    let currentPlayer = gameState.players.find(p => p.name === playerName);
    if (currentPlayer) return currentPlayer;
    
    // Strategy 2: Match by socket ID if available
    if (socketService.socket?.id) {
      currentPlayer = gameState.players.find(p => p.socketId === socketService.socket.id);
      if (currentPlayer) {
        console.log('🔍 Found player by socket ID:', currentPlayer.name);
        return currentPlayer;
      }
    }
    
    // Strategy 3: If only 2 players and we haven't found a match, 
    // there might be a slight name mismatch - try case insensitive
    if (gameState.players.length === 2) {
      currentPlayer = gameState.players.find(p => 
        p.name?.toLowerCase() === playerName?.toLowerCase()
      );
      if (currentPlayer) {
        console.log('🔍 Found player by case-insensitive match:', currentPlayer.name);
        return currentPlayer;
      }
    }
    
    return null;
  };

  const getOpponentData = (currentPlayer) => {
    if (!gameState?.players || !currentPlayer) return null;
    
    return gameState.players.find(p => p.name !== currentPlayer.name);
  };

  const currentPlayer = getCurrentPlayerData();
  const opponent = getOpponentData(currentPlayer);

  // Debug logging
  useEffect(() => {
    console.log('🔍 FinalResultsScreen render check:');
    console.log('  - finalResults:', finalResults ? 'EXISTS' : 'NULL');
    console.log('  - gameState:', gameState ? 'EXISTS' : 'NULL');
    console.log('  - playerName prop:', playerName);
    console.log('  - socket ID:', socketService.socket?.id);
    
    if (gameState?.players) {
      console.log('  - available players:', gameState.players.map(p => ({
        name: p.name,
        socketId: p.socketId
      })));
    }
    
    console.log('  - currentPlayer found:', currentPlayer ? currentPlayer.name : 'NULL');
    console.log('  - opponent found:', opponent ? opponent.name : 'NULL');
    console.log('  - roundResults available:', gameState?.roundResults ? 'YES' : 'NO');
  }, [finalResults, gameState, playerName, currentPlayer, opponent]);

  // Animate in on mount
  useEffect(() => {
    if (finalResults && gameState && currentPlayer && opponent) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [finalResults, gameState, currentPlayer, opponent]);

  // Return early with specific error messages for debugging
  if (!finalResults) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading final results...</Text>
          <Text style={styles.debugText}>Missing: finalResults</Text>
        </View>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading final results...</Text>
          <Text style={styles.debugText}>Missing: gameState</Text>
        </View>
      </View>
    );
  }

  if (!currentPlayer) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading final results...</Text>
          <Text style={styles.debugText}>Cannot find player: "{playerName}"</Text>
          {gameState.players && (
            <Text style={styles.debugText}>
              Available: {gameState.players.map(p => p.name).join(', ')}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (!opponent) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading final results...</Text>
          <Text style={styles.debugText}>Missing: opponent player</Text>
        </View>
      </View>
    );
  }

  // For RoundBreakdown, we need roundResults - but let's make it optional
  const hasRoundResults = gameState.roundResults && Array.isArray(gameState.roundResults);
  
  if (!hasRoundResults) {
    console.warn('⚠️ Missing roundResults, showing simplified final results');
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Winner Announcement */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <WinnerAnnouncement 
            finalResults={finalResults}
            playerName={currentPlayer.name}
          />
        </Animated.View>

        {/* Final Score Comparison */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <FinalScoreComparison
            gameState={gameState}
            finalResults={finalResults}
            playerName={currentPlayer.name}
          />
        </Animated.View>

        {/* Round Breakdown - only show if data available */}
        {hasRoundResults && (
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.roundBreakdownContainer}>
              <RoundBreakdown
                gameState={gameState}
                currentPlayerName={currentPlayer.name}
                opponentName={opponent.name}
              />
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ActionButtons
            onPlayAgain={onPlayAgain}
            onBackToLobby={onBackToLobby}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC543',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  roundBreakdownContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

export default FinalResultsScreen;