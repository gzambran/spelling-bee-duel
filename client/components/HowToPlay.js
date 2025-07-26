import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const HowToPlay = () => {
  const [showRules, setShowRules] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setShowRules(!showRules)}
      >
        <Text style={styles.title}>How to Play</Text>
        <Text style={styles.toggle}>
          {showRules ? '−' : '+'}
        </Text>
      </TouchableOpacity>
      
      {showRules && (
        <View style={styles.content}>
          <Text style={styles.rulesText}>
            • 3 rounds, 90 seconds each{'\n'}
            • Find words using the 7 letters{'\n'}
            • Center letter must be in every word{'\n'}
            • 4+ letters only{'\n'}
            • Longer words = more points{'\n'}
            • Use all 7 letters for pangram bonus!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  toggle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#326891',
    width: 30,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rulesText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default HowToPlay;