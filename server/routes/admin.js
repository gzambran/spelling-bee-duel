const express = require('express');
const router = express.Router();
const dbManager = require('../database');

// List all users (only in development)
router.get('/users', (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin endpoints not available in production' 
      });
    }

    const users = dbManager.listAllUsers();
    
    res.json({
      success: true,
      data: {
        userCount: users.length,
        users: users,
        databasePath: dbManager.dbPath
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list users' 
    });
  }
});

module.exports = router;