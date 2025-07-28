const express = require('express');
const router = express.Router();
const dbManager = require('../database');

router.post('/login', (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || !username.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Username is required' 
      });
    }

    const normalizedUsername = username.trim();
    const user = dbManager.getUserByUsernameInsensitive(normalizedUsername);
    
    if (user) {
      const userStats = dbManager.getUserStats(user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          stats: userStats || {
            total_games: 0,
            games_won: 0,
            games_lost: 0,
            games_tied: 0,
            best_round_score: 0,
            best_game_score: 0
          }
        }
      });
      
      console.log(`✅ User logged in: ${user.display_name} (${user.username})`);
    } else {
      console.log(`❌ Login failed for username: ${normalizedUsername}`);
      
      res.status(404).json({ 
        success: false, 
        error: 'Username not found',
        message: 'Please check your username and try again.'
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login'
    });
  }
});

// Validate stored user (for auto-login) - FIXED
router.get('/validate/:username', (req, res) => {
  try {
    const { username } = req.params;
    
    const user = dbManager.getUserByUsernameInsensitive(username);
    
    if (user) {
      const userStats = dbManager.getUserStats(user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          stats: userStats || {
            total_games: 0,
            games_won: 0,
            games_lost: 0,
            games_tied: 0,
            best_round_score: 0,
            best_game_score: 0
          }
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'User not found or inactive' 
      });
    }
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during validation' 
    });
  }
});

module.exports = router;