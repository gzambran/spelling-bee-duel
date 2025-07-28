const express = require('express');
const router = express.Router();
const dbManager = require('../database/index');
const statsService = require('../services/statsService');

// Get personal stats
router.get('/personal/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const personalStats = statsService.getUserPersonalStats(parseInt(userId));
    
    if (personalStats !== null) {
      res.json({
        success: true,
        data: personalStats
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'User stats not found' 
      });
    }
  } catch (error) {
    console.error('Personal stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error fetching personal stats' 
    });
  }
});

// Get head-to-head stats
router.get('/head-to-head/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const headToHeadStats = statsService.getHeadToHeadStats(parseInt(userId));
    
    res.json({
      success: true,
      data: headToHeadStats
    });
  } catch (error) {
    console.error('Head-to-head stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error fetching head-to-head stats' 
    });
  }
});

// Get complete stats package
router.get('/complete/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const completeStats = statsService.getCompleteStatsFor(parseInt(userId));
    
    res.json({
      success: true,
      data: completeStats
    });
  } catch (error) {
    console.error('Complete stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error fetching complete stats' 
    });
  }
});

// Get user stats (legacy endpoint)
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = dbManager.getUserById(parseInt(userId));
    const stats = dbManager.getUserStats(parseInt(userId));
    
    if (user && stats) {
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name
        },
        stats: stats
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'User or stats not found' 
      });
    }
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error fetching stats' 
    });
  }
});

module.exports = router;