const wordData = require('./wordData');
const statsService = require('./services/statsService');
const dbManager = require('./database/index');

class GameLogic {
  constructor() {
    this.ROUND_DURATION = 90; // 90 seconds per round
    this.TOTAL_ROUNDS = 3;
    this.MIN_WORD_LENGTH = 4;
  }

  // Calculate points for a word based on length
  calculateWordPoints(word) {
    const length = word.length;
    if (length < this.MIN_WORD_LENGTH) {
      return 0;
    }
    
    // Exponential scoring: length² points
    return length * length;
  }

  // Calculate total points including pangram bonus
  calculateTotalPoints(word, isPangram) {
    const basePoints = this.calculateWordPoints(word);
    const pangramBonus = isPangram ? 25 : 0;
    return basePoints + pangramBonus;
  }

  // Create a new game state
  createGame(roomCode, initialPuzzle) {
    return {
      roomCode,
      puzzle: initialPuzzle, // Current round's puzzle
      puzzles: [initialPuzzle], // Store all puzzles used
      currentRound: 0,
      totalRounds: this.TOTAL_ROUNDS,
      gameStatus: 'waiting', // waiting, playing, between-rounds, finished
      roundStatus: 'waiting', // waiting, active, ended
      roundStartTime: null,
      roundEndTime: null,
      players: {},
      roundResults: [],
      finalResults: null,
      createdAt: new Date().toISOString(),
      // NEW: Track game database ID for stats
      gameDbId: null
    };
  }

  // Add a player to the game
  addPlayer(game, playerId, playerName) {
    if (Object.keys(game.players).length >= 2) {
      throw new Error('Game is full');
    }

    game.players[playerId] = {
      id: playerId,
      name: playerName || `Player ${Object.keys(game.players).length + 1}`,
      words: [],
      roundScore: 0,
      totalScore: 0,
      ready: false,
      connected: true,
      joinedAt: new Date().toISOString(),
      userId: null
    };

    console.log(`🎮 Player ${playerName} joined game ${game.roomCode}`);
    return game.players[playerId];
  }

  setPlayerUserId(game, playerId, userId) {
    console.log(`\n🔍 === SETTING PLAYER USER ID ===`);
    console.log(`   Room: ${game.roomCode}`);
    console.log(`   Socket ID: ${playerId}`);
    console.log(`   User ID: ${userId}`);
    
    if (game.players[playerId]) {
      game.players[playerId].userId = userId;
      console.log(`✅ Player ${game.players[playerId].name} successfully linked to user ID ${userId}`);
    } else {
      console.error(`❌ Player ${playerId} not found in game.players`);
      console.log(`📊 Available players:`, Object.keys(game.players));
    }
    console.log(`🔍 === END SETTING PLAYER USER ID ===\n`);
  }

    // Remove a player from the game
    removePlayer(game, playerId) {
      if (game.players[playerId]) {
        console.log(`🚪 Player ${game.players[playerId].name} left game ${game.roomCode}`);
        delete game.players[playerId];
      }
    }

    // Check if both players are ready to start
    canStartGame(game) {
      const playerCount = Object.keys(game.players).length;
      const allReady = Object.values(game.players).every(p => p.ready && p.connected);
      
      return playerCount === 2 && allReady && game.gameStatus === 'waiting';
  }

