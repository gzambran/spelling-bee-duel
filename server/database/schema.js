class DatabaseSchema {
  constructor(db) {
    this.db = db;
    this.currentVersion = 2;
  }

  initialize() {
    this.createTables();
    this.runMigrations();
  }

  createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS game_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT NOT NULL,
        player1_id INTEGER REFERENCES users(id),
        player2_id INTEGER REFERENCES users(id),
        winner_id INTEGER REFERENCES users(id),
        player1_score INTEGER NOT NULL,
        player2_score INTEGER NOT NULL,
        player1_name TEXT NOT NULL,
        player2_name TEXT NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        total_games INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        games_lost INTEGER DEFAULT 0,
        games_tied INTEGER DEFAULT 0,
        best_round_score INTEGER DEFAULT 0,
        best_game_score INTEGER DEFAULT 0,
        best_round_date DATETIME,
        best_game_date DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS game_rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL CHECK (round_number IN (1, 2, 3)),
        player_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        words_found TEXT NOT NULL,
        pangrams_found INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES game_records(id),
        FOREIGN KEY (player_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS head_to_head (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_id INTEGER NOT NULL,
        player2_id INTEGER NOT NULL,
        player1_wins INTEGER DEFAULT 0,
        player2_wins INTEGER DEFAULT 0,
        ties INTEGER DEFAULT 0,
        last_played DATETIME,
        FOREIGN KEY (player1_id) REFERENCES users(id),
        FOREIGN KEY (player2_id) REFERENCES users(id),
        UNIQUE(player1_id, player2_id)
      );

      CREATE TABLE IF NOT EXISTS global_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_type TEXT NOT NULL CHECK (record_type IN ('best_round', 'best_game')),
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        round_number INTEGER,
        achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (game_id) REFERENCES game_records(id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_game_rounds_game_id ON game_rounds(game_id);
      CREATE INDEX IF NOT EXISTS idx_game_rounds_player_id ON game_rounds(player_id);
      CREATE INDEX IF NOT EXISTS idx_head_to_head_players ON head_to_head(player1_id, player2_id);
      CREATE INDEX IF NOT EXISTS idx_global_records_type ON global_records(record_type);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
  }

  runMigrations() {
    const currentVersion = this.getCurrentVersion();
    
    if (currentVersion < 2) {
      this.migrateToVersion2();
    }

    if (currentVersion < this.currentVersion) {
      this.updateVersion();
    }
  }

  getCurrentVersion() {
    const stmt = this.db.prepare('SELECT version FROM db_version ORDER BY version DESC LIMIT 1');
    let version = 0;
    if (stmt.step()) version = stmt.get()[0];
    stmt.free();
    return version;
  }

  migrateToVersion2() {
    try {
      this.db.exec(`
        ALTER TABLE user_stats ADD COLUMN best_round_date DATETIME;
        ALTER TABLE user_stats ADD COLUMN best_game_date DATETIME;
      `);
      console.log('✅ Migration to version 2 completed');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
    }
  }

  updateVersion() {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO db_version (version) VALUES (?)');
    stmt.run([this.currentVersion]);
    stmt.free();
  }
}

module.exports = DatabaseSchema;