import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PracticeReady = ({ onStartPractice, onBackToLobby }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Mode</Text>
      <Text style={styles.subtitle}>
        Find as many words as you can in 90 seconds!
      </Text>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={onStartPractice}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Start Practice</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackToLobby}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>Back to Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
});

export default PracticeReady;