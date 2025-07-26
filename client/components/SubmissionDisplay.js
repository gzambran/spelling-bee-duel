import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SubmissionDisplay = ({ submissionDisplay, fadeAnim, scaleAnim }) => {
  // Handle animations in useEffect to avoid render cycle conflicts
  useEffect(() => {
    if (submissionDisplay && submissionDisplay.message) {
      // Start entrance animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);

      Animated.parallel([
        // Quick fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        // Bounce scale animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      ]).start();
    }
  }, [submissionDisplay, fadeAnim, scaleAnim]);

  // Only show notification, not word (word is handled by GameScreen)
  if (!submissionDisplay || !submissionDisplay.message) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.messageBox,
          {
            backgroundColor: 
              submissionDisplay.messageType === 'pangram' ? '#D9A93D' : // Warm gold for pangrams
              submissionDisplay.messageType === 'success' ? '#8B4513' : // Warm brown for success
              '#B8860B', // Darker gold for errors
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.messageText}>{submissionDisplay.message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
  },
  messageBox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFBF2',
    textAlign: 'center',
  },
});

export default SubmissionDisplay;