  // Start a new round with a fresh puzzle
  startRound(game) {
    if (game.currentRound >= this.TOTAL_ROUNDS) {
      throw new Error('All rounds completed');
    }

    game.currentRound++;
    
    // Get a new puzzle for this round (except for the first round which already has one)
    if (game.currentRound > 1) {
      const newPuzzle = wordData.getRandomPuzzle();
      game.puzzle = newPuzzle;
      game.puzzles.push(newPuzzle);
      console.log(`🎲 New puzzle selected for round ${game.currentRound}: ${game.puzzle.centerLetter}/${game.puzzle.outerLetters.join('')}`);
    }
    
    game.gameStatus = 'playing';
    game.roundStatus = 'active';
    game.roundStartTime = new Date().toISOString();
    game.roundEndTime = new Date(Date.now() + this.ROUND_DURATION * 1000).toISOString();

    // Reset player round data
    Object.values(game.players).forEach(player => {
      player.words = [];
      player.roundScore = 0;
      player.ready = false;
      player.hasSubmittedResults = false;
    });

    // Create game database record if we have userIds but no gameDbId yet
    if (!game.gameDbId && Object.values(game.players).every(p => p.userId)) {
      try {
        console.log(`\n🔍 === CREATING GAME DATABASE RECORD ===`);
        const players = Object.values(game.players);
        console.log(`👥 Players for database record:`);
        players.forEach((player, index) => {
          console.log(`   Player ${index + 1}: ${player.name} (userId: ${player.userId})`);
        });

        const gameData = {
          roomCode: game.roomCode,
          player1Id: players[0].userId,
          player2Id: players[1].userId,
          winnerId: null, // Will be set when game finishes
          player1Score: 0, // Will be updated when game finishes  
          player2Score: 0,
          player1Name: players[0].name,
          player2Name: players[1].name
        };

        console.log(`💾 Creating game record with data:`, gameData);
        const gameRecord = dbManager.recordGameResult(gameData);
        game.gameDbId = gameRecord.lastInsertRowid;
        console.log(`✅ Game record created with ID: ${game.gameDbId}`);
        console.log(`🔍 === END CREATING GAME DATABASE RECORD ===\n`);
      } catch (error) {
        console.error('❌ Error creating game record:', error.message);
        console.error('❌ Full error:', error);
      }
    } else {
      console.log(`\n⚠️ === NOT CREATING GAME DATABASE RECORD ===`);
      console.log(`   - gameDbId already exists: ${!!game.gameDbId}`);
      console.log(`   - all players have userIds: ${Object.values(game.players).every(p => p.userId)}`);
      Object.values(game.players).forEach((player, index) => {
        console.log(`   - Player ${index + 1} (${player.name}) userId: ${player.userId || 'MISSING'}`);
      });
      console.log(`🔍 === END NOT CREATING GAME DATABASE RECORD ===\n`);
    }

    console.log(`🎯 Round ${game.currentRound}/${this.TOTAL_ROUNDS} started for game ${game.roomCode}`);
    
    return {
      round: game.currentRound,
      totalRounds: this.TOTAL_ROUNDS,
      duration: this.ROUND_DURATION,
      startTime: game.roundStartTime,
      endTime: game.roundEndTime,
      puzzle: game.puzzle
    };
  }

  // Process round results submitted by client
  processRoundResults(game, playerId, results) {
    const player = game.players[playerId];
    if (!player) {
      throw new Error('Player not found');
    }

    if (game.roundStatus !== 'active') {
      console.warn(`⚠️ Player ${player.name} submitted results but round status is ${game.roundStatus}`);
    }

    console.log(`📊 Processing round results for ${player.name}: ${results.words.length} words, ${results.totalScore} points`);

    // Trust the client results as specified in requirements  
    player.words = results.words.map(wordData => ({
      word: wordData.word.toLowerCase(),
      points: wordData.points,
      isPangram: wordData.isPangram,
      submittedAt: new Date().toISOString()
    }));
    
    player.roundScore = results.totalScore;
    player.hasSubmittedResults = true;
    
    console.log(`✅ ${player.name} submitted ${player.words.length} words for ${player.roundScore} points`);
    
    return {
      success: true,
      wordsAccepted: player.words.length,
      roundScore: player.roundScore
    };
  }

