import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LobbyCard from './LobbyCard';

const CreateGameForm = ({ 
  isCreating, 
  onCreateGame 
}) => {
  return (
    <LobbyCard>
      <TouchableOpacity
        style={[styles.button, isCreating && styles.buttonDisabled]}
        onPress={onCreateGame}
        disabled={isCreating}
        activeOpacity={0.7}
      >
        {isCreating ? (
          <>
            <ActivityIndicator size="small" color="#666666" style={styles.spinner} />
            <Text style={styles.buttonText}>Creating...</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Create New Game</Text>
        )}
      </TouchableOpacity>
    </LobbyCard>
  );
};

const styles = StyleSheet.create({
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

export default CreateGameForm;