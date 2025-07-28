import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ReadyStatus = ({ 
  currentGamePlayer, 
  opponentName, 
  opponentGamePlayer, 
  gameState, 
  readyPressed, 
  onNextRound 
}) => {
  const handleNextRound = async () => {
    try {
      await onNextRound();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <>
      {/* Ready Status */}
      <View style={styles.readySection}>
        {currentGamePlayer?.ready && (
          <Text style={styles.readyStatus}>
            ✅ You're ready! Waiting for {opponentName}...
          </Text>
        )}
        
        {opponentGamePlayer?.ready && !currentGamePlayer?.ready && (
          <Text style={styles.readyStatus}>
            {opponentName} is ready!
          </Text>
        )}
      </View>

      {/* Next Round Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextRoundButton,
            (readyPressed || currentGamePlayer?.ready) && styles.disabledButton
          ]}
          onPress={handleNextRound}
          disabled={readyPressed || currentGamePlayer?.ready}
        >
          <Text style={styles.nextRoundButtonText}>
            {gameState.currentRound >= gameState.totalRounds 
              ? 'Ready for Final Results'
              : `Ready for Round ${gameState.currentRound + 1}`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  readySection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  readyStatus: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  nextRoundButton: {
    backgroundColor: '#FFFBF2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9A93D',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextRoundButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E8B94E',
    borderColor: '#D9A93D',
  },
});

export default ReadyStatus;