  // Modified: End the current round with stats tracking
  async endRound(game) {
    console.log(`\n🔍 === ENDING ROUND ${game.currentRound} ===`);
    console.log(`🎮 Game: ${game.roomCode}`);
    console.log(`💾 Database ID: ${game.gameDbId}`);

    if (game.roundStatus === 'ended') {
      console.warn(`⚠️ Round ${game.currentRound} already ended`);
      return this.getRoundResults(game, game.currentRound);
    }

    game.roundStatus = 'ended';
    game.roundEndTime = new Date().toISOString();

    // Calculate final round scores
    Object.values(game.players).forEach(player => {
      player.totalScore += player.roundScore;
      console.log(`📊 ${player.name}: Round ${player.roundScore}, Total ${player.totalScore} (userId: ${player.userId})`);
    });

    const roundStatsResults = {};
    
    console.log(`🔍 Checking if can update round stats: gameDbId=${!!game.gameDbId}`);
    
    if (game.gameDbId) {
      for (const player of Object.values(game.players)) {
        console.log(`🔍 Processing stats for ${player.name} (userId: ${player.userId})`);
        if (player.userId) {
          try {
            const pangramsFound = player.words.filter(w => w.isPangram).length;
            console.log(`📈 Updating round stats for ${player.name}: ${player.roundScore} points, ${pangramsFound} pangrams`);
            
            const roundStats = await statsService.updateRoundStats(
              game.gameDbId,
              game.currentRound,
              {
                playerId: player.userId,
                roundScore: player.roundScore,
                words: player.words,
                pangramsFound
              }
            );
            
            roundStatsResults[player.id] = roundStats;
            console.log(`✅ Round stats updated for ${player.name}:`, roundStats);
          } catch (error) {
            console.error(`❌ Error updating round stats for ${player.name}:`, error.message);
            console.error(`❌ Full error:`, error);
          }
        } else {
          console.error(`❌ No userId for ${player.name}, skipping stats update`);
        }
      }
    } else {
      console.error(`❌ No gameDbId, skipping all round stats updates`);
    }

    // Create round results
    const roundResult = {
      round: game.currentRound,
      endedAt: game.roundEndTime,
      puzzle: game.puzzle,
      players: {},
      recordsUpdated: roundStatsResults
    };

    Object.values(game.players).forEach(player => {
      roundResult.players[player.id] = {
        name: player.name,
        words: [...player.words],
        roundScore: player.roundScore,
        totalScore: player.totalScore,
        wordCount: player.words.length
      };
    });

    game.roundResults.push(roundResult);

    // Check if game is finished
    if (game.currentRound >= this.TOTAL_ROUNDS) {
      console.log(`🏁 All rounds complete, finishing game...`);
      await this.finishGame(game);
    } else {
      game.gameStatus = 'between-rounds';
      console.log(`⏸️ Moving to between-rounds state`);
    }

    console.log(`🏁 Round ${game.currentRound} ended for game ${game.roomCode}`);
    console.log(`🔍 === END ENDING ROUND ${game.currentRound} ===\n`);
    
    return roundResult;
  }

