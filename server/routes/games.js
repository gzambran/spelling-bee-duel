const express = require('express');
const router = express.Router();
const dbManager = require('../database');

// Record game result
router.post('/record', (req, res) => {
  try {
    const { roomCode, player1, player2, winner, finalScores } = req.body;
    
    // Find user IDs by username (using case-insensitive lookup)
    const player1User = dbManager.getUserByUsernameInsensitive(player1.name);
    const player2User = dbManager.getUserByUsernameInsensitive(player2.name);
    
    if (!player1User || !player2User) {
      return res.status(400).json({ 
        success: false, 
        error: 'One or both players not found' 
      });
    }

    const gameData = {
      roomCode,
      player1Id: player1User.id,
      player2Id: player2User.id,
      winnerId: winner ? (winner.name === player1.name ? player1User.id : player2User.id) : null,
      player1Score: finalScores.player1,
      player2Score: finalScores.player2,
      player1Name: player1.name,
      player2Name: player2.name
    };

    const result = dbManager.recordGameResult(gameData);
    
    console.log(`📊 Game recorded: ${player1.name} vs ${player2.name} (Room: ${roomCode})`);
    
    res.json({
      success: true,
      gameId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Record game error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to record game result' 
    });
  }
});

module.exports = router;