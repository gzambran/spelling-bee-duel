class UserRepository {
  constructor(db, saveCallback) {
    this.db = db;
    this.save = saveCallback;
  }

  getByUsername(username) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
    stmt.bind([username]);
    
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
  }

  getByUsernameInsensitive(username) {
    // Try exact match first
    let stmt = this.db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
    stmt.bind([username]);
    
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();

    // Try case-insensitive
    stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND is_active = 1');
    stmt.bind([username]);
    
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
  }

  getById(userId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1');
    stmt.bind([userId]);
    
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
  }

  listAll() {
    const stmt = this.db.prepare('SELECT id, username, display_name, created_at FROM users WHERE is_active = 1 ORDER BY id');
    const users = [];
    
    while (stmt.step()) {
      users.push(stmt.getAsObject());
    }
    stmt.free();
    
    return users;
  }

  create(username, displayName) {
    const insertUser = this.db.prepare('INSERT INTO users (username, display_name) VALUES (?, ?)');
    insertUser.run([username, displayName]);
    insertUser.free();

    const getUserStmt = this.db.prepare('SELECT id FROM users WHERE username = ?');
    getUserStmt.bind([username]);
    getUserStmt.step();
    const userId = getUserStmt.getAsObject().id;
    getUserStmt.free();

    // Create initial stats record
    const insertStats = this.db.prepare('INSERT INTO user_stats (user_id) VALUES (?)');
    insertStats.run([userId]);
    insertStats.free();

    this.save();
    return userId;
  }

  createInitialUsers() {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    countStmt.step();
    const userCount = countStmt.getAsObject().count || 0;
    countStmt.free();

    if (userCount === 0) {
      const initialUsers = [
        { username: 'giancarlos', displayName: 'Giancarlos' },
        { username: 'caroline', displayName: 'Caroline' },
        { username: 'playerA', displayName: 'Player A' },
        { username: 'playerB', displayName: 'Player B' }
      ];

      initialUsers.forEach(user => {
        this.create(user.username, user.displayName);
      });
      
      console.log(`✅ Created ${initialUsers.length} initial users`);
    }
  }

  deactivate(userId) {
    const stmt = this.db.prepare('UPDATE users SET is_active = 0 WHERE id = ?');
    stmt.run([userId]);
    stmt.free();
    this.save();
  }
}

module.exports = UserRepository;