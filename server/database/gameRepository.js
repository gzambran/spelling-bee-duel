class GameRepository {
  constructor(db, saveCallback) {
    this.db = db;
    this.save = saveCallback;
  }

  // Game record methods
  recordGameResult(gameData) {
    const stmt = this.db.prepare(`
      INSERT INTO game_records (room_code, player1_id, player2_id, winner_id, player1_score, player2_score, player1_name, player2_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      gameData.roomCode,
      gameData.player1Id,
      gameData.player2Id,
      gameData.winnerId,
      gameData.player1Score,
      gameData.player2Score,
      gameData.player1Name,
      gameData.player2Name
    ]);
    stmt.free();
    
    const getIdStmt = this.db.prepare('SELECT last_insert_rowid() as id');
    getIdStmt.step();
    const insertedId = getIdStmt.getAsObject().id;
    getIdStmt.free();
    
    this.save();
    return { lastInsertRowid: insertedId };
  }

  recordRoundData(gameId, roundNumber, playerId, score, wordsFound, pangramsFound) {
    const stmt = this.db.prepare(`
      INSERT INTO game_rounds (game_id, round_number, player_id, score, words_found, pangrams_found)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([gameId, roundNumber, playerId, score, JSON.stringify(wordsFound), pangramsFound]);
    stmt.free();
    this.save();
  }

  // Stats methods
  getUserStats(userId) {
    const stmt = this.db.prepare('SELECT * FROM user_stats WHERE user_id = ?');
    stmt.bind([userId]);
    
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
  }

  getPersonalStats(userId) {
    const stmt = this.db.prepare(`
      SELECT 
        total_games,
        games_won,
        games_lost,
        games_tied,
        best_round_score,
        best_game_score,
        best_round_date,
        best_game_date,
        updated_at,
        CASE 
          WHEN total_games > 0 THEN ROUND((games_won * 100.0) / total_games, 1)
          ELSE 0 
        END as win_rate
      FROM user_stats 
      WHERE user_id = ?
    `);
    stmt.bind([userId]);
    
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
  }

  getHeadToHeadStats(userId) {
    const stmt = this.db.prepare(`
      SELECT 
        h.*,
        CASE 
          WHEN h.player1_id = ? THEN u2.display_name
          ELSE u1.display_name
        END as opponent_name,
        CASE 
          WHEN h.player1_id = ? THEN h.player1_wins
          ELSE h.player2_wins
        END as my_wins,
        CASE 
          WHEN h.player1_id = ? THEN h.player2_wins
          ELSE h.player1_wins
        END as my_losses,
        h.ties,
        h.last_played
      FROM head_to_head h
      JOIN users u1 ON h.player1_id = u1.id
      JOIN users u2 ON h.player2_id = u2.id
      WHERE h.player1_id = ? OR h.player2_id = ?
      ORDER BY h.last_played DESC
    `);
    stmt.bind([userId, userId, userId, userId, userId]);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    
    return results;
  }

  updateHeadToHead(player1Id, player2Id, winnerId) {
    const [smallerId, largerId] = player1Id < player2Id ? [player1Id, player2Id] : [player2Id, player1Id];
    
    // Check if record exists
    const checkStmt = this.db.prepare('SELECT * FROM head_to_head WHERE player1_id = ? AND player2_id = ?');
    checkStmt.bind([smallerId, largerId]);
    const recordExists = checkStmt.step();
    checkStmt.free();

    if (recordExists) {
      // Update existing record
      let updateSql;
      if (winnerId === null) {
        updateSql = 'UPDATE head_to_head SET ties = ties + 1, last_played = CURRENT_TIMESTAMP WHERE player1_id = ? AND player2_id = ?';
      } else if (winnerId === smallerId) {
        updateSql = 'UPDATE head_to_head SET player1_wins = player1_wins + 1, last_played = CURRENT_TIMESTAMP WHERE player1_id = ? AND player2_id = ?';
      } else {
        updateSql = 'UPDATE head_to_head SET player2_wins = player2_wins + 1, last_played = CURRENT_TIMESTAMP WHERE player1_id = ? AND player2_id = ?';
      }
      
      const updateStmt = this.db.prepare(updateSql);
      updateStmt.run([smallerId, largerId]);
      updateStmt.free();
    } else {
      // Create new record
      let player1Wins = 0, player2Wins = 0, ties = 0;
      
      if (winnerId === null) {
        ties = 1;
      } else if (winnerId === smallerId) {
        player1Wins = 1;
      } else {
        player2Wins = 1;
      }
      
      const insertStmt = this.db.prepare(`
        INSERT INTO head_to_head (player1_id, player2_id, player1_wins, player2_wins, ties, last_played)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      insertStmt.run([smallerId, largerId, player1Wins, player2Wins, ties]);
      insertStmt.free();
    }
    
    this.save();
  }

  checkGlobalRecords(userId, gameId, roundScore, gameScore, roundNumber) {
    const recordsUpdated = [];

    // Check round record
    if (roundScore && roundNumber) {
      const roundCheckStmt = this.db.prepare('SELECT MAX(score) as max_score FROM global_records WHERE record_type = "best_round"');
      roundCheckStmt.step();
      const currentRoundRecord = roundCheckStmt.getAsObject().max_score || 0;
      roundCheckStmt.free();

      if (roundScore > currentRoundRecord) {
        const insertRoundStmt = this.db.prepare(`
          INSERT INTO global_records (record_type, user_id, score, game_id, round_number)
          VALUES ('best_round', ?, ?, ?, ?)
        `);
        insertRoundStmt.run([userId, roundScore, gameId, roundNumber]);
        insertRoundStmt.free();
        
        recordsUpdated.push({
          type: 'global_round',
          score: roundScore,
          previousRecord: currentRoundRecord
        });
      }
    }

    // Check game record
    if (gameScore) {
      const gameCheckStmt = this.db.prepare('SELECT MAX(score) as max_score FROM global_records WHERE record_type = "best_game"');
      gameCheckStmt.step();
      const currentGameRecord = gameCheckStmt.getAsObject().max_score || 0;
      gameCheckStmt.free();

      if (gameScore > currentGameRecord) {
        const insertGameStmt = this.db.prepare(`
          INSERT INTO global_records (record_type, user_id, score, game_id)
          VALUES ('best_game', ?, ?, ?)
        `);
        insertGameStmt.run([userId, gameScore, gameId]);
        insertGameStmt.free();
        
        recordsUpdated.push({
          type: 'global_game',
          score: gameScore,
          previousRecord: currentGameRecord
        });
      }
    }

    this.save();
    return recordsUpdated;
  }
}

module.exports = GameRepository;