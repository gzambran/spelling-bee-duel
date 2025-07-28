const dbManager = require('../database/index');

class StatsService {
  constructor() {
    this.TOTAL_ROUNDS = 3;
  }

  /**
   * Update stats when a round completes
   * @param {number} gameId - Database ID of the game record
   * @param {number} roundNumber - Current round number (1-3)
   * @param {Object} playerData - Player's round data
   * @param {number} playerData.playerId - Player's user ID
   * @param {number} playerData.roundScore - Score for this round
   * @param {Array} playerData.words - Words found this round
   * @param {number} playerData.pangramsFound - Number of pangrams found
   * @returns {Object} - Personal records broken in this round
   */
  async updateRoundStats(gameId, roundNumber, playerData) {
    try {
      const { playerId, roundScore, words, pangramsFound } = playerData;
      
      console.log(`📊 Updating round ${roundNumber} stats for player ${playerId}: ${roundScore} points`);

      // Record detailed round data
      dbManager.recordRoundData(gameId, roundNumber, playerId, roundScore, words, pangramsFound);

      // Check for personal round record
      const currentStats = dbManager.getPersonalStats(playerId);
      const personalRecords = [];

      if (!currentStats || roundScore > (currentStats.best_round_score || 0)) {
        // Update personal best round
        const updateStmt = dbManager.db.prepare(`
          UPDATE user_stats 
          SET best_round_score = ?, best_round_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `);
        updateStmt.run([roundScore, playerId]);
        updateStmt.free();
        dbManager.saveDatabase();

        personalRecords.push({
          type: 'personal_round',
          score: roundScore,
          previousRecord: currentStats?.best_round_score || 0
        });

        console.log(`🎉 Personal round record for player ${playerId}: ${roundScore} points`);
      }

      // Check for global records
      const globalRecords = dbManager.checkGlobalRecords(playerId, gameId, roundScore, null, roundNumber);

      return {
        personalRecords,
        globalRecords,
        roundData: {
          score: roundScore,
          words: words.length,
          pangrams: pangramsFound
        }
      };
    } catch (error) {
      console.error('❌ Error updating round stats:', error.message);
      throw error;
    }
  }

  /**
   * Complete game stats after all rounds finish
   * @param {number} gameId - Database ID of the game record
   * @param {Object} player1Data - Player 1's complete game data
   * @param {Object} player2Data - Player 2's complete game data
   * @param {Object} gameResult - Final game result
   * @returns {Object} - All records broken and head-to-head update
   */
  async completeGameStats(gameId, player1Data, player2Data, gameResult) {
    try {
      console.log(`🏁 Completing game stats for game ${gameId}`);

      const allRecords = {
        player1: { personalRecords: [], globalRecords: [] },
        player2: { personalRecords: [], globalRecords: [] }
      };

      // Update stats for both players
      for (const playerData of [player1Data, player2Data]) {
        const { playerId, totalScore, gameOutcome } = playerData;
        const playerKey = playerData === player1Data ? 'player1' : 'player2';

        // Update basic game stats
        await this.updatePlayerGameStats(playerId, gameOutcome);

        // Check for personal game record
        const currentStats = dbManager.getPersonalStats(playerId);
        if (!currentStats || totalScore > (currentStats.best_game_score || 0)) {
          const updateStmt = dbManager.db.prepare(`
            UPDATE user_stats 
            SET best_game_score = ?, best_game_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `);
          updateStmt.run([totalScore, playerId]);
          updateStmt.free();
          dbManager.saveDatabase();

          allRecords[playerKey].personalRecords.push({
            type: 'personal_game',
            score: totalScore,
            previousRecord: currentStats?.best_game_score || 0
          });

          console.log(`🎉 Personal game record for player ${playerId}: ${totalScore} points`);
        }

        // Check for global game records
        const globalRecords = dbManager.checkGlobalRecords(playerId, gameId, null, totalScore);
        allRecords[playerKey].globalRecords = globalRecords;
      }

      // Update head-to-head records
      this.updateHeadToHeadStats(player1Data.playerId, player2Data.playerId, gameResult.winnerId);

      console.log(`✅ Game stats completed for game ${gameId}`);
      return allRecords;
    } catch (error) {
      console.error('❌ Error completing game stats:', error.message);
      throw error;
    }
  }

  /**
   * Update individual player's game statistics
   * @param {number} playerId - Player's user ID
   * @param {string} gameOutcome - 'win', 'loss', or 'tie'
   */
  async updatePlayerGameStats(playerId, gameOutcome) {
    try {
      let updateSql;
      switch (gameOutcome) {
        case 'win':
          updateSql = `
            UPDATE user_stats 
            SET total_games = total_games + 1, games_won = games_won + 1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `;
          break;
        case 'loss':
          updateSql = `
            UPDATE user_stats 
            SET total_games = total_games + 1, games_lost = games_lost + 1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `;
          break;
        case 'tie':
          updateSql = `
            UPDATE user_stats 
            SET total_games = total_games + 1, games_tied = games_tied + 1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `;
          break;
        default:
          throw new Error(`Invalid game outcome: ${gameOutcome}`);
      }

      const updateStmt = dbManager.db.prepare(updateSql);
      updateStmt.run([playerId]);
      updateStmt.free();
      dbManager.saveDatabase();

      console.log(`📈 Player ${playerId} stats updated: ${gameOutcome}`);
    } catch (error) {
      console.error('❌ Error updating player game stats:', error.message);
      throw error;
    }
  }

