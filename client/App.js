import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';
import FinalResultsScreen from './screens/FinalResultsScreen';
import CountdownScreen from './screens/CountdownScreen';

// Import socket service
import socketService from './services/socketService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('lobby');
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roundResults, setRoundResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  
  // Countdown state
  const [countdown, setCountdown] = useState(3);
  const [nextRound, setNextRound] = useState(1);

  // Server timer state
  const [serverTimeRemaining, setServerTimeRemaining] = useState(90);

  // Initialize socket connection on app start
  useEffect(() => {
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Initialize app and set up socket listeners
  const initializeApp = async () => {
    try {
      await socketService.connect();
      setupGameListeners();
    } catch (error) {
      console.error('Failed to connect:', error);
      // Don't show alert on initial connection failure - let actions handle errors
    }
  };

  // Set up game event listeners
  const setupGameListeners = () => {
    // Player events
    socketService.on('player-joined', (data) => {
      console.log('Player joined:', data.player.name);
      setGameState(data.gameState);
    });

    socketService.on('player-disconnected', (data) => {
      console.log('Player disconnected');
      Alert.alert(
        'Opponent Disconnected', 
        'Returning to lobby to find a new game.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🔌 Player disconnected - returning to lobby');
              handleBackToLobby();
            }
          }
        ],
        { cancelable: false } // Prevent dismissing without action
      );
    });

    // Game flow events
    socketService.on('player-ready-status', (data) => {
      setGameState(data.gameState);
    });

    // Countdown event
    socketService.on('countdown-started', (data) => {
      console.log('Countdown started for round:', data.nextRound);
      setCountdown(data.countdown);
      setNextRound(data.nextRound);
      setCurrentScreen('countdown');
      
      // Update countdown every second
      let currentCount = data.countdown;
      const timer = setInterval(() => {
        currentCount--;
        setCountdown(currentCount);
        
        if (currentCount <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    });

    socketService.on('round-started', (data) => {
      console.log('Round started:', data.roundInfo.round);
      setGameState(data.gameState);
      setServerTimeRemaining(90); // Reset timer display
      setCurrentScreen('game');
    });

    // Handle server timer updates
    socketService.on('timer-update', (data) => {
      setServerTimeRemaining(data.timeRemaining);
    });

    // Handle server saying time is up
    socketService.on('round-time-expired', (data) => {
      setServerTimeRemaining(0); // GameScreen will auto-submit when it sees 0
    });

    // Round end events - ALL rounds now go to results screen first
    socketService.on('round-ended', (data) => {
      console.log('Round ended - going to results screen');
      setGameState(data.gameState);
      setRoundResults(data.roundResult);
      setCurrentScreen('results');
    });

    socketService.on('show-final-results', (data) => {
      console.log('Both players ready for final results - transitioning');
      setGameState(data.gameState);
      setFinalResults(data.finalResults);
      setCurrentScreen('final-results');
    });

  };

  // Action handlers - each handles its own errors
  const handleCreateRoom = async (name) => {
    setPlayerName(name);
    const response = await socketService.createRoom(name);
    setRoomCode(response.roomCode);
    setGameState(response.game);
  };

  const handleJoinRoom = async (code, name) => {
    setPlayerName(name);
    setRoomCode(code);
    const response = await socketService.joinRoom(code, name);
    setGameState(response.game);
  };

  const handlePlayerReady = async () => {
    await socketService.setPlayerReady(true);
  };

  // Handle round result submission
  const handleSubmitRoundResults = async (words, totalScore) => {
    try {
      console.log('📊 App submitting round results:', words.length, 'words,', totalScore, 'points');
      const response = await socketService.submitRoundResults(words, totalScore);
      console.log('✅ Round results submitted successfully from App');
      return response;
    } catch (error) {
      console.error('❌ Failed to submit round results from App:', error);
      throw error;
    }
  };

  const handleNextRound = async () => {
    await socketService.setPlayerReady(true);
  };

  const handlePlayAgain = async () => {
    try {
      console.log('🔄 Starting new game with same opponent in room:', roomCode);
      
      // Reset local state for new game but keep room and players
      setRoundResults(null);
      setFinalResults(null);
      setCountdown(3);
      setNextRound(1);
      setServerTimeRemaining(90);
      setCurrentScreen('lobby');
      
    } catch (error) {
      console.error('❌ Failed to start new game:', error);
      Alert.alert('Error', 'Failed to start new game. Please try again.');
    }
  };

  const handleBackToLobby = () => {
    console.log('🏠 Returning to lobby - disconnecting from current room');
    
    // Disconnect and return to lobby for new opponents
    socketService.disconnect();
    
    // Reset all state
    setCurrentScreen('lobby');
    setGameState(null);
    setPlayerName('');
    setRoomCode('');
    setRoundResults(null);
    setFinalResults(null);
    setCountdown(3);
    setNextRound(1);
    setServerTimeRemaining(90);
    
    // Reconnect for new game
    setTimeout(() => {
      initializeApp();
    }, 1000);
  };

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'lobby':
        return (
          <LobbyScreen
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onPlayerReady={handlePlayerReady}
            gameState={gameState}
            roomCode={roomCode}
            playerName={playerName}
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
            playerName={playerName}
            timeRemaining={serverTimeRemaining}
          />
        );
      
      case 'results':
        return (
          <ResultsScreen
            roundResults={roundResults}
            gameState={gameState}
            onNextRound={handleNextRound}
            playerName={playerName}
          />
        );
      
      case 'final-results':
        return (
          <FinalResultsScreen
            finalResults={finalResults}
            gameState={gameState}
            onPlayAgain={handlePlayAgain}
            onBackToLobby={handleBackToLobby}
            playerName={playerName}
          />
        );
      
      default:
        return (
          <LobbyScreen
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onPlayerReady={handlePlayerReady}
            gameState={gameState}
            roomCode={roomCode}
            playerName={playerName}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        {renderCurrentScreen()}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});