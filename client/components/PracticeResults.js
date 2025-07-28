import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const PracticeResults = ({ practiceState, onBackToLobby }) => {
  const { foundWords, currentScore, startPractice } = practiceState;
  
  const wordsFound = foundWords.length;
  const pangramsFound = foundWords.filter(w => w.isPangram).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Practice Complete!</Text>
      
      <View style={styles.scoreCard}>
        <Text style={styles.scoreText}>{currentScore} Points</Text>
        <Text style={styles.statsText}>
          {wordsFound} words found
          {pangramsFound > 0 && ` • ${pangramsFound} pangram${pangramsFound > 1 ? 's' : ''}`}
        </Text>
      </View>

      <View style={styles.wordsResults}>
        <Text style={styles.wordsTitle}>Your Words</Text>
        <ScrollView style={styles.wordsList}>
          {foundWords
            .sort((a, b) => b.points - a.points)
            .map((wordEntry, index) => (
              <View key={index} style={styles.wordItem}>
                <Text style={[
                  styles.wordText,
                  wordEntry.isPangram && styles.pangramWord
                ]}>
                  {wordEntry.word.toUpperCase()}
                </Text>
                <Text style={styles.wordPoints}>
                  {wordEntry.points}{wordEntry.isPangram ? ' ★' : ''}
                </Text>
              </View>
            ))}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={startPractice}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next Puzzle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToLobby}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 16,
    color: '#666666',
  },
  wordsResults: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 300,
  },
  wordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  wordsList: {
    maxHeight: 200,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  wordText: {
    fontSize: 14,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  pangramWord: {
    color: '#D9A93D',
    fontWeight: 'bold',
  },
  wordPoints: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
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
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
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

export default PracticeResults;