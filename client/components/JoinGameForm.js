import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LobbyCard from './LobbyCard';

const JoinGameForm = ({ 
  inputRoomCode,
  updateRoomCode,
  isJoining, 
  onJoinGame 
}) => {
  return (
    <LobbyCard>
      <TextInput
        style={styles.input}
        placeholder="xxxx"
        value={inputRoomCode}
        onChangeText={updateRoomCode}
        maxLength={4}
        keyboardType="numeric"
        autoCapitalize="characters"
        autoCorrect={false}
        onSubmitEditing={onJoinGame}
        returnKeyType="done"
        textAlign="center"
        placeholderTextColor="#999999"
      />
      
      <TouchableOpacity
        style={[styles.button, isJoining && styles.buttonDisabled]}
        onPress={onJoinGame}
        disabled={isJoining}
        activeOpacity={0.7}
      >
        {isJoining ? (
          <>
            <ActivityIndicator size="small" color="#666666" style={styles.spinner} />
            <Text style={styles.buttonText}>Joining...</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Join Game</Text>
        )}
      </TouchableOpacity>
    </LobbyCard>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFBF2',
    borderWidth: 1,
    borderColor: '#D9A93D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#2E2E2E',
    letterSpacing: 2,
    marginBottom: 12,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#FFFBF2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D9A93D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  spinner: {
    marginRight: 8,
  },
});

export default JoinGameForm;