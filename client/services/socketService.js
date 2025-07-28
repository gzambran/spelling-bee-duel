import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = 'https://duel.zambrano.nyc';
    this.eventListeners = new Map();
    this.authenticatedUser = null; // Store authenticated user data
    this.isAuthenticated = false;
  }

  // Connect to the server
  connect() {
    if (this.socket) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      console.log('🔌 Connecting to server:', this.serverUrl);
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 10
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server:', this.socket.id);
        this.setupEventListeners();
        
        // Re-authenticate if we have user data
        if (this.authenticatedUser && !this.isAuthenticated) {
          this.authenticateUser(this.authenticatedUser.username)
            .then(() => {
              console.log('🔐 Re-authenticated after reconnection');
              resolve();
            })
            .catch((error) => {
              console.warn('⚠️ Re-authentication failed:', error.message);
              resolve(); // Still resolve to allow connection
            });
        } else {
          resolve();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('📴 Disconnected from server:', reason);
        this.isAuthenticated = false;
        // Let socket.io handle reconnection automatically
      });
    });
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from server...');
      this.socket.disconnect();
      this.socket = null;
      this.isAuthenticated = false;
    }
  }

  // Generic emit with promise-based response and timeout
  emitWithCallback(event, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout: Please try again`));
      }, 10000);

      this.socket.emit(event, data, (response) => {
        clearTimeout(timeout);
        
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Request failed. Please try again.'));
        }
      });
    });
  }

  // NEW: Authenticate user for stats tracking
  async authenticateUser(username) {
    try {
      if (!username) {
        throw new Error('Username is required for authentication');
      }

      const response = await this.emitWithCallback('authenticate-user', { username });
      
      this.authenticatedUser = { username, userId: response.userId };
      this.isAuthenticated = true;
      
      console.log(`🔐 Authenticated user: ${username} (ID: ${response.userId})`);
      return response;
    } catch (error) {
      this.isAuthenticated = false;
      this.authenticatedUser = null;
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  // NEW: Get authenticated user info
  getAuthenticatedUser() {
    return this.authenticatedUser;
  }

  // NEW: Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated && this.authenticatedUser !== null;
  }

  // Room management methods
  async createRoom(playerName) {
    const response = await this.emitWithCallback('create-room', { playerName });
    console.log('🏠 Room created:', response.roomCode);
    return response;
  }

  async joinRoom(roomCode, playerName) {
    const response = await this.emitWithCallback('join-room', { roomCode, playerName });
    console.log('🚪 Joined room:', roomCode);
    return response;
  }

  // Game control methods
  async setPlayerReady(ready = true) {
    const response = await this.emitWithCallback('player-ready', { ready });
    console.log('✅ Player ready status set:', ready);
    return response;
  }

  // Submit complete round results to server
  async submitRoundResults(words, totalScore) {
    const response = await this.emitWithCallback('submit-round-results', { words, totalScore });
    console.log('📊 Round results submitted:', words.length, 'words,', totalScore, 'points');
    return response;
  }

  // NEW: Stats API methods using fetch for REST endpoints
  async fetchPersonalStats(userId) {
    try {
      const response = await fetch(`${this.serverUrl}/api/stats/personal/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('📈 Personal stats fetched:', data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch personal stats');
      }
    } catch (error) {
      console.error('❌ Error fetching personal stats:', error.message);
      throw error;
    }
  }

  async fetchHeadToHeadStats(userId) {
    try {
      const response = await fetch(`${this.serverUrl}/api/stats/head-to-head/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('🤝 Head-to-head stats fetched:', data.data.length, 'opponents');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch head-to-head stats');
      }
    } catch (error) {
      console.error('❌ Error fetching head-to-head stats:', error.message);
      throw error;
    }
  }

  async fetchCompleteStats(userId) {
    try {
      const response = await fetch(`${this.serverUrl}/api/stats/complete/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('🎯 Complete stats fetched for user:', data.data.user.displayName);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch complete stats');
      }
    } catch (error) {
      console.error('❌ Error fetching complete stats:', error.message);
      throw error;
    }
  }

  async fetchGlobalLeaderboard(type, limit = 10) {
    try {
      const response = await fetch(`${this.serverUrl}/api/stats/leaderboard/${type}?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`🏆 Global ${type} leaderboard fetched:`, data.data.records.length, 'records');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error.message);
      throw error;
    }
  }

  // NEW: Combined method to get all stats for a user
  async fetchAllUserStats(userId) {
    try {
      const [personalStats, headToHeadStats] = await Promise.all([
        this.fetchPersonalStats(userId),
        this.fetchHeadToHeadStats(userId)
      ]);

      return {
        personal: personalStats,
        headToHead: headToHeadStats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error fetching all user stats:', error.message);
      throw error;
    }
  }

  // NEW: Login with authentication (combines HTTP login + socket auth)
  async loginAndAuthenticate(username) {
    try {
      // First, login via HTTP to get user data
      const loginResponse = await fetch(`${this.serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      const loginData = await loginResponse.json();
      
      if (!loginData.success) {
        throw new Error(loginData.error || 'Login failed');
      }

      // Then authenticate via socket for stats tracking
      if (this.socket) {
        await this.authenticateUser(username);
      }

      console.log(`🎯 User logged in and authenticated: ${loginData.user.displayName}`);
      return loginData.user;
    } catch (error) {
      console.error('❌ Login and authentication failed:', error.message);
      throw error;
    }
  }

  // NEW: Validate stored user session
  async validateStoredUser(username) {
    try {
      const response = await fetch(`${this.serverUrl}/api/auth/validate/${username}`);
      const data = await response.json();
      
      if (data.success) {
        // Also authenticate via socket if connected
        if (this.socket) {
          try {
            await this.authenticateUser(username);
          } catch (authError) {
            console.warn('⚠️ Socket authentication failed during validation:', authError.message);
            // Don't fail the entire validation if socket auth fails
          }
        }
        
        console.log(`✅ User session validated: ${data.user.displayName}`);
        return data.user;
      } else {
        throw new Error(data.error || 'Session validation failed');
      }
    } catch (error) {
      console.error('❌ User validation failed:', error.message);
      throw error;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(callback);

    // If socket exists, set up the listener immediately
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    // Remove from socket if it exists
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Set up all stored event listeners when socket connects/reconnects
  setupEventListeners() {
    if (!this.socket) return;

    // CRITICAL FIX: Remove all existing listeners first to prevent duplicates
    this.socket.removeAllListeners();

    // Set up all stored event listeners
    for (const [event, callbacks] of this.eventListeners.entries()) {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
    }
    
    console.log('✅ Event listeners set up, total events:', this.eventListeners.size);
  }

  setupRecordNotificationHandlers() {
    // Listen for round-ended events with record notifications
    this.on('round-ended', (data) => {
      if (data.recordNotifications && this.authenticatedUser) {
        const myRecords = data.recordNotifications[this.socket?.id];
        if (myRecords && myRecords.roundRecords.length > 0) {
          console.log('🎉 Round records broken:', myRecords.roundRecords);
          // Emit custom event for UI to handle
          this.emit('records-broken', {
            type: 'round',
            records: myRecords.roundRecords,
            data: data
          });
        }
      }
    });

    // Listen for final results with record notifications
    this.on('show-final-results', (data) => {
      if (data.recordNotifications && this.authenticatedUser) {
        const myRecords = data.recordNotifications[this.socket?.id];
        if (myRecords && myRecords.gameRecords.length > 0) {
          console.log('🎉 Game records broken:', myRecords.gameRecords);
          // Emit custom event for UI to handle
          this.emit('records-broken', {
            type: 'game',
            records: myRecords.gameRecords,
            data: data
          });
        }
      }
    });
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error.message);
        }
      });
    }
  }

  initializeRecordNotifications() {
    this.setupRecordNotificationHandlers();
    console.log('🎯 Record notification system initialized');
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;