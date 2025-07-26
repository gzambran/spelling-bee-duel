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

const FinalResultsScreen = ({ 
  finalResults, 
  gameState, 
  onPlayAgain, 
  onBackToLobby, 
  playerName 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Get player data
  const currentPlayer = gameState?.players.find(p => p.name === playerName);
  const opponent = gameState?.players.find(p => p.name !== playerName);

  // Animate in on mount
  useEffect(() => {
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
  }, []);

  // Enhanced null safety check
  if (!finalResults || !gameState || !currentPlayer || !opponent) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading final results...</Text>
        </View>
      </View>
    );
  }

  // Additional safety check for roundResults
  if (!gameState.roundResults) {
    console.error('Missing roundResults in gameState:', gameState);
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Error loading game data. Please try again.</Text>
        </View>
      </View>
    );
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
            playerName={playerName}
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
            playerName={playerName}
          />
        </Animated.View>

        {/* Round Breakdown */}
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
              currentPlayerName={playerName}
              opponentName={opponent.name}
            />
          </View>
        </Animated.View>

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
  },
});

export default FinalResultsScreen;