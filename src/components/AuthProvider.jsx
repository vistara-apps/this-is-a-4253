import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/auth';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await auth.getCurrentSession();
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Get subscription status
          const subscriptionStatus = await auth.checkSubscriptionStatus(session.user.id);
          setSubscription(subscriptionStatus);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Get subscription status when user signs in
        try {
          const subscriptionStatus = await auth.checkSubscriptionStatus(session.user.id);
          setSubscription(subscriptionStatus);
        } catch (error) {
          console.error('Error getting subscription status:', error);
        }
      } else {
        setSubscription(null);
      }
      
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    setLoading(true);
    try {
      const result = await auth.signUp(email, password, userData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await auth.signIn(email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      setUser(null);
      setSession(null);
      setSubscription(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await auth.signInWithGoogle();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await auth.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await auth.updatePassword(newPassword);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      await auth.updateProfile(updates);
    } catch (error) {
      throw error;
    }
  };

  const checkUsageLimits = async (action) => {
    if (!user) return { current: 0, limit: 0, canPerformAction: false };
    
    try {
      return await auth.checkUsageLimits(user.id, action);
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return { current: 0, limit: 0, canPerformAction: false };
    }
  };

  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const subscriptionStatus = await auth.checkSubscriptionStatus(user.id);
      setSubscription(subscriptionStatus);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    updateProfile,
    checkUsageLimits,
    refreshSubscription,
    isAuthenticated: !!user,
    isSubscribed: subscription?.isActive || false
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
