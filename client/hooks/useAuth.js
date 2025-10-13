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
      // Don't fail - let user continue to practice mode
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const establishUserSession = async (userData) => {
    // ALWAYS set user state first - this is non-blocking
    setUser(userData);
    setIsLoggedIn(true);
    console.log('✅ User state set for:', userData.displayName);
    
    // Try to establish socket connection in the background
    // This should NEVER throw errors that block the user
    try {
      console.log('🔌 Attempting socket connection in background...');
      await socketService.connect();
      console.log('✅ Socket connected, ID:', socketService.socket?.id);
      
      // Try to authenticate - but don't block if it fails
      try {
        await socketService.authenticateUser(userData.username);
        console.log('✅ Socket authentication successful');
      } catch (authError) {
        // Authentication failed, but user can still use practice mode
        console.warn('⚠️ Socket authentication failed (non-blocking):', authError.message);
        console.log('ℹ️ User can still access practice mode');
      }
    } catch (connectionError) {
      // Connection failed, but user can still use practice mode
      console.warn('⚠️ Socket connection failed (non-blocking):', connectionError.message);
      console.log('ℹ️ User can still access practice mode offline');
    }
  };

  // Handle successful login
  const handleLoginSuccess = async (userData) => {
    try {
      await establishUserSession(userData);
      console.log('✅ Login complete');
    } catch (error) {
      // Never block on connection errors
      console.warn('⚠️ Connection issues during login (non-blocking):', error.message);
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