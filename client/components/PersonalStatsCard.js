import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const PersonalStatsCard = ({ stats }) => {
  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No stats available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Best Scores Row - Side by Side */}
      <View style={styles.bestScoresRow}>
        {/* Personal Best Round */}
        <View style={styles.halfCard}>
          <Text style={styles.statTitle}>Best Round</Text>
          <Text style={styles.statScore}>
            {stats.bestRound.score} points
          </Text>
          <Text style={styles.statDate}>
            {stats.bestRound.score > 0 
              ? `${stats.bestRound.formattedDate}`
              : 'No record yet'
            }
          </Text>
        </View>

        {/* Personal Best Game */}
        <View style={styles.halfCard}>
          <Text style={styles.statTitle}>Best Game</Text>
          <Text style={styles.statScore}>
            {stats.bestGame.score} points
          </Text>
          <Text style={styles.statDate}>
            {stats.bestGame.score > 0 
              ? `${stats.bestGame.formattedDate}`
              : 'No record yet'
            }
          </Text>
        </View>
      </View>

      {/* Game Statistics */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Game Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Games:</Text>
            <Text style={styles.statValue}>{stats.totalGames}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Wins:</Text>
            <Text style={[styles.statValue, styles.winValue]}>{stats.wins}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Losses:</Text>
            <Text style={[styles.statValue, styles.lossValue]}>{stats.losses}</Text>
          </View>

          {stats.ties > 0 && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Ties:</Text>
              <Text style={styles.statValue}>{stats.ties}</Text>
            </View>
          )}

          <View style={[styles.statRow, styles.winRateRow]}>
            <Text style={styles.statLabel}>Win Rate:</Text>
            <Text style={[styles.statValue, styles.winRateValue]}>{stats.winRate}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 50,
  },
  bestScoresRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  statScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E8B94E',
    marginBottom: 4,
    textAlign: 'center',
  },
  statDate: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsGrid: {
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  winRateRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#E8B94E',
    fontWeight: 'bold',
  },
  winValue: {
    color: '#4CAF50',
  },
  lossValue: {
    color: '#F44336',
  },
  winRateValue: {
    fontSize: 18,
    color: '#FFC543',
  },
});

export default PersonalStatsCard;