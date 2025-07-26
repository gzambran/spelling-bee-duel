import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ActionButtons = ({ onPlayAgain, onBackToLobby }) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={onPlayAgain}
          activeOpacity={0.7}
        >
          <Text style={styles.playAgainButtonText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backToLobbyButton}
          onPress={onBackToLobby}
          activeOpacity={0.7}
        >
          <Text style={styles.backToLobbyButtonText}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#7A3A0F',
  },
  playAgainButtonText: {
    color: '#FFFBF2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLobbyButton: {
    flex: 1,
    backgroundColor: '#FFFBF2',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D9A93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backToLobbyButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActionButtons;