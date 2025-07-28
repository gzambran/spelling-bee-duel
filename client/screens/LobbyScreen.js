import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';

import { useLobbyForm } from '../hooks/useLobbyForm';
import CreateGameForm from '../components/CreateGameForm';
import JoinGameForm from '../components/JoinGameForm';
import TopMenu from '../components/TopMenu';
import WaitingRoom from '../components/WaitingRoom';
import StatsModal from '../components/StatsModal';

const LobbyScreen = ({
  onCreateRoom,
  onJoinRoom,
  onPlayerReady,
  onSignOut,
  onStartPractice,
  onBackToLobby,
  gameState,
  roomCode,
  user,
}) => {
  // Stats modal state
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Initialize form logic
  const {
    inputRoomCode,
    updateRoomCode,
    isCreating,
    isJoining,
    handleCreateGame,
    handleJoinGame,
  } = useLobbyForm('');

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
            playerName={user.displayName}
            onPlayerReady={onPlayerReady}
            onBackToLobby={onBackToLobby}
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
      {/* Top Menu with Sign Out */}
      <TopMenu onSignOut={onSignOut} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.displayName}>{user.displayName}!</Text>
          
          {/* Stats Button */}
          <TouchableOpacity 
            style={styles.statsButton}
            onPress={() => setShowStatsModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.statsButtonText}>Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Create Game Form */}
        <CreateGameForm
          isCreating={isCreating}
          onCreateGame={() => handleCreateGame(onCreateRoom, user.displayName)}
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
          onJoinGame={() => handleJoinGame(onJoinRoom, user.displayName)}
        />

        {/* OR Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Practice Mode Button */}
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={onStartPractice}
          activeOpacity={0.8}
        >
          <Text style={styles.practiceButtonText}>Practice Mode</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Stats Modal */}
      <StatsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        user={user}
      />
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
    paddingTop: 120,
    paddingBottom: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    padding: 20,
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
  welcomeText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
  displayName: {
    fontSize: 24,
    color: '#2E2E2E',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsButton: {
    backgroundColor: '#E8B94E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D4A73A',
  },
  statsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
  practiceButton: {
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    padding: 16,
    marginTop: 0,
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
  practiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
});

export default LobbyScreen;