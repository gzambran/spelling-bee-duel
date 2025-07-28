const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const gameRoutes = require('./routes/games');
const adminRoutes = require('./routes/admin');

// Import game modules
const wordData = require('./wordData');
const socketHandlers = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Configure Socket.io
const io = socketIo(server, {
  cors: {
    origin: true,
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

// Basic endpoints
app.get('/health', (req, res) => {
  const roomManager = require('./roomManager');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Spelling Bee Duel Server Running',
    stats: roomManager.getStats()
  });
});

app.get('/', (req, res) => {
  const roomManager = require('./roomManager');
  res.json({
    name: 'Spelling Bee Duel Server',
    version: '1.0.0',
    status: 'running',
    stats: roomManager.getStats()
  });
});

// Puzzle statistics endpoint
app.get('/api/puzzle-stats', (req, res) => {
  try {
    const stats = wordData.getStats();
    res.json({
      success: true,
      data: {
        totalPuzzles: stats.totalPuzzles,
        dateRange: stats.dateRange,
        oldestDate: stats.oldestDate,
        newestDate: stats.newestDate,
        loaded: stats.loaded
      }
    });
  } catch (error) {
    console.error('Error getting puzzle stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get puzzle statistics'
    });
  }
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io handling
socketHandlers.setupSocketHandlers(io);

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down server...');
  const roomManager = require('./roomManager');
  roomManager.cleanup();
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

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