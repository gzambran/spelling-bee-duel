import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';

const HowToPlayModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.fullModalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>How to Play</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.ruleSection}>
              <Text style={styles.ruleTitle}>🎯 Objective</Text>
              <Text style={styles.ruleText}>
                Find as many words as possible using the 7 letters provided. The player with the highest total score after 3 rounds wins!
              </Text>
            </View>

            <View style={styles.ruleSection}>
              <Text style={styles.ruleTitle}>📝 Word Rules</Text>
              <Text style={styles.ruleText}>
                • Words must be at least 4 letters long{'\n'}
                • The center letter must be used in every word{'\n'}
                • Letters can be reused within words{'\n'}
                • Only dictionary words are accepted
              </Text>
            </View>

            <View style={styles.ruleSection}>
              <Text style={styles.ruleTitle}>🏆 Scoring</Text>
              <Text style={styles.ruleText}>
                • 4 letters = 4 points{'\n'}
                • 5 letters = 9 points{'\n'}
                • 6 letters = 16 points{'\n'}
                • 7+ letters = 25 points{'\n'}
                • Pangrams (all 7 letters) = +25 bonus points!
              </Text>
            </View>

            <View style={styles.ruleSection}>
              <Text style={styles.ruleTitle}>⏱️ Game Flow</Text>
              <Text style={styles.ruleText}>
                • 3 rounds of 90 seconds each{'\n'}
                • Both players get the same letters{'\n'}
                • Words are revealed after each round{'\n'}
                • Highest total score wins the game
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6C200',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 24,
  },
  ruleSection: {
    marginBottom: 24,
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
  },
});

export default HowToPlayModal;