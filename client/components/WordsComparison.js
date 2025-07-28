import { View, Text, StyleSheet, ScrollView } from 'react-native';

const WordColumn = ({ title, words, opponentWords, getSortedWords }) => {
  return (
    <View style={styles.wordColumn}>
      <Text style={styles.columnTitle}>{title}</Text>
      <ScrollView style={styles.wordsList}>
        {getSortedWords(words).map((wordEntry, index) => {
          const opponentFoundIt = opponentWords.some(w => 
            w.word.toLowerCase() === wordEntry.word.toLowerCase()
          );
          
          return (
            <View key={index} style={[
              styles.wordItem,
              !opponentFoundIt && styles.uniqueWordItem
            ]}>
              <Text style={[
                styles.wordText,
                wordEntry.isPangram && styles.pangramWord,
                !opponentFoundIt && styles.uniqueWordText
              ]}>
                {wordEntry.word.toUpperCase()}
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={[
                  styles.wordPoints,
                  wordEntry.isPangram && styles.pangramPoints,
                  !opponentFoundIt && styles.uniqueWordPoints
                ]}>
                  {wordEntry.points}
                </Text>
                {wordEntry.isPangram && (
                  <Text style={styles.pangramStar}>★</Text>
                )}
              </View>
            </View>
          );
        })}
        
        {words.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No words found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const WordsComparison = ({ 
  currentPlayerData, 
  opponentData, 
  getSortedWords 
}) => {
  // Calculate round totals for display
  const currentPlayerTotal = currentPlayerData?.roundScore || 0;
  const opponentTotal = opponentData?.roundScore || 0;

  return (
    <View style={styles.wordsContainer}>
      <WordColumn
        title={`Your Words (${currentPlayerData.wordCount || 0})`}
        words={currentPlayerData.words || []}
        opponentWords={opponentData.words || []}
        getSortedWords={getSortedWords}
      />
      
      <WordColumn
        title={`${opponentData.name}'s Words (${opponentData.wordCount || 0})`}
        words={opponentData.words || []}
        opponentWords={currentPlayerData.words || []}
        getSortedWords={getSortedWords}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wordsContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  wordColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  wordsList: {
    maxHeight: 300,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFBF2',
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E8B94E',
    minHeight: 40,
  },
  uniqueWordItem: {
    backgroundColor: '#FFFBF2',
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  wordText: {
    fontSize: 15,
    color: '#2E2E2E',
    fontWeight: '500',
    flex: 1,
  },
  uniqueWordText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  pangramWord: {
    color: '#D9A93D',
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  wordPoints: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '700',
    minWidth: 25,
    textAlign: 'right',
  },
  uniqueWordPoints: {
    color: '#8B4513',
    fontWeight: '800',
  },
  pangramPoints: {
    color: '#D9A93D',
    fontWeight: '800',
  },
  pangramStar: {
    fontSize: 14,
    color: '#D9A93D',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});

export default WordsComparison;