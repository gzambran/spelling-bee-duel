import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import PlayersList from './PlayersList';

const WaitingRoom = ({ gameState, roomCode, playerName, onPlayerReady }) => {
  const playerCount = gameState.players.length;
  const allReady = gameState.players.every(p => p.ready);
  const currentPlayer = gameState.players.find(p => p.name === playerName);
  const isReady = currentPlayer?.ready || false;

  const handlePlayerReady = async () => {
    try {
      await onPlayerReady();
    } catch (error) {
      Alert.alert('Error', 'Failed to ready up. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Room Info */}
      <View style={styles.roomCard}>
        <Text style={styles.roomTitle}>Room Code</Text>
        <Text style={styles.roomCode}>{roomCode}</Text>
        <Text style={styles.roomSubtitle}>Share this code with your opponent</Text>
      </View>

      {/* Players List */}
      <PlayersList 
        players={gameState.players}
        currentPlayerName={playerName}
      />

      {/* Ready Button */}
      {playerCount === 2 && (
        <TouchableOpacity
          style={[
            styles.readyButton,
            { backgroundColor: isReady ? '#8B4513' : '#FFFBF2' },
            { borderColor: isReady ? '#7A3A0F' : '#D9A93D' }
          ]}
          onPress={handlePlayerReady}
          disabled={isReady}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.readyButtonText,
            { color: isReady ? '#FFFBF2' : '#333333' }
          ]}>
            {isReady ? 'Ready! Waiting for opponent...' : 'Ready to Play'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Starting Game Indicator */}
      {allReady && playerCount === 2 && (
        <View style={styles.startingCard}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.startingText}>Starting game...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roomCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
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
  readyButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  readyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  startingCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
  startingText: {
    fontSize: 16,
    color: '#2E2E2E',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default WaitingRoom;