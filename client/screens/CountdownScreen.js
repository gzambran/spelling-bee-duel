import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

const CountdownScreen = ({ countdown, nextRound, isPracticeMode = false }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate countdown number
  useEffect(() => {
    // Reset and animate the countdown number
    scaleAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [countdown, scaleAnim]);

  // Fade in the screen on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Choose styles based on practice mode
  const containerStyle = isPracticeMode ? styles.practiceContainer : styles.container;
  const roundCardStyle = isPracticeMode ? styles.practiceRoundCard : styles.roundCard;
  const readyTextStyle = isPracticeMode ? styles.practiceReadyText : styles.readyText;

  return (
    <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={roundCardStyle}>
          <Text style={styles.roundText}>
            {isPracticeMode ? 'Practice Mode' : `Round ${nextRound}`}
          </Text>
        </View>
        
        <Animated.Text 
          style={[
            styles.countdownText, 
            { 
              transform: [{ scale: scaleAnim }],
              color: '#2E2E2E'
            }
          ]}
        >
          {countdown > 0 ? countdown : 'GO!'}
        </Animated.Text>
        
        <Text style={readyTextStyle}>
          {countdown > 0 ? 'Get Ready!' : 'Start Finding Words!'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Regular game styles
  container: {
    flex: 1,
    backgroundColor: '#FFC543',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Practice mode styles
  practiceContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  // Regular round card
  roundCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 40,
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
  // Practice round card
  practiceRoundCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 40,
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
  roundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // Regular ready text
  readyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    backgroundColor: '#FFFBF2',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  // Practice ready text
  practiceReadyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default CountdownScreen;