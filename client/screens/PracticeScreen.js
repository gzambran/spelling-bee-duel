import { SafeAreaView, StyleSheet } from 'react-native';
import { usePractice } from '../hooks/usePractice';
import CountdownScreen from './CountdownScreen';
import PracticeReady from '../components/PracticeReady';
import PracticeGame from '../components/PracticeGame';
import PracticeResults from '../components/PracticeResults';

const PracticeScreen = ({ onBackToLobby }) => {
  const practiceState = usePractice();
  const { gameState, countdown } = practiceState;

  const renderCurrentState = () => {
    switch (gameState) {
      case 'ready':
        return (
          <PracticeReady
            onStartPractice={practiceState.startPractice}
            onBackToLobby={onBackToLobby}
          />
        );
      
      case 'countdown':
        return (
          <CountdownScreen
            countdown={countdown}
            nextRound={1}
            isPracticeMode={true}
          />
        );
      
      case 'playing':
        return (
          <PracticeGame
            practiceState={practiceState}
            onBackToLobby={onBackToLobby}
          />
        );
      
      case 'finished':
        return (
          <PracticeResults
            practiceState={practiceState}
            onBackToLobby={onBackToLobby}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderCurrentState()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default PracticeScreen;