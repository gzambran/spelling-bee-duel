const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Import our game modules
const wordData = require('./wordData');
const gameLogic = require('./gameLogic');
const roomManager = require('./roomManager');

const app = express();
const server = http.createServer(app);

// Configure CORS for React Native client
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: true, // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Initialize word data on server startup
async function initializeServer() {
  try {
    console.log('🚀 Initializing Spelling Bee Duel Server...');
    await wordData.loadPuzzleData();
    console.log('✅ Server initialization complete');
  } catch (error) {
    console.error('❌ Server initialization failed:', error.message);
    process.exit(1);
  }
}

// API Endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Spelling Bee Duel Server Running',
    stats: roomManager.getStats()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Spelling Bee Duel Server',
    version: '1.0.0',
    status: 'running',
    stats: roomManager.getStats()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  // Handle room creation
  socket.on('create-room', (data, callback) => {
    try {
      const { playerName } = data;
      const result = roomManager.createRoom(socket.id, playerName);
      
      // Join the socket room
      socket.join(result.roomCode);
      console.log(`🏠 ${playerName} joined Socket.io room ${result.roomCode}`);
      
      callback({ success: true, ...result });
      
      // Notify other players in room (if any)
      socket.to(result.roomCode).emit('player-joined', {
        player: result.game.players.find(p => p.id === socket.id),
        gameState: result.game
      });
      
    } catch (error) {
      console.error('Create room error:', error.message);
      callback({ success: false, error: error.message });
    }
  });

  // Handle room joining
  socket.on('join-room', (data, callback) => {
    try {
      const { roomCode, playerName } = data;
      const result = roomManager.joinRoom(roomCode, socket.id, playerName);
      
      // Join the socket room
      socket.join(roomCode);
      console.log(`🚪 ${playerName} joined Socket.io room ${roomCode}`);
      
      callback({ success: true, ...result });
      
      // Notify other players in room
      socket.to(roomCode).emit('player-joined', {
        player: result.game.players.find(p => p.id === socket.id),
        gameState: result.game
      });
      
    } catch (error) {
      console.error('Join room error:', error.message);
      callback({ success: false, error: error.message });
    }
  });

  // Handle player ready status
  socket.on('player-ready', (data, callback) => {
    try {
      const roomCode = roomManager.getPlayerRoom(socket.id);
      if (!roomCode) {
        throw new Error('Player not in any room');
      }

      const game = roomManager.getRoom(roomCode);
      const canStartNext = gameLogic.setPlayerReady(game, socket.id, data.ready);
      
      console.log(`🟢 Player ready status: ${game.players[socket.id]?.name} = ${data.ready}`);
      console.log(`🎮 Game status: ${game.gameStatus}, Players ready: ${Object.values(game.players).map(p => `${p.name}:${p.ready}`).join(', ')}`);
      
      // Notify all players in room about ready status
      io.to(roomCode).emit('player-ready-status', {
        playerId: socket.id,
        ready: data.ready,
        gameState: gameLogic.getGameState(game)
      });

      // Start game or next round if both players ready
      if (gameLogic.canStartGame(game)) {
        console.log(`🎯 Starting game in room ${roomCode}`);
        const roundInfo = roomManager.startRoundWithTimer(roomCode, io);
        io.to(roomCode).emit('game-started', {
          roundInfo,
          gameState: gameLogic.getGameState(game)
        });
      } else if (canStartNext) {
        console.log(`🎯 Starting next round in room ${roomCode}`);
        const roundInfo = roomManager.startRoundWithTimer(roomCode, io);
        io.to(roomCode).emit('round-started', {
          roundInfo,
          gameState: gameLogic.getGameState(game)
        });
      } else {
        console.log(`⏳ Waiting for more players or ready status in room ${roomCode}`);
      }

      callback({ success: true, canStartNext });
      
    } catch (error) {
      console.error('Player ready error:', error.message);
      callback({ success: false, error: error.message });
    }
  });

  // Handle word submission
  socket.on('submit-word', (data, callback) => {
    try {
      const { word } = data;
      const roomCode = roomManager.getPlayerRoom(socket.id);
      
      if (!roomCode) {
        throw new Error('Player not in any room');
      }

      const game = roomManager.getRoom(roomCode);
      const result = gameLogic.submitWord(game, socket.id, word);
      
      callback({ success: true, ...result });
      
      // Notify all players in room about the word submission
      io.to(roomCode).emit('word-submitted', {
        playerId: socket.id,
        playerName: game.players[socket.id].name,
        word: result.word,
        points: result.points,
        isPangram: result.isPangram,
        gameState: gameLogic.getGameState(game)
      });
      
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle manual round end (if needed)
  socket.on('end-round', (data, callback) => {
    try {
      const roomCode = roomManager.getPlayerRoom(socket.id);
      if (!roomCode) {
        throw new Error('Player not in any room');
      }

      const game = roomManager.getRoom(roomCode);
      const roundResult = gameLogic.endRound(game);
      
      // Clear the automatic timer
      roomManager.clearRoundTimer(roomCode);
      
      // Notify all players
      io.to(roomCode).emit('round-ended', {
        roundResult,
        gameState: gameLogic.getGameState(game)
      });
      
      callback({ success: true, roundResult });
      
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle getting current game state
  socket.on('get-game-state', (data, callback) => {
    try {
      const roomCode = roomManager.getPlayerRoom(socket.id);
      if (!roomCode) {
        throw new Error('Player not in any room');
      }

      const roomInfo = roomManager.getRoomInfo(roomCode);
      callback({ success: true, ...roomInfo });
      
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle getting round results
  socket.on('get-round-results', (data, callback) => {
    try {
      const roomCode = roomManager.getPlayerRoom(socket.id);
      if (!roomCode) {
        throw new Error('Player not in any room');
      }

      const game = roomManager.getRoom(roomCode);
      const results = gameLogic.getRoundResults(game, data.roundNumber);
      
      callback({ success: true, results });
      
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle player disconnection
  socket.on('disconnect', (reason) => {
    console.log(`📴 Player disconnected: ${socket.id}, reason: ${reason}`);
    
    try {
      const leaveResult = roomManager.leaveRoom(socket.id);
      
      if (leaveResult) {
        // Notify remaining players
        socket.to(leaveResult.roomCode).emit('player-disconnected', {
          playerId: socket.id,
          remainingPlayers: leaveResult.remainingPlayers
        });
      }
    } catch (error) {
      console.error('Error handling disconnect:', error.message);
    }
  });

  // Basic ping-pong for connection testing
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // Handle reconnection attempts
  socket.on('reconnect-to-room', (data, callback) => {
    try {
      const { roomCode, playerName } = data;
      const result = roomManager.rejoinRoom(roomCode, socket.id, playerName);
      
      // Join the socket room
      socket.join(roomCode);
      
      callback({ success: true, ...result });
      
      // Notify other players about reconnection
      socket.to(roomCode).emit('player-reconnected', {
        playerId: socket.id,
        playerName,
        gameState: result.game
      });
      
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  roomManager.cleanup();
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  roomManager.cleanup();
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3000;

// Initialize and start server
initializeServer().then(() => {
  server.listen(PORT, () => {
    console.log(`🎯 Spelling Bee Duel server running on port ${PORT}`);
    console.log(`📱 Health check available at http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.io ready for connections`);
    console.log(`📚 Loaded ${wordData.getStats().totalPuzzles} puzzles`);
  });
});