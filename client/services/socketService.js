import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = 'https://duel.zambrano.nyc';
    this.eventListeners = new Map();
    this.authenticatedUser = null;
    this.isAuthenticated = false;
    // NEW: Track ongoing authentication to prevent race conditions
    this.authenticationPromise = null;
  }

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
              resolve();
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
      });
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from server...');
      this.socket.disconnect();
      this.socket = null;
      this.isAuthenticated = false;
      this.authenticationPromise = null;
    }
  }

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

  async authenticateUser(username) {
    // If authentication is already in progress, wait for it
    if (this.authenticationPromise) {
      console.log('⏳ Authentication already in progress, waiting...');
      return this.authenticationPromise;
    }

    // Create new authentication promise
    this.authenticationPromise = (async () => {
      try {
        if (!username) {
          throw new Error('Username is required for authentication');
        }

        // Ensure socket is connected
        if (!this.socket?.connected) {
          console.log('🔌 Socket not connected, connecting first...');
          await this.connect();
        }

        const response = await this.emitWithCallback('authenticate-user', { username });
        
        this.authenticatedUser = { username, userId: response.userId };
        this.isAuthenticated = true;
        
        console.log(`🔐 Authenticated user: ${username} (ID: ${response.userId})`);
        return response;
      } catch (error) {
        this.isAuthenticated = false;
        console.error('❌ Authentication failed:', error.message);
        throw error;
      } finally {
        // Clear the promise after completion (success or failure)
        this.authenticationPromise = null;
      }
    })();

    return this.authenticationPromise;
  }

  // NEW: Ensure user is authenticated, with retry logic
  async ensureAuthenticated(username, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // If already authenticated, return immediately
        if (this.isAuthenticated && this.authenticatedUser) {
          console.log('✅ Already authenticated');
          return true;
        }

        console.log(`🔐 Authentication attempt ${attempt}/${maxRetries}...`);
        
        // Try to authenticate
        await this.authenticateUser(username);
        return true;
      } catch (error) {
        console.warn(`⚠️ Authentication attempt ${attempt} failed:`, error.message);
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }

  getAuthenticatedUser() {
    return this.authenticatedUser;
  }

  isUserAuthenticated() {
    return this.isAuthenticated && this.authenticatedUser !== null;
  }

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

  async setPlayerReady(ready = true) {
    const response = await this.emitWithCallback('player-ready', { ready });
    console.log('✅ Player ready status set:', ready);
    return response;
  }

  async submitRoundResults(words, totalScore) {
    const response = await this.emitWithCallback('submit-round-results', { words, totalScore });
    console.log('📊 Round results submitted:', words.length, 'words,', totalScore, 'points');
    return response;
  }

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

  async loginAndAuthenticate(username) {
    try {
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

  async validateStoredUser(username) {
    try {
      const response = await fetch(`${this.serverUrl}/api/auth/validate/${username}`);
      const data = await response.json();
      
      if (data.success) {
        if (this.socket) {
          try {
            await this.authenticateUser(username);
          } catch (authError) {
            console.warn('⚠️ Socket authentication failed during validation:', authError.message);
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

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(callback);

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

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    for (const [event, callbacks] of this.eventListeners.entries()) {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
    }
    
    console.log('✅ Event listeners set up, total events:', this.eventListeners.size);
  }

  setupRecordNotificationHandlers() {
    this.on('round-ended', (data) => {
      if (data.recordNotifications && this.authenticatedUser) {
        const myRecords = data.recordNotifications[this.socket?.id];
        if (myRecords && myRecords.roundRecords.length > 0) {
          console.log('🎉 Round records broken:', myRecords.roundRecords);
          this.emit('records-broken', {
            type: 'round',
            records: myRecords.roundRecords,
            data: data
          });
        }
      }
    });

    this.on('show-final-results', (data) => {
      if (data.recordNotifications && this.authenticatedUser) {
        const myRecords = data.recordNotifications[this.socket?.id];
        if (myRecords && myRecords.gameRecords.length > 0) {
          console.log('🎉 Game records broken:', myRecords.gameRecords);
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

const socketService = new SocketService();

export default socketService;