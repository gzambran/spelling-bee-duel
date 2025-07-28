import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';

// Import custom hooks
import { useAuth } from './hooks/useAuth';
import { useGameFlow } from './hooks/useGameFlow';

// Import screens
import LoginScreen from './screens/LoginScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';
import FinalResultsScreen from './screens/FinalResultsScreen';
import CountdownScreen from './screens/CountdownScreen';
import PracticeScreen from './screens/PracticeScreen';

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  // Practice mode state
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [pendingPracticeMode, setPendingPracticeMode] = useState(false);
  
  // Animation state
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  // Authentication state and handlers
  const {
    isLoggedIn,
    user,
    isCheckingAuth,
    handleLoginSuccess,
    handleSignOut
  } = useAuth();

  // Game state and handlers
  const {
    currentScreen,
    gameState,
    roomCode,
    roundResults,
    finalResults,
    countdown,
    nextRound,
    serverTimeRemaining,
    handleCreateRoom,
    handleJoinRoom,
    handlePlayerReady,
    handleSubmitRoundResults,
    handleNextRound,
    handlePlayAgain,
    handleBackToLobby
  } = useGameFlow(user);

  // Slide to new screen
  const slideToScreen = (callback) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Slide new screen in from right
    slideAnim.setValue(screenWidth);
    
    // Execute callback immediately (change screen state)
    callback();
    
    // Animate slide in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
    });
  };

  // Practice mode handlers with animation
  const handleStartPractice = () => {
    slideToScreen(() => {
      setIsPracticeMode(true);
    });
  };

  const handleBackToLobbyFromPractice = () => {
    slideToScreen(() => {
      setIsPracticeMode(false);
    });
  };

  // Enhanced back to lobby handler
  const handleBackToLobbyMain = () => {
    slideToScreen(() => {
      setIsPracticeMode(false);
      handleBackToLobby();
    });
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.loadingContainer]}>
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Show practice screen if in practice mode
  if (isPracticeMode) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <PracticeScreen onBackToLobby={handleBackToLobbyFromPractice} />
          </Animated.View>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render current game screen for authenticated users
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'lobby':
        return (
          <LobbyScreen
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onPlayerReady={handlePlayerReady}
            onSignOut={handleSignOut}
            onStartPractice={handleStartPractice}
            onBackToLobby={handleBackToLobby}
            gameState={gameState}
            roomCode={roomCode}
            user={user}
          />
        );
      
      case 'countdown':
        return (
          <CountdownScreen
            countdown={countdown}
            nextRound={nextRound}
          />
        );
      
      case 'game':
        return (
          <GameScreen
            gameState={gameState}
            onSubmitRoundResults={handleSubmitRoundResults}
            playerName={user.displayName}
            timeRemaining={serverTimeRemaining}
          />
        );
      
      case 'results':
        return (
          <ResultsScreen
            roundResult={roundResults}
            gameState={gameState}
            onPlayerReady={handleNextRound}
            playerName={user.displayName}
          />
        );
      
      case 'final-results':
        return (
          <FinalResultsScreen
            finalResults={finalResults}
            gameState={gameState}
            onPlayAgain={handlePlayAgain}
            onBackToLobby={handleBackToLobbyMain}
            playerName={user.displayName}
          />
        );
      
      default:
        return (
          <LobbyScreen
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onPlayerReady={handlePlayerReady}
            onSignOut={handleSignOut}
            onStartPractice={handleStartPractice}
            onBackToLobby={handleBackToLobby}
            gameState={gameState}
            roomCode={roomCode}
            user={user}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Animated.View 
          style={[
            styles.screenContainer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {renderCurrentScreen()}
        </Animated.View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC543',
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC543',
  },
});