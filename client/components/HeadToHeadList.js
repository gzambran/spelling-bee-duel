import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';

const HeadToHeadList = ({ matchups, isRefreshing, onRefresh }) => {
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🤝</Text>
      <Text style={styles.emptyTitle}>No Matchup History</Text>
      <Text style={styles.emptyMessage}>
        Play games against other players to see your head-to-head records here.
      </Text>
    </View>
  );

  if (!matchups || matchups.length === 0) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#E8B94E']}
            tintColor="#E8B94E"
          />
        }
      >
        {renderEmptyState()}
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#E8B94E']}
          tintColor="#E8B94E"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {matchups.map((matchup, index) => (
        <View key={index} style={styles.matchupCard}>
          <Text style={styles.opponentName}>{matchup.opponentName}</Text>
          
          <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>Win-Loss Record:</Text>
            <Text style={styles.recordValue}>{matchup.record}</Text>
          </View>

          <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>Last Played:</Text>
            <Text style={styles.recordValue}>{matchup.formattedLastPlayed}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  matchupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  opponentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 12,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  recordLabel: {
    fontSize: 16,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  recordValue: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: 'bold',
  },
});

export default HeadToHeadList;