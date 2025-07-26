import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';

export const useLobbyForm = (initialPlayerName = '') => {
  const [playerNameInput, setPlayerNameInput] = useState(initialPlayerName);
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Validation helpers
  const validatePlayerName = () => {
    const trimmedName = playerNameInput.trim();
    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your name before continuing');
      return false;
    }
    return true;
  };

  const validateRoomCode = () => {
    const trimmedCode = inputRoomCode.trim();
    if (!trimmedCode) {
      Alert.alert('Room Code Required', 'Please enter the 4-digit room code');
      return false;
    }
    if (trimmedCode.length !== 4) {
      Alert.alert('Invalid Room Code', 'Room code must be exactly 4 digits');
      return false;
    }
    return true;
  };

  // Create game action
  const handleCreateGame = async (onCreateRoom) => {
    if (!validatePlayerName()) return;

    Keyboard.dismiss();
    setIsCreating(true);

    try {
      await onCreateRoom(playerNameInput.trim());
    } catch (error) {
      console.error('Create game error:', error);
      Alert.alert('Connection Error', 'Failed to create game. Please check your connection and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Join game action
  const handleJoinGame = async (onJoinRoom) => {
    if (!validatePlayerName() || !validateRoomCode()) return;

    Keyboard.dismiss();
    setIsJoining(true);

    try {
      await onJoinRoom(inputRoomCode.trim().toUpperCase(), playerNameInput.trim());
    } catch (error) {
      console.error('Join game error:', error);
      Alert.alert('Connection Error', 'Failed to join game. Please check the room code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Update room code with formatting and validation
  const updateRoomCode = (text) => {
    // Only allow numeric input and limit to 4 characters
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setInputRoomCode(numericText.toUpperCase());
  };

  // Reset form state
  const resetForm = () => {
    setInputRoomCode('');
    setIsCreating(false);
    setIsJoining(false);
  };

  // Clear all form data
  const clearAll = () => {
    setPlayerNameInput('');
    setInputRoomCode('');
    setIsCreating(false);
    setIsJoining(false);
  };

  return {
    // State
    playerNameInput,
    inputRoomCode,
    isCreating,
    isJoining,
    
    // Actions
    setPlayerNameInput,
    updateRoomCode,
    handleCreateGame,
    handleJoinGame,
    resetForm,
    clearAll,
    
    // Validation
    validatePlayerName,
    validateRoomCode
  };
};