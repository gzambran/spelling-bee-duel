import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import screens
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';
import FinalResultsScreen from './screens/FinalResultsScreen';

// Import socket service
import socketService from './services/socketService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('lobby');
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roundResults, setRoundResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  // Initialize socket connection on app start
  useEffect(() => {
    initializeConnection();
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Initialize socket connection and set up event listeners
  const initializeConnection = async () => {
    try {
      await socketService.connect();
      setIsConnected(true);
      setupSocketListeners();
    } catch (error) {
      console.error('Failed to connect to server:', error);
      Alert.alert(
        'Connection Error',
        'Failed to connect to game server. Please check your connection and try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };

  // Set up socket event listeners
  const setupSocketListeners = () => {
    // Player joined/left events
    socketService.on('player-joined', (data) => {
      console.log('Player joined:', data.player.name);
      setGameState(data.gameState);
    });

    socketService.on('player-disconnected', (data) => {
      console.log('Player disconnected');
      Alert.alert('Player Disconnected', 'Your opponent has disconnected.');
    });

    socketService.on('player-reconnected', (data) => {
      console.log('Player reconnected:', data.playerName);
      Alert.alert('Player Reconnected', `${data.playerName} has reconnected.`);
    });

    // Game flow events
    socketService.on('player-ready-status', (data) => {
      setGameState(data.gameState);
    });

    socketService.on('game-started', (data) => {
      console.log('Game started!');
      setGameState(data.gameState);
      setCurrentScreen('game');
    });

    socketService.on('round-started', (data) => {
      console.log('Round started:', data.roundInfo.round);
      setGameState(data.gameState);
      setCurrentScreen('game');
    });

    // Word submission events
    socketService.on('word-submitted', (data) => {
      console.log(`${data.playerName} found: ${data.word} (${data.points} pts)`);
      setGameState(data.gameState);
    });

    // Round end events
    socketService.on('round-ended', (data) => {
      console.log('Round ended');
      setGameState(data.gameState);
      setRoundResults(data.roundResult);
      
      if (data.gameState.gameStatus === 'finished') {
        setFinalResults(data.gameState.finalResults);
        setCurrentScreen('final-results');
      } else {
        setCurrentScreen('results');
      }
    });

    // Connection events
    socketService.on('disconnected', () => {
      setIsConnected(false);
      Alert.alert(
        'Connection Lost',
        'Lost connection to server. Attempting to reconnect...'
      );
    });

    socketService.on('reconnected', () => {
      setIsConnected(true);
      Alert.alert('Reconnected', 'Successfully reconnected to server.');
    });

    socketService.on('reconnect_failed', () => {
      Alert.alert(
        'Connection Failed',
        'Unable to reconnect to server. Please restart the app.',
        [{ text: 'OK', onPress: () => {} }]
      );
    });
  };

  // Navigation handlers
  const handleCreateRoom = async (name) => {
    try {
      setPlayerName(name);
      const response = await socketService.createRoom(name);
      setRoomCode(response.roomCode);
      setGameState(response.game);
      // Stay on lobby screen until second player joins
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleJoinRoom = async (code, name) => {
    try {
      setPlayerName(name);
      setRoomCode(code);
      const response = await socketService.joinRoom(code, name);
      setGameState(response.game);
      // Stay on lobby screen until both players ready
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePlayerReady = async () => {
    try {
      await socketService.setPlayerReady(true);
      // Game will start automatically when both players ready
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSubmitWord = async (word) => {
    try {
      const response = await socketService.submitWord(word);
      return response;
    } catch (error) {
      throw error; // Let GameScreen handle the error display
    }
  };

  const handleNextRound = async () => {
    try {
      await socketService.setPlayerReady(true);
      // Next round will start automatically when both players ready
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePlayAgain = () => {
    // Reset app state for new game
    setCurrentScreen('lobby');
    setGameState(null);
    setPlayerName('');
    setRoomCode('');
    setRoundResults(null);
    setFinalResults(null);
  };

  const handleBackToLobby = () => {
    // Disconnect from current game and return to lobby
    socketService.disconnect();
    setCurrentScreen('lobby');
    setGameState(null);
    setPlayerName('');
    setRoomCode('');
    setRoundResults(null);
    setFinalResults(null);
    setIsConnected(false);
    
    // Reconnect for new game
    setTimeout(() => {
      initializeConnection();
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
            isConnected={isConnected}
          />
        );
      
      case 'game':
        return (
          <GameScreen
            gameState={gameState}
            onSubmitWord={handleSubmitWord}
            playerName={playerName}
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
            isConnected={isConnected}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});