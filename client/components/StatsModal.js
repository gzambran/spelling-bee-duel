import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';

import { usePersonalStats } from '../hooks/usePersonalStats';
import PersonalStatsCard from './PersonalStatsCard';
import HeadToHeadList from './HeadToHeadList';

const StatsModal = ({ visible, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Use the personal stats hook
  const {
    personalStats,
    headToHeadStats,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refreshStats,
    retryFetch,
    hasPlayedGames,
    getSummaryStats,
    isDataStale,
    hasData,
    isEmpty
  } = usePersonalStats(user);

  // Animate modal entrance
  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  // Tab configuration
  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'matchups', label: 'Matchups' }
  ];

  const renderTabButton = (tab) => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tab.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📊</Text>
      <Text style={styles.emptyStateTitle}>No Games Played Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Play your first game to start tracking your statistics!
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Failed to Load Stats</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#E8B94E" />
      <Text style={styles.loadingText}>Loading your stats...</Text>
    </View>
  );

  const renderPersonalTab = () => {
    if (!hasData && isLoading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (isEmpty) {
      return renderEmptyState();
    }

    return (
      <View style={styles.statsContent}>
        <PersonalStatsCard 
          stats={personalStats}
          isRefreshing={isRefreshing}
          onRefresh={refreshStats}
          lastUpdated={lastUpdated}
          isDataStale={isDataStale}
        />
      </View>
    );
  };

  const renderMatchupsTab = () => {
    if (!hasData && isLoading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (isEmpty || headToHeadStats.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🤝</Text>
          <Text style={styles.emptyStateTitle}>No Matchup History</Text>
          <Text style={styles.emptyStateMessage}>
            Play games against other players to see your head-to-head records here.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <HeadToHeadList 
          matchups={headToHeadStats}
          isRefreshing={isRefreshing}
          onRefresh={refreshStats}
        />
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalTab();
      case 'matchups':
        return renderMatchupsTab();
      default:
        return renderPersonalTab();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[styles.modalContainer, { opacity: fadeAnim }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.headerText}>Your Stats</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {tabs.map(renderTabButton)}
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {renderTabContent()}
          </View>

          {/* Footer */}
          {lastUpdated && !isLoading && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                {isDataStale && (
                  <Text style={styles.staleIndicator}> • Data may be outdated</Text>
                )}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFBF2',
    borderRadius: 20,
    width: '100%',
    height: '90%',
    borderWidth: 2,
    borderColor: '#E8B94E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8B94E',
    backgroundColor: '#FFC543',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  headerTitle: {
    flex: 1,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  headerSubtext: {
    fontSize: 16,
    color: '#666666',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#2E2E2E',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F0E8',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#FFC543',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#2E2E2E',
  },
  contentContainer: {
    flex: 1,
  },
  statsContent: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CC4125',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFC543',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8B94E',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8B94E',
    backgroundColor: '#F5F0E8',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  staleIndicator: {
    color: '#CC4125',
    fontWeight: '500',
  },
});

export default StatsModal;