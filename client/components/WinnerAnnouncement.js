import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Import the images
const happyImage = require('../assets/images/happy.png');
const sadImage = require('../assets/images/sad.png');

const WinnerAnnouncement = ({ finalResults, playerName }) => {
  if (!finalResults) {
    return null;
  }

  const isWinner = finalResults.winner?.name === playerName;
  const isTie = finalResults.isTie;

  return (
    <View style={styles.container}>
      <Text style={styles.gameOverText}>Game Over!</Text>
      
      {isTie ? (
        <View style={styles.tieContainer}>
          <Text style={styles.tieText}>🤝 It's a Tie! 🤝</Text>
          <Text style={styles.tieSubtext}>
            Both players scored {finalResults.finalScores?.[0]?.totalScore || 0} points
          </Text>
        </View>
      ) : (
        <View style={styles.winnerContainer}>
          {/* Happy/Sad Image based on win/loss */}
          <Image 
            source={isWinner ? happyImage : sadImage}
            style={styles.resultImage}
            resizeMode="contain"
          />
          
          <Text style={[
            styles.winnerText,
            { color: isWinner ? '#4CAF50' : '#F44336' }
          ]}>
            {isWinner ? '🎉 You Won! 🎉' : `${finalResults.winner?.name} Wins!`}
          </Text>
          <Text style={styles.winnerSubtext}>
            {finalResults.winner?.totalScore || 0} points • {finalResults.winner?.totalWords || 0} words
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 20,
  },
  winnerContainer: {
    alignItems: 'center',
  },
  resultImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  winnerSubtext: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  tieContainer: {
    alignItems: 'center',
  },
  tieText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 12,
  },
  tieSubtext: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
});

export default WinnerAnnouncement;