import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  constructor() {
    this.serverUrl = 'https://duel.zambrano.nyc'; // Use your existing server URL
    this.currentUser = null;
  }

  // Login with username only
  async login(username) {
    try {
      console.log('🔐 Attempting login for:', username);
      
      const response = await fetch(`${this.serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data locally
        await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
        this.currentUser = data.user;
        
        console.log('✅ Login successful:', data.user.displayName);
        return data.user;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  }

  // Check if user is stored locally and validate with server
  async autoLogin() {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      
      if (!storedUser) {
        return null;
      }

      const userData = JSON.parse(storedUser);
      console.log('🔄 Attempting auto-login for:', userData.displayName);

      // Validate with server that user is still active
      const response = await fetch(`${this.serverUrl}/api/auth/validate/${userData.username}`);
      const data = await response.json();

      if (data.success) {
        // Update stored user data with latest from server
        await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
        this.currentUser = data.user;
        
        console.log('✅ Auto-login successful:', data.user.displayName);
        return data.user;
      } else {
        // Clear invalid stored data
        await this.signOut();
        return null;
      }
    } catch (error) {
      console.error('❌ Auto-login error:', error.message);
      // Clear potentially corrupted data
      await this.signOut();
      return null;
    }
  }

  // Sign out - clear stored data
  async signOut() {
    try {
      await AsyncStorage.removeItem('currentUser');
      this.currentUser = null;
      console.log('👋 User signed out');
    } catch (error) {
      console.error('❌ Sign out error:', error.message);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.currentUser;
  }

  // Get user stats (for future use)
  async getUserStats(userId) {
    try {
      const response = await fetch(`${this.serverUrl}/api/stats/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.stats;
      } else {
        throw new Error(data.error || 'Failed to get stats');
      }
    } catch (error) {
      console.error('❌ Get stats error:', error.message);
      throw error;
    }
  }

  // Record game result (for future use)
  async recordGameResult(gameData) {
    try {
      const response = await fetch(`${this.serverUrl}/api/games/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('📊 Game result recorded');
        return data;
      } else {
        throw new Error(data.error || 'Failed to record game');
      }
    } catch (error) {
      console.error('❌ Record game error:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;