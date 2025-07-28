import { useState, useEffect } from 'react';
import authService from '../services/authService';
import socketService from '../services/socketService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initialize app - check for stored login first
  useEffect(() => {
    initializeAuth();
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // Check for stored login first
      const storedUser = await authService.autoLogin();
      
      if (storedUser) {
        await establishUserSession(storedUser);
        console.log('✅ Auto-login successful:', storedUser.displayName);
      } else {
        console.log('📝 No stored login found');
      }
    } catch (error) {
      console.error('❌ App initialization error:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

const establishUserSession = async (userData) => {
  try {
    console.log('🔄 Setting user state for:', userData.displayName); // ADD THIS
    setUser(userData);
    setIsLoggedIn(true);
    
    console.log('🔌 Connecting to socket...'); // ADD THIS
    await socketService.connect();
    console.log('✅ Socket connected, socket ID:', socketService.socket?.id); // ADD THIS
    
    console.log('🔐 Attempting socket authentication for:', userData.username); // ADD THIS
    const authResult = await socketService.authenticateUser(userData.username);
    console.log('🔐 Socket auth result:', authResult); // ADD THIS
    
    console.log('✅ User session established with socket authentication');
  } catch (error) {
    console.error('❌ Socket authentication failed:', error.message);
    setUser(userData);
    setIsLoggedIn(true);
  }
};

  // Handle successful login
  const handleLoginSuccess = async (userData) => {
    try {
      await establishUserSession(userData);
      console.log('✅ Login complete, connected to game server');
    } catch (error) {
      console.error('❌ Failed to connect to game server:', error);
      // Could show an alert here, but for now just log
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      socketService.disconnect();
      
      // Reset auth state
      setUser(null);
      setIsLoggedIn(false);
      
      console.log('👋 Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  return {
    isLoggedIn,
    user,
    isCheckingAuth,
    handleLoginSuccess,
    handleSignOut
  };
};