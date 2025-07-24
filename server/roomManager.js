const wordData = require('./wordData');
const gameLogic = require('./gameLogic');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> game object
    this.playerRooms = new Map(); // playerId -> roomCode
    this.roomTimers = new Map(); // roomCode -> timer objects
  }

  // Generate a unique 4-digit room code
  generateRoomCode() {
    let code;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
    } while (this.rooms.has(code) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique room code');
    }

    return code;
  }

  // Create a new game room
  createRoom(playerId, playerName) {
    try {
      // Check if player is already in a room
      if (this.playerRooms.has(playerId)) {
        const existingRoom = this.playerRooms.get(playerId);
        throw new Error(`Player already in room ${existingRoom}`);
      }

      // Generate room code and get random puzzle
      const roomCode = this.generateRoomCode();
      const puzzle = wordData.getRandomPuzzle();
      
      // Create new game
      const game = gameLogic.createGame(roomCode, puzzle);
      
      // Add creator as first player
      gameLogic.addPlayer(game, playerId, playerName);
      
      // Store room and player mapping
      this.rooms.set(roomCode, game);
      this.playerRooms.set(playerId, roomCode);

      console.log(`🏠 Room ${roomCode} created by ${playerName}`);

      return {
        roomCode,
        game: gameLogic.getGameState(game),
        playerCount: 1,
        maxPlayers: 2
      };
    } catch (error) {
      console.error(`❌ Error creating room:`, error.message);
      throw error;
    }
  }

  // Join an existing room
  joinRoom(roomCode, playerId, playerName) {
    try {
      // Check if player is already in a room
      if (this.playerRooms.has(playerId)) {
        const existingRoom = this.playerRooms.get(playerId);
        if (existingRoom === roomCode) {
          // Player rejoining same room
          return this.rejoinRoom(roomCode, playerId, playerName);
        }
        throw new Error(`Player already in room ${existingRoom}`);
      }

      // Check if room exists
      const game = this.rooms.get(roomCode);
      if (!game) {
        throw new Error('Room not found');
      }

      // Check if room is full
      if (Object.keys(game.players).length >= 2) {
        throw new Error('Room is full');
      }

      // Add player to game
      gameLogic.addPlayer(game, playerId, playerName);
      this.playerRooms.set(playerId, roomCode);

      console.log(`🚪 ${playerName} joined room ${roomCode}`);

      return {
        roomCode,
        game: gameLogic.getGameState(game),
        playerCount: Object.keys(game.players).length,
        maxPlayers: 2
      };
    } catch (error) {
      console.error(`❌ Error joining room ${roomCode}:`, error.message);
      throw error;
    }
  }

  // Rejoin an existing room (for reconnections)
  rejoinRoom(roomCode, playerId, playerName) {
    try {
      const game = this.rooms.get(roomCode);
      if (!game) {
        throw new Error('Room not found');
      }

      // Update player connection status
      if (game.players[playerId]) {
        game.players[playerId].connected = true;
        if (playerName) {
          game.players[playerId].name = playerName;
        }
        console.log(`🔄 ${playerName} reconnected to room ${roomCode}`);
      } else {
        throw new Error('Player not found in room');
      }

      return {
        roomCode,
        game: gameLogic.getGameState(game),
        playerCount: Object.keys(game.players).length,
        maxPlayers: 2,
        rejoined: true
      };
    } catch (error) {
      console.error(`❌ Error rejoining room ${roomCode}:`, error.message);
      throw error;
    }
  }

  // Leave a room
  leaveRoom(playerId) {
    try {
      const roomCode = this.playerRooms.get(playerId);
      if (!roomCode) {
        return null; // Player not in any room
      }

      const game = this.rooms.get(roomCode);
      if (!game) {
        this.playerRooms.delete(playerId);
        return null;
      }

      // Mark player as disconnected instead of removing immediately
      if (game.players[playerId]) {
        game.players[playerId].connected = false;
        console.log(`📴 Player ${game.players[playerId].name} disconnected from room ${roomCode}`);
      }

      this.playerRooms.delete(playerId);

      // Check if room should be cleaned up
      const connectedPlayers = Object.values(game.players).filter(p => p.connected);
      
      if (connectedPlayers.length === 0) {
        // No connected players, schedule room cleanup
        this.scheduleRoomCleanup(roomCode);
      }

      return {
        roomCode,
        remainingPlayers: connectedPlayers.length
      };
    } catch (error) {
      console.error(`❌ Error leaving room:`, error.message);
      throw error;
    }
  }

  // Get room information
  getRoomInfo(roomCode) {
    const game = this.rooms.get(roomCode);
    if (!game) {
      throw new Error('Room not found');
    }

    return {
      roomCode,
      game: gameLogic.getGameState(game),
      playerCount: Object.keys(game.players).length,
      connectedPlayers: Object.values(game.players).filter(p => p.connected).length,
      maxPlayers: 2
    };
  }

  // Start a round with automatic timer
  startRoundWithTimer(roomCode, io) {
    try {
      const game = this.rooms.get(roomCode);
      if (!game) {
        throw new Error('Room not found');
      }

      const roundInfo = gameLogic.startRound(game);
      
      // Clear any existing round timer
      this.clearRoundTimer(roomCode);

      // Set timer to automatically end round
      const timer = setTimeout(() => {
        this.endRoundAutomatically(roomCode, io);
      }, gameLogic.ROUND_DURATION * 1000);

      // Store timer reference
      if (!this.roomTimers.has(roomCode)) {
        this.roomTimers.set(roomCode, {});
      }
      this.roomTimers.get(roomCode).roundTimer = timer;

      return roundInfo;
    } catch (error) {
      console.error(`❌ Error starting round for room ${roomCode}:`, error.message);
      throw error;
    }
  }

  // Automatically end a round when timer expires
  endRoundAutomatically(roomCode, io) {
    try {
      const game = this.rooms.get(roomCode);
      if (!game || game.roundStatus !== 'active') {
        return;
      }

      console.log(`⏰ Round ${game.currentRound} time expired for room ${roomCode}`);
      
      const roundResult = gameLogic.endRound(game);
      
      // Notify all players in the room
      const roomSockets = io.sockets.adapter.rooms.get(roomCode);
      if (roomSockets) {
        io.to(roomCode).emit('round-ended', {
          roundResult,
          gameState: gameLogic.getGameState(game)
        });
      }

      // Clear the timer
      this.clearRoundTimer(roomCode);

    } catch (error) {
      console.error(`❌ Error auto-ending round for room ${roomCode}:`, error.message);
    }
  }

  // Clear round timer for a room
  clearRoundTimer(roomCode) {
    const timers = this.roomTimers.get(roomCode);
    if (timers && timers.roundTimer) {
      clearTimeout(timers.roundTimer);
      delete timers.roundTimer;
    }
  }

  // Schedule room cleanup after all players disconnect
  scheduleRoomCleanup(roomCode, delayMinutes = 5) {
    // Clear any existing cleanup timer
    this.clearCleanupTimer(roomCode);

    const timer = setTimeout(() => {
      this.cleanupRoom(roomCode);
    }, delayMinutes * 60 * 1000);

    if (!this.roomTimers.has(roomCode)) {
      this.roomTimers.set(roomCode, {});
    }
    this.roomTimers.get(roomCode).cleanupTimer = timer;

    console.log(`🧹 Room ${roomCode} scheduled for cleanup in ${delayMinutes} minutes`);
  }

  // Clear cleanup timer for a room
  clearCleanupTimer(roomCode) {
    const timers = this.roomTimers.get(roomCode);
    if (timers && timers.cleanupTimer) {
      clearTimeout(timers.cleanupTimer);
      delete timers.cleanupTimer;
    }
  }

  // Clean up abandoned room
  cleanupRoom(roomCode) {
    const game = this.rooms.get(roomCode);
    if (!game) {
      return;
    }

    // Check if any players reconnected
    const connectedPlayers = Object.values(game.players).filter(p => p.connected);
    if (connectedPlayers.length > 0) {
      console.log(`🔄 Room ${roomCode} cleanup cancelled - players reconnected`);
      this.clearCleanupTimer(roomCode);
      return;
    }

    // Remove room and clean up timers
    this.rooms.delete(roomCode);
    this.roomTimers.delete(roomCode);

    // Remove player room mappings
    Object.keys(game.players).forEach(playerId => {
      this.playerRooms.delete(playerId);
    });

    console.log(`🗑️  Room ${roomCode} cleaned up`);
  }

  // Get the room code for a specific player
  getPlayerRoom(playerId) {
    return this.playerRooms.get(playerId) || null;
  }

  // Get a room object by room code
  getRoom(roomCode) {
    return this.rooms.get(roomCode) || null;
  }

  // Get server statistics
  getStats() {
    const totalRooms = this.rooms.size;
    const activeGames = Array.from(this.rooms.values()).filter(game => 
      game.gameStatus === 'playing' || game.gameStatus === 'between-rounds').length;
    const totalPlayers = this.playerRooms.size;

    return {
      totalRooms,
      activeGames,
      totalPlayers,
      wordDataStats: wordData.getStats()
    };
  }

  // Clean up all timers (for server shutdown)
  cleanup() {
    console.log('🧹 Cleaning up all room timers...');
    
    for (const [roomCode, timers] of this.roomTimers.entries()) {
      if (timers.roundTimer) {
        clearTimeout(timers.roundTimer);
      }
      if (timers.cleanupTimer) {
        clearTimeout(timers.cleanupTimer);
      }
    }
    
    this.roomTimers.clear();
    console.log('✅ All timers cleared');
  }
}

// Create singleton instance
const roomManager = new RoomManager();

module.exports = roomManager;