  /**
   * Update head-to-head statistics between two players
   * @param {number} player1Id - First player's user ID
   * @param {number} player2Id - Second player's user ID
   * @param {number|null} winnerId - ID of winning player, or null for tie
   */
  updateHeadToHeadStats(player1Id, player2Id, winnerId) {
    try {
      dbManager.updateHeadToHead(player1Id, player2Id, winnerId);
      console.log(`🤝 Head-to-head updated: ${player1Id} vs ${player2Id}`);
    } catch (error) {
      console.error('❌ Error updating head-to-head stats:', error.message);
      throw error;
    }
  }

  /**
   * Get complete personal statistics for a user
   * @param {number} userId - User's ID
   * @returns {Object} - Complete personal stats with formatted data
   */
  getUserPersonalStats(userId) {
    try {
      const stats = dbManager.getPersonalStats(userId);
      
      if (!stats) {
        return {
          totalGames: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winRate: 0,
          bestRound: { score: 0, date: null },
          bestGame: { score: 0, date: null }
        };
      }

      return {
        totalGames: stats.total_games || 0,
        wins: stats.games_won || 0,
        losses: stats.games_lost || 0,
        ties: stats.games_tied || 0,
        winRate: stats.win_rate || 0,
        bestRound: {
          score: stats.best_round_score || 0,
          date: stats.best_round_date
        },
        bestGame: {
          score: stats.best_game_score || 0,
          date: stats.best_game_date
        }
      };
    } catch (error) {
      console.error('❌ Error getting personal stats:', error.message);
      return null;
    }
  }

  /**
   * Get head-to-head records for a user against all opponents
   * @param {number} userId - User's ID
   * @returns {Array} - Array of head-to-head records
   */
  getHeadToHeadStats(userId) {
    try {
      const records = dbManager.getHeadToHeadStats(userId);
      
      return records.map(record => ({
        opponentName: record.opponent_name,
        wins: record.my_wins || 0,
        losses: record.my_losses || 0,
        ties: record.ties || 0,
        totalGames: (record.my_wins || 0) + (record.my_losses || 0) + (record.ties || 0),
        lastPlayed: record.last_played,
        winRate: record.my_wins + record.my_losses > 0 
          ? Math.round((record.my_wins / (record.my_wins + record.my_losses)) * 100)
          : 0
      }));
    } catch (error) {
      console.error('❌ Error getting head-to-head stats:', error.message);
      return [];
    }
  }

  /**
   * Check what records would be broken by given scores
   * @param {number} userId - User's ID
   * @param {number} roundScore - Proposed round score
   * @param {number} gameScore - Proposed game score
   * @returns {Object} - Records that would be broken
   */
  checkForRecords(userId, roundScore, gameScore) {
    try {
      const currentStats = dbManager.getPersonalStats(userId);
      const recordsToBreak = {
        personalRound: false,
        personalGame: false,
        globalRound: false,
        globalGame: false
      };

      // Check personal records
      if (!currentStats || roundScore > (currentStats.best_round_score || 0)) {
        recordsToBreak.personalRound = true;
      }
      
      if (!currentStats || gameScore > (currentStats.best_game_score || 0)) {
        recordsToBreak.personalGame = true;
      }

      // Check global records
      const roundCheckStmt = dbManager.db.prepare(`
        SELECT MAX(score) as max_score FROM global_records 
        WHERE record_type = 'best_round'
      `);
      roundCheckStmt.step();
      const roundResult = roundCheckStmt.getAsObject();
      const currentRoundRecord = roundResult.max_score || 0;
      roundCheckStmt.free();

      if (roundScore > currentRoundRecord) {
        recordsToBreak.globalRound = true;
      }

      const gameCheckStmt = dbManager.db.prepare(`
        SELECT MAX(score) as max_score FROM global_records 
        WHERE record_type = 'best_game'
      `);
      gameCheckStmt.step();
      const gameResult = gameCheckStmt.getAsObject();
      const currentGameRecord = gameResult.max_score || 0;
      gameCheckStmt.free();

      if (gameScore > currentGameRecord) {
        recordsToBreak.globalGame = true;
      }

      return recordsToBreak;
    } catch (error) {
      console.error('❌ Error checking for records:', error.message);
      return {
        personalRound: false,
        personalGame: false,
        globalRound: false,
        globalGame: false
      };
    }
  }

  /**
   * Helper method to determine game outcome for a player
   * @param {number} playerId - Player's user ID
   * @param {number} playerScore - Player's total score
   * @param {number} opponentScore - Opponent's total score
   * @returns {string} - 'win', 'loss', or 'tie'
   */
  determineGameOutcome(playerId, playerScore, opponentScore) {
    if (playerScore > opponentScore) {
      return 'win';
    } else if (playerScore < opponentScore) {
      return 'loss';
    } else {
      return 'tie';
    }
  }

  /**
   * Format date for display in UI
   * @param {string} dateString - ISO date string from database
   * @returns {string} - Formatted date string
   */
  formatAchievementDate(dateString) {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error.message);
      return dateString;
    }
  }

  /**
   * Get comprehensive stats summary for a user (for API endpoints)
   * @param {number} userId - User's ID
   * @returns {Object} - Complete stats package
   */
  getCompleteStatsFor(userId) {
    try {
      const user = dbManager.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const personalStats = this.getUserPersonalStats(userId);
      const headToHeadStats = this.getHeadToHeadStats(userId);

      return {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name
        },
        personal: personalStats,
        headToHead: headToHeadStats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting complete stats:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const statsService = new StatsService();

module.exports = statsService;