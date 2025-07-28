import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';

const AboutModal = ({ visible, onClose }) => {
  const [puzzleStats, setPuzzleStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // Get version from app.json dynamically
  const appVersion = Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0';

  // Get server URL - use the same URL as the socket service
  const getServerUrl = () => {
    return 'https://duel.zambrano.nyc';
  };

  // Fetch puzzle statistics when modal opens
  const fetchPuzzleStats = async () => {
    if (puzzleStats) return; // Already loaded
    
    setIsLoadingStats(true);
    setStatsError(null);
    
    try {
      const response = await fetch(`${getServerUrl()}/api/puzzle-stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setPuzzleStats(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching puzzle stats:', error);
      setStatsError(error.message);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch stats when modal becomes visible
  const handleModalShow = () => {
    if (visible) {
      fetchPuzzleStats();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleModalShow}
    >
      <View style={styles.fullModalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>About</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* App Info Section */}
            <View style={styles.aboutSection}>
              <Text style={styles.appName}>Spelling Bee Duel</Text>
              <Text style={styles.version}>Version {appVersion}</Text>
            </View>

            {/* Puzzle Database Section */}
            <View style={styles.aboutSection}>
              <Text style={styles.sectionTitle}>Puzzle Database</Text>
              
              {isLoadingStats ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#E6C200" />
                  <Text style={styles.loadingText}>Loading puzzle data...</Text>
                </View>
              ) : statsError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Unable to load puzzle statistics</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchPuzzleStats}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : puzzleStats ? (
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🧩</Text>
                    <Text style={styles.statText}>
                      {puzzleStats.totalPuzzles.toLocaleString()} puzzles available
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>📅</Text>
                    <Text style={styles.statText}>
                      {puzzleStats.dateRange}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Game Description */}
            <View style={styles.aboutSection}>
              <Text style={styles.aboutText}>
                A head-to-head word game featuring real New York Times Spelling Bee puzzles. Challenge a friend to find words using 7 letters in fast-paced 90-second rounds!
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
  aboutSection: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#CC0000',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E6C200',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  statText: {
    fontSize: 16,
    color: '#555555',
  },
  aboutText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default AboutModal;