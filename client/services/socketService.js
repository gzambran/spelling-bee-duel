import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.serverUrl = 'http://192.168.1.3:3000';
    this.eventListeners = new Map();
    this.connectionPromise = null;
  }

  // Connect to the server
  connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to server:', this.serverUrl);
        
        this.socket = io(this.serverUrl, {
          transports: ['websocket'],
          timeout: 10000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          maxReconnectionAttempts: 5
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('✅ Connected to server:', this.socket.id);
          this.connected = true;
          resolve(this.socket.id);
        });

        // Connection failed
        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection failed:', error.message);
          this.connected = false;
          reject(error);
        });

        // Disconnection handling
        this.socket.on('disconnect', (reason) => {
          console.log('📴 Disconnected from server:', reason);
          this.connected = false;
          this.connectionPromise = null;
          
          // Notify listeners about disconnection
          this.emit('disconnected', { reason });
        });

        // Reconnection handling
        this.socket.on('reconnect', (attemptNumber) => {
          console.log('🔄 Reconnected to server, attempt:', attemptNumber);
          this.connected = true;
          this.emit('reconnected', { attemptNumber });
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Failed to reconnect to server');
          this.connected = false;
          this.emit('reconnect_failed');
        });

        // Set up ping-pong for connection testing
        this.socket.on('pong', (data) => {
          console.log('🏓 Pong received:', data);
        });

      } catch (error) {
        console.error('❌ Socket initialization error:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from server...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connectionPromise = null;
    }
  }

  // Test connection with ping
  ping() {
    if (this.socket && this.connected) {
      this.socket.emit('ping');
      return true;
    }
    return false;
  }

  // Generic emit with promise-based response
  emitWithCallback(event, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout for event: ${event}`));
      }, 10000);

      this.socket.emit(event, data, (response) => {
        clearTimeout(timeout);
        
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Unknown server error'));
        }
      });
    });
  }

  // Room management methods
  async createRoom(playerName) {
    try {
      const response = await this.emitWithCallback('create-room', { playerName });
      console.log('🏠 Room created:', response.roomCode);
      return response;
    } catch (error) {
      console.error('❌ Failed to create room:', error.message);
      throw error;
    }
  }

  async joinRoom(roomCode, playerName) {
    try {
      const response = await this.emitWithCallback('join-room', { roomCode, playerName });
      console.log('🚪 Joined room:', roomCode);
      return response;
    } catch (error) {
      console.error('❌ Failed to join room:', error.message);
      throw error;
    }
  }

  async reconnectToRoom(roomCode, playerName) {
    try {
      const response = await this.emitWithCallback('reconnect-to-room', { roomCode, playerName });
      console.log('🔄 Reconnected to room:', roomCode);
      return response;
    } catch (error) {
      console.error('❌ Failed to reconnect to room:', error.message);
      throw error;
    }
  }

  // Game control methods
  async setPlayerReady(ready = true) {
    try {
      const response = await this.emitWithCallback('player-ready', { ready });
      console.log('✅ Player ready status set:', ready);
      return response;
    } catch (error) {
      console.error('❌ Failed to set ready status:', error.message);
      throw error;
    }
  }

  // FIX: Remove error logging for invalid words to reduce noise
  async submitWord(word) {
    try {
      const response = await this.emitWithCallback('submit-word', { word });
      console.log('📝 Word submitted:', word, response.points, 'pts');
      return response;
    } catch (error) {
      // Don't log invalid word errors - they're expected during gameplay
      // Only log unexpected errors
      if (!error.message.includes('Invalid word') && 
          !error.message.includes('already submitted') &&
          !error.message.includes('center letter')) {
        console.error('❌ Failed to submit word:', error.message);
      }
      throw error;
    }
  }

  async getGameState() {
    try {
      const response = await this.emitWithCallback('get-game-state');
      return response;
    } catch (error) {
      console.error('❌ Failed to get game state:', error.message);
      throw error;
    }
  }

  async getRoundResults(roundNumber = null) {
    try {
      const response = await this.emitWithCallback('get-round-results', { roundNumber });
      return response;
    } catch (error) {
      console.error('❌ Failed to get round results:', error.message);
      throw error;
    }
  }

  async endRound() {
    try {
      const response = await this.emitWithCallback('end-round');
      console.log('🏁 Round ended manually');
      return response;
    } catch (error) {
      console.error('❌ Failed to end round:', error.message);
      throw error;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(callback);

    // If socket exists, set up the listener
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

  // Internal emit for service events
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Set up all socket event listeners when socket is created
  setupSocketListeners() {
    if (!this.socket) return;

    // Set up all stored event listeners
    for (const [event, callbacks] of this.eventListeners.entries()) {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
    }
  }

  // Utility methods
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  getConnectionState() {
    return {
      connected: this.connected,
      socketId: this.getSocketId(),
      serverUrl: this.serverUrl
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;