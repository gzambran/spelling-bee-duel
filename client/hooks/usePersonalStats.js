import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

export const usePersonalStats = (user) => {
  // State for personal statistics
  const [personalStats, setPersonalStats] = useState(null);
  const [headToHeadStats, setHeadToHeadStats] = useState([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Auto-refresh management
  const retryTimeoutRef = useRef(null);

  // Helper function to format achievement dates
  const formatAchievementDate = useCallback((dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      
      // Use date only, no time
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error.message);
      return 'Unknown';
    }
  }, []);

  // Fetch personal statistics
  const fetchPersonalStats = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      console.warn('⚠️ No user ID provided for personal stats');
      return;
    }

    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      console.log(`📊 Fetching personal stats for user ${user.id}`);
      const stats = await socketService.fetchPersonalStats(user.id);
      
      // Format the stats for UI consumption
      const formattedStats = {
        totalGames: stats.totalGames || 0,
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        ties: stats.ties || 0,
        winRate: stats.winRate || 0,
        bestRound: {
          score: stats.bestRound?.score || 0,
          date: stats.bestRound?.date,
          formattedDate: formatAchievementDate(stats.bestRound?.date)
        },
        bestGame: {
          score: stats.bestGame?.score || 0,
          date: stats.bestGame?.date,
          formattedDate: formatAchievementDate(stats.bestGame?.date)
        }
      };

      setPersonalStats(formattedStats);
      
      console.log('✅ Personal stats updated:', formattedStats);
    } catch (error) {
      console.error('❌ Error fetching personal stats:', error.message);
      setError(`Failed to load personal stats: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, formatAchievementDate]);

  // Fetch head-to-head statistics
  const fetchHeadToHeadStats = useCallback(async () => {
    if (!user?.id) {
      console.warn('⚠️ No user ID provided for head-to-head stats');
      return;
    }

    try {
      console.log(`🤝 Fetching head-to-head stats for user ${user.id}`);
      const stats = await socketService.fetchHeadToHeadStats(user.id);
      
      // Format the stats for UI consumption
      const formattedStats = stats.map(record => ({
        opponentName: record.opponentName,
        wins: record.wins || 0,
        losses: record.losses || 0,
        ties: record.ties || 0,
        totalGames: record.totalGames || 0,
        winRate: record.winRate || 0,
        lastPlayed: record.lastPlayed,
        formattedLastPlayed: formatAchievementDate(record.lastPlayed),
        // Calculate win/loss ratio for display
        record: `${record.wins || 0}-${record.losses || 0}${record.ties ? `-${record.ties}` : ''}`
      }));

      // Sort by total games played (most active opponents first)
      formattedStats.sort((a, b) => b.totalGames - a.totalGames);
      
      setHeadToHeadStats(formattedStats);
      console.log(`✅ Head-to-head stats updated: ${formattedStats.length} opponents`);
    } catch (error) {
      console.error('❌ Error fetching head-to-head stats:', error.message);
      // Don't set main error for head-to-head failures - these are supplementary
    }
  }, [user?.id, formatAchievementDate]);

  // Fetch all stats data
  const fetchAllStats = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setError('No user data available');
      return;
    }

    try {
      // Fetch all stats in parallel
      await Promise.all([
        fetchPersonalStats(showLoading),
        fetchHeadToHeadStats()
      ]);
    } catch (error) {
      console.error('❌ Error fetching all stats:', error.message);
      setError(`Failed to load stats: ${error.message}`);
    }
  }, [user?.id, fetchPersonalStats, fetchHeadToHeadStats]);

  // Refresh stats (with visual feedback)
  const refreshStats = useCallback(async () => {
    console.log('🔄 Refreshing stats...');
    await fetchAllStats(false); // Don't show main loading spinner
  }, [fetchAllStats]);

  // Retry failed requests
  const retryFetch = useCallback(() => {
    console.log('🔄 Retrying stats fetch...');
    setError(null);
    fetchAllStats(true);
  }, [fetchAllStats]);

  // Set up cache invalidation
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Auto-fetch stats when user changes
  useEffect(() => {
    if (user?.id) {
      console.log(`👤 User changed, fetching stats for: ${user.displayName} (ID: ${user.id})`);
      fetchAllStats(true);
    } else {
      // Clear stats when no user
      setPersonalStats(null);
      setHeadToHeadStats([]);
      setError(null);
    }
  }, [user?.id, user?.displayName, fetchAllStats]);

  // Listen for game completion events to auto-refresh stats
  useEffect(() => {
    const handleGameCompleted = () => {
      console.log('🎯 Game completed, refreshing stats in 2 seconds...');
      // Delay refresh to allow server processing
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      retryTimeoutRef.current = setTimeout(() => {
        refreshStats();
      }, 2000);
    };

    // Listen for final results (game completion)
    socketService.on('show-final-results', handleGameCompleted);

    return () => {
      socketService.off('show-final-results', handleGameCompleted);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [refreshStats]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to get win percentage formatted for display
  const getFormattedWinRate = useCallback(() => {
    if (!personalStats || personalStats.totalGames === 0) {
      return '0%';
    }
    return `${personalStats.winRate}%`;
  }, [personalStats]);

  // Helper function to check if user has any stats
  const hasPlayedGames = useCallback(() => {
    return personalStats && personalStats.totalGames > 0;
  }, [personalStats]);

  // Helper function to get summary stats for quick display
  const getSummaryStats = useCallback(() => {
    if (!personalStats) {
      return null;
    }

    return {
      gamesPlayed: personalStats.totalGames,
      winLossRecord: `${personalStats.wins}-${personalStats.losses}${personalStats.ties > 0 ? `-${personalStats.ties}` : ''}`,
      winRate: getFormattedWinRate(),
      bestRound: personalStats.bestRound.score,
      bestGame: personalStats.bestGame.score,
      hasAchievements: personalStats.bestRound.score > 0 || personalStats.bestGame.score > 0
    };
  }, [personalStats, getFormattedWinRate]);

  return {
    // Data
    personalStats,
    headToHeadStats,
    
    // State
    isLoading,
    isRefreshing,
    error,
    
    // Actions
    refreshStats,
    retryFetch,
    fetchAllStats,
    
    // Helpers
    formatAchievementDate,
    getFormattedWinRate,
    hasPlayedGames,
    getSummaryStats,
    
    // Computed values
    hasData: personalStats !== null,
    isEmpty: personalStats && personalStats.totalGames === 0,

    lastUpdated: personalStats ? new Date().toISOString() : null,
    isDataStale: false // Could implement actual staleness logic later
  };
};