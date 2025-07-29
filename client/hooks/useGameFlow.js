import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import socketService from '../services/socketService';

export const useGameFlow = (user) => {
  // Game state
  const [currentScreen, setCurrentScreen] = useState('lobby');
  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [roundResults, setRoundResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  
  // Countdown state
  const [countdown, setCountdown] = useState(3);
  const [nextRound, setNextRound] = useState(1);

  // Server timer state
  const [serverTimeRemaining, setServerTimeRemaining] = useState(90);

  // Make event handlers stable with useCallback to prevent recreation
  const handlePlayerJoined = useCallback((data) => {
    console.log('Player joined:', data.player.name);
    setGameState(data.gameState);
  }, []);

  const handlePlayerDisconnected = useCallback((data) => {
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
      { cancelable: false }
    );
  }, []);

  const handlePlayerReadyStatus = useCallback((data) => {
    setGameState(data.gameState);
  }, []);

  const handleGameRestarted = useCallback((data) => {
    console.log('🔄 Game restarted by server - updating state');
    setGameState(data.gameState);
    
    // Reset any local state that might interfere with new game
    setRoundResults(null);
    setFinalResults(null);
    setServerTimeRemaining(90);
  }, []);

  const handleCountdownStarted = useCallback((data) => {
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
  }, []);

  const handleRoundStarted = useCallback((data) => {
    console.log('Round started:', data.roundInfo.round);
    setGameState(data.gameState);
    setServerTimeRemaining(90);
    setCurrentScreen('game');
  }, []);

  const handleTimerUpdate = useCallback((data) => {
    setServerTimeRemaining(data.timeRemaining);
  }, []);

  const handleRoundTimeExpired = useCallback((data) => {
    setServerTimeRemaining(0);
  }, []);

  const handleRoundEnded = useCallback((data) => {
    console.log('Round ended - going to results screen');
    setGameState(data.gameState);
    setRoundResults(data.roundResult);
    setCurrentScreen('results');
  }, []);

  const handleShowFinalResults = useCallback((data) => {
    console.log('Both players ready for final results - transitioning');
    setGameState(data.gameState);
    setFinalResults(data.finalResults);
    setCurrentScreen('final-results');
  }, []);

  // Set up game event listeners when user is available
  useEffect(() => {
    if (user && socketService.socket) {
      // REMOVE OLD LISTENERS FIRST
      socketService.off('player-joined', handlePlayerJoined);
      socketService.off('player-disconnected', handlePlayerDisconnected);
      socketService.off('player-ready-status', handlePlayerReadyStatus);
      socketService.off('game-restarted', handleGameRestarted);
      socketService.off('countdown-started', handleCountdownStarted);
      socketService.off('round-started', handleRoundStarted);
      socketService.off('timer-update', handleTimerUpdate);
      socketService.off('round-time-expired', handleRoundTimeExpired);
      socketService.off('round-ended', handleRoundEnded);
      socketService.off('show-final-results', handleShowFinalResults);

      // ADD NEW LISTENERS
      socketService.on('player-joined', handlePlayerJoined);
      socketService.on('player-disconnected', handlePlayerDisconnected);
      socketService.on('player-ready-status', handlePlayerReadyStatus);
      socketService.on('game-restarted', handleGameRestarted);
      socketService.on('countdown-started', handleCountdownStarted);
      socketService.on('round-started', handleRoundStarted);
      socketService.on('timer-update', handleTimerUpdate);
      socketService.on('round-time-expired', handleRoundTimeExpired);
      socketService.on('round-ended', handleRoundEnded);
      socketService.on('show-final-results', handleShowFinalResults);

      console.log('✅ Game event listeners set up');
    }

    // CLEANUP ON UNMOUNT
    return () => {
      socketService.off('player-joined', handlePlayerJoined);
      socketService.off('player-disconnected', handlePlayerDisconnected);
      socketService.off('player-ready-status', handlePlayerReadyStatus);
      socketService.off('game-restarted', handleGameRestarted);
      socketService.off('countdown-started', handleCountdownStarted);
      socketService.off('round-started', handleRoundStarted);
      socketService.off('timer-update', handleTimerUpdate);
      socketService.off('round-time-expired', handleRoundTimeExpired);
      socketService.off('round-ended', handleRoundEnded);
      socketService.off('show-final-results', handleShowFinalResults);
      console.log('🧹 Game event listeners cleaned up');
    };
  }, [user, handlePlayerJoined, handlePlayerDisconnected, handlePlayerReadyStatus, 
      handleGameRestarted, handleCountdownStarted, handleRoundStarted, 
      handleTimerUpdate, handleRoundTimeExpired, handleRoundEnded, handleShowFinalResults]);

  // Reset game state to initial values
  const resetGameState = () => {
    setCurrentScreen('lobby');
    setGameState(null);
    setRoomCode('');
    setRoundResults(null);
    setFinalResults(null);
    setCountdown(3);
    setNextRound(1);
    setServerTimeRemaining(90);
  };

const handleCreateRoom = async (playerName) => {
  try {
    // Ensure socket is connected and authenticated before attempting room creation
    if (!socketService.isUserAuthenticated()) {
      console.warn('⚠️ Socket not authenticated, attempting to authenticate...');
      
      if (user?.username) {
        try {
          await socketService.authenticateUser(user.username);
          console.log('✅ Socket authentication completed');
        } catch (authError) {
          console.error('❌ Socket authentication failed:', authError.message);
          Alert.alert('Authentication Error', 'Authentication failed. Please refresh the app and try again.');
          return;
        }
      } else {
        console.error('❌ User data missing for authentication');
        Alert.alert('Error', 'User data missing. Please refresh the app and try again.');
        return;
      }
    }

    console.log('🏠 Creating room for:', playerName);
    const result = await socketService.createRoom(playerName);
    
    setRoomCode(result.roomCode);
    setGameState(result.game);
    
    console.log('✅ Room created successfully:', result.roomCode);
  } catch (error) {
    console.error('❌ Create room error:', error.message);
    
    // Handle authentication-specific errors
    if (error.message.includes('Authentication required') || error.message.includes('requiresAuth')) {
      Alert.alert('Authentication Required', 'Authentication required. Please refresh the app and try again.');
    } else {
      Alert.alert('Error', `Failed to create room: ${error.message}`);
    }
  }
};

const handleJoinRoom = async (roomCode, playerName) => {
  try {
    // Ensure socket is connected and authenticated before attempting room join
    if (!socketService.isUserAuthenticated()) {
      console.warn('⚠️ Socket not authenticated, attempting to authenticate...');
      
      if (user?.username) {
        try {
          await socketService.authenticateUser(user.username);
          console.log('✅ Socket authentication completed');
        } catch (authError) {
          console.error('❌ Socket authentication failed:', authError.message);
          Alert.alert('Authentication Error', 'Authentication failed. Please refresh the app and try again.');
          return;
        }
      } else {
        console.error('❌ User data missing for authentication');
        Alert.alert('Error', 'User data missing. Please refresh the app and try again.');
        return;
      }
    }

    console.log('🚪 Joining room:', roomCode, 'as', playerName);
    const result = await socketService.joinRoom(roomCode, playerName);
    
    setRoomCode(result.roomCode);
    setGameState(result.game);
    
    console.log('✅ Room joined successfully:', roomCode);
  } catch (error) {
    console.error('❌ Join room error:', error.message);
    
    // Handle authentication-specific errors
    if (error.message.includes('Authentication required') || error.message.includes('requiresAuth')) {
      Alert.alert('Authentication Required', 'Authentication required. Please refresh the app and try again.');
    } else {
      Alert.alert('Error', `Failed to join room: ${error.message}`);
    }
  }
};

  const handlePlayerReady = async () => {
    try {
      await socketService.setPlayerReady(true);
    } catch (error) {
      console.error('❌ Failed to set player ready:', error);
    }
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
    try {
      await socketService.setPlayerReady(true);
    } catch (error) {
      console.error('❌ Failed to proceed to next round:', error);
    }
  };

  // Handle play again
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
      
      // Signal server that this player is ready to restart
      await socketService.setPlayerReady(true);
      
    } catch (error) {
      console.error('❌ Failed to start new game:', error);
      Alert.alert('Error', 'Failed to start new game. Please try again.');
    }
  };

  const handleBackToLobby = () => {
    console.log('🏠 Returning to lobby - disconnecting from current room');
    
    // Disconnect and return to lobby for new opponents
    socketService.disconnect();
    
    // Reset all game state
    resetGameState();
    
    // Reconnect for new game
    setTimeout(() => {
      socketService.connect().then(() => {
        if (user) {
          socketService.authenticateUser(user.username).catch(error => {
            console.warn('⚠️ Re-authentication failed:', error.message);
          });
        }
      }).catch(error => {
        console.error('❌ Failed to reconnect:', error);
      });
    }, 1000);
  };

  return {
    // State
    currentScreen,
    gameState,
    roomCode,
    roundResults,
    finalResults,
    countdown,
    nextRound,
    serverTimeRemaining,
    
    // Handlers
    handleCreateRoom,
    handleJoinRoom,
    handlePlayerReady,
    handleSubmitRoundResults,
    handleNextRound,
    handleShowFinalResults,
    handlePlayAgain,
    handleBackToLobby
  };
};