import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const LobbyScreen = ({
  onCreateRoom,
  onJoinRoom,
  onPlayerReady,
  gameState,
  roomCode,
  playerName,
  isConnected,
}) => {
  const [playerNameInput, setPlayerNameInput] = useState(playerName || '');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerNameInput.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateRoom(playerNameInput.trim());
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerNameInput.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!inputRoomCode.trim()) {
      Alert.alert('Error', 'Please enter room code');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    setIsJoining(true);
    try {
      await onJoinRoom(inputRoomCode.trim().toUpperCase(), playerNameInput.trim());
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsJoining(false);
    }
  };

  const handlePlayerReady = async () => {
    try {
      await onPlayerReady();
    } catch (error) {
      // Error handled by parent component
    }
  };

  // If in a game, show waiting room
  if (gameState && roomCode) {
    const playerCount = gameState.players.length;
    const allReady = gameState.players.every(p => p.ready);
    const currentPlayer = gameState.players.find(p => p.name === playerName);
    const isReady = currentPlayer?.ready || false;

    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Spelling Bee Duel</Text>
            <View style={styles.connectionStatus}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
              <Text style={styles.statusText}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          {/* Room Info */}
          <View style={styles.roomCard}>
            <Text style={styles.roomTitle}>Room Code</Text>
            <Text style={styles.roomCode}>{roomCode}</Text>
            <Text style={styles.roomSubtitle}>Share this code with your opponent</Text>
          </View>

          {/* Players */}
          <View style={styles.playersCard}>
            <Text style={styles.sectionTitle}>Players ({playerCount}/2)</Text>
            
            {gameState.players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  {player.name === playerName && <Text style={styles.youLabel}>(You)</Text>}
                </View>
                <View style={[
                  styles.readyBadge, 
                  { backgroundColor: player.ready ? '#4CAF50' : '#F44336' }
                ]}>
                  <Text style={styles.readyText}>
                    {player.ready ? 'Ready' : 'Not Ready'}
                  </Text>
                </View>
              </View>
            ))}

            {playerCount < 2 && (
              <View style={styles.waitingRow}>
                <ActivityIndicator size="small" color="#326891" />
                <Text style={styles.waitingText}>Waiting for second player...</Text>
              </View>
            )}
          </View>

          {/* Ready Button */}
          {playerCount === 2 && (
            <TouchableOpacity
              style={[
                styles.readyButton,
                { backgroundColor: isReady ? '#4CAF50' : '#326891' }
              ]}
              onPress={handlePlayerReady}
              disabled={isReady}
            >
              <Text style={styles.readyButtonText}>
                {isReady ? 'Ready! Waiting for opponent...' : 'Ready to Play'}
              </Text>
            </TouchableOpacity>
          )}

          {allReady && playerCount === 2 && (
            <View style={styles.startingCard}>
              <ActivityIndicator size="large" color="#F7DA21" />
              <Text style={styles.startingText}>Starting game...</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Main lobby screen
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Spelling Bee Duel</Text>
          <Text style={styles.subtitle}>Find words. Beat friends. Bee victorious!</Text>
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Text>
          </View>
        </View>

        {/* Single Name Input */}
        <View style={styles.nameSection}>
          <Text style={styles.nameLabel}>Your Name</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              value={playerNameInput}
              onChangeText={setPlayerNameInput}
              maxLength={20}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Create Game Section */}
        <View style={styles.gameSection}>
          <Text style={styles.sectionHeader}>Create New Game</Text>
          
          <TouchableOpacity
            style={[styles.primaryButton, !isConnected && styles.disabledButton]}
            onPress={handleCreateRoom}
            disabled={!isConnected || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Game</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Join Game Section */}
        <View style={styles.gameSection}>
          <Text style={styles.sectionHeader}>Join Existing Game</Text>
          
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Room Code</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter 4-digit code"
              value={inputRoomCode}
              onChangeText={(text) => setInputRoomCode(text.toUpperCase())}
              maxLength={4}
              keyboardType="numeric"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.secondaryButton, !isConnected && styles.disabledButton]}
            onPress={handleJoinRoom}
            disabled={!isConnected || isJoining}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#326891" />
            ) : (
              <Text style={styles.secondaryButtonText}>Join Game</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Collapsible How to Play */}
        <View style={styles.howToPlayCard}>
          <TouchableOpacity 
            style={styles.howToPlayHeader}
            onPress={() => setShowHowToPlay(!showHowToPlay)}
          >
            <Text style={styles.howToPlayTitle}>How to Play</Text>
            <Text style={styles.howToPlayToggle}>
              {showHowToPlay ? '−' : '+'}
            </Text>
          </TouchableOpacity>
          
          {showHowToPlay && (
            <View style={styles.howToPlayContent}>
              <Text style={styles.rulesText}>
                • 3 rounds, 90 seconds each{'\n'}
                • Find words using the 7 letters{'\n'}
                • Center letter must be in every word{'\n'}
                • 4+ letters only{'\n'}
                • Longer words = more points{'\n'}
                • Use all 7 letters for pangram bonus!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
  },
  nameSection: {
    marginBottom: 30,
  },
  nameLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 12,
  },
  gameSection: {
    backgroundColor: '#F8F6F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#2E2E2E',
    padding: 0, // Remove default padding for consistent styling
  },
  primaryButton: {
    backgroundColor: '#326891',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#326891',
  },
  secondaryButtonText: {
    color: '#326891',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  howToPlayCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  howToPlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  howToPlayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  howToPlayToggle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#326891',
    width: 30,
    textAlign: 'center',
  },
  howToPlayContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rulesText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  // Waiting room styles
  roomCard: {
    backgroundColor: '#F7DA21',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E2E2E',
    letterSpacing: 4,
    marginBottom: 4,
  },
  roomSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  playersCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  youLabel: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },
  readyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  waitingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  readyButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  readyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startingCard: {
    backgroundColor: '#F8F6F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  startingText: {
    fontSize: 16,
    color: '#2E2E2E',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default LobbyScreen;