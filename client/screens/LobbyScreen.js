import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// Import our custom hooks and components
import { useLobbyForm } from '../hooks/useLobbyForm';
import SharedNameInput from '../components/SharedNameInput';
import CreateGameForm from '../components/CreateGameForm';
import JoinGameForm from '../components/JoinGameForm';
import TopMenu from '../components/TopMenu';
import WaitingRoom from '../components/WaitingRoom';

const LobbyScreen = ({
  onCreateRoom,
  onJoinRoom,
  onPlayerReady,
  gameState,
  roomCode,
  playerName,
  isConnected,
}) => {
  // Initialize form logic
  const {
    playerNameInput,
    setPlayerNameInput,
    inputRoomCode,
    updateRoomCode,
    isCreating,
    isJoining,
    handleCreateGame,
    handleJoinGame,
  } = useLobbyForm(playerName || '');

  // Handle keyboard submission from name input
  const handleNameSubmit = () => {
    // Focus logic could be added here in the future
    // For now, just continue with the current flow
  };

  // If in a game, show waiting room
  if (gameState && roomCode) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <WaitingRoom
            gameState={gameState}
            roomCode={roomCode}
            playerName={playerName}
            onPlayerReady={onPlayerReady}
          />
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
      {/* Top Menu */}
      <TopMenu />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Shared Name Input */}
        <SharedNameInput
          playerNameInput={playerNameInput}
          setPlayerNameInput={setPlayerNameInput}
          onSubmitEditing={handleNameSubmit}
        />

        {/* Create Game Form */}
        <CreateGameForm
          isCreating={isCreating}
          onCreateGame={() => handleCreateGame(onCreateRoom)}
        />

        {/* OR Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Join Game Form */}
        <JoinGameForm
          inputRoomCode={inputRoomCode}
          updateRoomCode={updateRoomCode}
          isJoining={isJoining}
          onJoinGame={() => handleJoinGame(onJoinRoom)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC543',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6C200',
  },
  dividerText: {
    marginHorizontal: 20,
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '600',
    backgroundColor: '#FFC543',
    paddingHorizontal: 8,
  },
});

export default LobbyScreen;