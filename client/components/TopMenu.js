import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const TopMenu = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const insets = useSafeAreaInsets();

  // Get version from app.json dynamically
  const appVersion = Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0';

  const openAbout = () => {
    setIsMenuVisible(false);
    setShowAbout(true);
  };

  const openHowToPlay = () => {
    setIsMenuVisible(false);
    setShowHowToPlay(true);
  };

  return (
    <>
      {/* Menu Button */}
      <View style={[styles.menuContainer, { top: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={[styles.menuDropdown, { marginTop: insets.top + 60 }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={openHowToPlay}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>How to Play</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={openAbout}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>About</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* How to Play Modal */}
      <Modal
        visible={showHowToPlay}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHowToPlay(false)}
      >
        <View style={styles.fullModalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How to Play</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHowToPlay(false)}
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

      {/* About Modal */}
      <Modal
        visible={showAbout}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.fullModalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAbout(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.aboutSection}>
                <Text style={styles.appName}>Spelling Bee Duel</Text>
                <Text style={styles.version}>Version {appVersion}</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutText}>
                  A head-to-head word game inspired by the New York Times Spelling Bee.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutText}>
                  Challenge a friend to find words using 7 letters, with the center letter required in every word. Fast-paced rounds and exponential scoring make every letter count!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  menuDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
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
  aboutSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E6C200',
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default TopMenu;