  async finishGame(game) {
    console.log(`\n🔍 === DEBUGGING GAME COMPLETION ===`);
    console.log(`🎮 Game ID: ${game.roomCode}`);
    console.log(`💾 Database ID: ${game.gameDbId}`);
    
    // Log all players and their user IDs
    console.log(`👥 Players in game:`);
    Object.values(game.players).forEach((player, index) => {
      console.log(`   Player ${index + 1}: ${player.name} (socket: ${player.id}, userId: ${player.userId})`);
    });

    game.gameStatus = 'finished';
    
    // Determine winner
    const playerScores = Object.values(game.players).map(player => ({
      id: player.id,
      name: player.name,
      totalScore: player.totalScore,
      totalWords: game.roundResults.reduce((sum, round) => 
        sum + (round.players[player.id]?.wordCount || 0), 0),
      userId: player.userId
    })).sort((a, b) => b.totalScore - a.totalScore);

    console.log(`🏆 Final scores:`);
    playerScores.forEach((player, index) => {
      console.log(`   ${index + 1}. ${player.name}: ${player.totalScore} points (userId: ${player.userId})`);
    });

    const winner = playerScores[0];
    const isTie = playerScores.length > 1 && playerScores[0].totalScore === playerScores[1].totalScore;

    console.log(`🎯 Winner: ${isTie ? 'TIE' : winner.name}`);

    // CRITICAL: Check if we can update database
    const canUpdateDatabase = game.gameDbId && playerScores[0].userId && playerScores[1].userId;
    console.log(`📊 Can update database? ${canUpdateDatabase}`);
    console.log(`   - gameDbId exists: ${!!game.gameDbId}`);
    console.log(`   - player1 userId exists: ${!!playerScores[0].userId}`);
    console.log(`   - player2 userId exists: ${!!playerScores[1].userId}`);

    // Update existing game record with final results
    if (canUpdateDatabase) {
      try {
        console.log(`💾 Updating game record ${game.gameDbId} with final results...`);
        
        const updateGameStmt = dbManager.db.prepare(`
          UPDATE game_records 
          SET winner_id = ?, player1_score = ?, player2_score = ?, completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        
        const updateResult = updateGameStmt.run([
          isTie ? null : winner.userId,
          playerScores[0].totalScore,
          playerScores[1].totalScore,
          game.gameDbId
        ]);
        
        console.log(`💾 Database update result:`, updateResult);
        updateGameStmt.free();
        dbManager.saveDatabase();
        
        console.log(`✅ Game record ${game.gameDbId} updated successfully`);
      } catch (error) {
        console.error('❌ Error updating game record:', error.message);
        console.error('❌ Full error:', error);
      }
    } else {
      console.error(`❌ Skipping database update due to missing data`);
    }

    // Complete comprehensive game stats
    let gameStatsResults = {};
    
    if (canUpdateDatabase) {
      try {
        console.log(`📈 Starting comprehensive game stats update...`);
        
        const player1Data = {
          playerId: playerScores[0].userId,
          totalScore: playerScores[0].totalScore,
          gameOutcome: isTie ? 'tie' : (playerScores[0].id === winner.id ? 'win' : 'loss')
        };
        
        const player2Data = {
          playerId: playerScores[1].userId,
          totalScore: playerScores[1].totalScore,
          gameOutcome: isTie ? 'tie' : (playerScores[1].id === winner.id ? 'win' : 'loss')
        };

        console.log(`📊 Player 1 data:`, player1Data);
        console.log(`📊 Player 2 data:`, player2Data);

        const gameResult = {
          winnerId: isTie ? null : winner.userId
        };

        gameStatsResults = await statsService.completeGameStats(
          game.gameDbId,
          player1Data,
          player2Data,
          gameResult
        );

        console.log(`✅ Comprehensive game stats completed:`, gameStatsResults);
      } catch (error) {
        console.error('❌ Error completing game stats:', error.message);
        console.error('❌ Full error:', error);
      }
    } else {
      console.error(`❌ Skipping stats update due to missing data`);
    }

    game.finalResults = {
      winner: isTie ? null : winner,
      isTie,
      finalScores: playerScores,
      puzzlesUsed: game.puzzles,
      finishedAt: new Date().toISOString(),
      // Include any records broken in this game
      recordsUpdated: gameStatsResults
    };

    console.log(`🏆 Game ${game.roomCode} finished! Winner: ${isTie ? 'TIE' : winner.name} (${winner.totalScore} pts)`);
    console.log(`🔍 === END DEBUGGING GAME COMPLETION ===\n`);
    
    return game.finalResults;
  }

  // Mark player as ready for next round
  setPlayerReady(game, playerId, ready = true) {
    const player = game.players[playerId];
    if (!player) {
      throw new Error('Player not found');
    }

    player.ready = ready;
    
    return this.canStartNextRound(game);
  }

  // Check if ready to start next round
  canStartNextRound(game) {
    if (game.gameStatus !== 'between-rounds') {
      return false;
    }

    const allReady = Object.values(game.players).every(p => p.ready && p.connected);
    return allReady;
  }

  // Check if ready to restart a finished game
  canRestartGame(game) {
    if (game.gameStatus !== 'finished') {
      return false;
    }

    const playerCount = Object.keys(game.players).length;
    const allReady = Object.values(game.players).every(p => p.ready && p.connected);
    
    return playerCount === 2 && allReady;
  }

  // Restart a finished game with same players
  restartGame(game) {
    if (game.gameStatus !== 'finished') {
      throw new Error('Can only restart a finished game');
    }

    console.log(`🔄 Restarting game ${game.roomCode} with same players`);

    // Get a new puzzle for the fresh game
    const newPuzzle = wordData.getRandomPuzzle();
    
    // Reset game state while keeping players
    game.puzzle = newPuzzle;
    game.puzzles = [newPuzzle];
    game.currentRound = 0;
    game.gameStatus = 'waiting';
    game.roundStatus = 'waiting';
    game.roundStartTime = null;
    game.roundEndTime = null;
    game.roundResults = [];
    game.finalResults = null;
    // NEW: Reset game database ID for new game record
    game.gameDbId = null;

    // Reset all players' game data but keep their identities and user IDs
    Object.values(game.players).forEach(player => {
      player.words = [];
      player.roundScore = 0;
      player.totalScore = 0;
      player.ready = false;
      player.hasSubmittedResults = false;
      // Keep player.userId for stats tracking
    });

    console.log(`✅ Game ${game.roomCode} restarted with puzzle: ${game.puzzle.centerLetter}/${game.puzzle.outerLetters.join('')}`);
    
    return game;
  }

  // Get current game state summary
  getGameState(game) {
    const state = {
      roomCode: game.roomCode,
      gameStatus: game.gameStatus,
      roundStatus: game.roundStatus,
      currentRound: game.currentRound,
      totalRounds: game.totalRounds,
      puzzle: {
        centerLetter: game.puzzle.centerLetter,
        outerLetters: game.puzzle.outerLetters,
        validWords: game.puzzle.validWords,
        pangrams: game.puzzle.pangrams,
        wordPoints: game.puzzle.wordPoints,
        totalWords: game.puzzle.totalWords,
        totalPangrams: game.puzzle.totalPangrams
      },
      players: Object.values(game.players).map(p => ({
        id: p.id,
        name: p.name,
        roundScore: p.roundScore,
        totalScore: p.totalScore,
        wordCount: p.words.length,
        ready: p.ready,
        connected: p.connected
      })),
      roundStartTime: game.roundStartTime,
      roundEndTime: game.roundEndTime,
      timeRemaining: game.roundEndTime ? 
        Math.max(0, Math.floor((new Date(game.roundEndTime) - new Date()) / 1000)) : null,
      roundResults: game.roundResults || []
    };

    // Include final results if game is finished
    if (game.gameStatus === 'finished' && game.finalResults) {
      state.finalResults = game.finalResults;
    }

    return state;
  }

  // Get detailed round results
  getRoundResults(game, roundNumber = null) {
    if (roundNumber !== null) {
      return game.roundResults.find(r => r.round === roundNumber);
    }
    return game.roundResults;
  }

  // NEW: Helper method to extract records from round/game results for client notifications
  extractRecordsForNotification(recordsUpdated, playerId) {
    if (!recordsUpdated || !recordsUpdated[playerId]) {
      return { roundRecords: [], gameRecords: [] };
    }

    const playerRecords = recordsUpdated[playerId];
    const roundRecords = [];
    const gameRecords = [];

    // Process personal records
    if (playerRecords.personalRecords) {
      playerRecords.personalRecords.forEach(record => {
        if (record.type === 'personal_round') {
          roundRecords.push({
            type: 'personal',
            message: `🎉 New Personal Best Round! ${record.score} points`,
            score: record.score,
            previousRecord: record.previousRecord
          });
        } else if (record.type === 'personal_game') {
          gameRecords.push({
            type: 'personal',
            message: `🎉 New Personal Best Game! ${record.score} points`,
            score: record.score,
            previousRecord: record.previousRecord
          });
        }
      });
    }

    // Process global records
    if (playerRecords.globalRecords) {
      playerRecords.globalRecords.forEach(record => {
        if (record.type === 'global_round') {
          roundRecords.push({
            type: 'global',
            message: `🏆 NEW ALL-TIME ROUND RECORD! ${record.score} points`,
            score: record.score,
            previousRecord: record.previousRecord
          });
        } else if (record.type === 'global_game') {
          gameRecords.push({
            type: 'global',
            message: `🏆 NEW ALL-TIME GAME RECORD! ${record.score} points`,
            score: record.score,
            previousRecord: record.previousRecord
          });
        }
      });
    }

    return { roundRecords, gameRecords };
  }
}

// Create singleton instance
const gameLogic = new GameLogic();

module.exports = gameLogic;