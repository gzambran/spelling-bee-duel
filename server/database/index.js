const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const DatabaseSchema = require('./schema');
const UserRepository = require('./userRepository');
const GameRepository = require('./gameRepository');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'db', 'game.db');
    
    // Initialize repositories
    this.users = null;
    this.games = null;
    
    this.ensureDbDirectory();
    this.init();
  }

  ensureDbDirectory() {
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  async init() {
    try {
      const SQL = await initSqlJs();
      
      if (fs.existsSync(this.dbPath)) {
        const filebuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(filebuffer);
        console.log('📊 Database loaded');
      } else {
        this.db = new SQL.Database();
        console.log('📊 New database created');
      }
      
      // Initialize schema
      const schema = new DatabaseSchema(this.db);
      schema.initialize();
      
      // Initialize repositories
      this.users = new UserRepository(this.db, () => this.saveDatabase());
      this.games = new GameRepository(this.db, () => this.saveDatabase());
      
      // Create initial data
      this.users.createInitialUsers();
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      process.exit(1);
    }
  }

  saveDatabase() {
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (error) {
      console.error('❌ Error saving database:', error.message);
    }
  }

  // User methods
  getUserByUsername(username) { return this.users.getByUsername(username); }
  getUserByUsernameInsensitive(username) { return this.users.getByUsernameInsensitive(username); }
  getUserById(userId) { return this.users.getById(userId); }
  listAllUsers() { return this.users.listAll(); }

  // Game methods
  recordGameResult(gameData) { return this.games.recordGameResult(gameData); }
  recordRoundData(...args) { return this.games.recordRoundData(...args); }

  // Stats methods
  getUserStats(userId) { return this.games.getUserStats(userId); }
  getPersonalStats(userId) { return this.games.getPersonalStats(userId); }
  getHeadToHeadStats(userId) { return this.games.getHeadToHeadStats(userId); }
  updateHeadToHead(...args) { return this.games.updateHeadToHead(...args); }
  checkGlobalRecords(...args) { return this.games.checkGlobalRecords(...args); }

  close() {
    if (this.db) {
      this.saveDatabase();
      this.db.close();
      console.log('📊 Database closed');
    }
  }
}

// Singleton
const dbManager = new DatabaseManager();

process.on('SIGINT', () => { dbManager.close(); process.exit(0); });
process.on('SIGTERM', () => { dbManager.close(); process.exit(0); });

module.exports = dbManager;