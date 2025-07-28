import { View, Text, StyleSheet, Animated } from 'react-native';

const ResultsHeader = ({ 
  roundResults, 
  isCurrentRoundWinner, 
  isRoundTie, 
  opponentName, 
  slideAnim 
}) => {
  return (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: slideAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          }],
        },
      ]}
    >
      <Text style={styles.roundTitle}>
        Round {roundResults.round} Results
      </Text>
      
      {isRoundTie ? (
        <Text style={styles.tieText}>It's a tie!</Text>
      ) : (
        <Text style={styles.winnerText}>
          {isCurrentRoundWinner ? 'You won this round!' : `${opponentName} won this round!`}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  roundTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513', 
  },
  tieText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D9A93D',
  },
});

export default ResultsHeader;