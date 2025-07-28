import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import LobbyCard from './LobbyCard';

const CreateGameForm = ({ isCreating, onCreateGame }) => {
  return (
    <LobbyCard style={styles.container}>
      <TouchableOpacity
        style={[
          styles.createButton,
          isCreating && styles.createButtonDisabled
        ]}
        onPress={onCreateGame}
        disabled={isCreating}
        activeOpacity={0.7}
      >
        {isCreating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFBF2" />
            <Text style={styles.createButtonText}>Creating...</Text>
          </View>
        ) : (
          <Text style={styles.createButtonText}>Create Game</Text>
        )}
      </TouchableOpacity>
    </LobbyCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#B8860B',
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFBF2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CreateGameForm;