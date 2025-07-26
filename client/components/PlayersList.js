import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const PlayersList = ({ players, currentPlayerName }) => {
  const playerCount = players.length;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Players ({playerCount}/2)</Text>
      
      {players.map((player) => (
        <View key={player.id} style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            {player.name === currentPlayerName && (
              <Text style={styles.youLabel}>(You)</Text>
            )}
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
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default PlayersList;