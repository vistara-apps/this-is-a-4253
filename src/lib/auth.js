import { supabase, dbHelpers } from './supabase.js';

export const auth = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      // Create user profile in database
      if (data.user) {
        await dbHelpers.createUser({
          user_id: data.user.id,
          email: data.user.email,
          payment_status: 'inactive',
          connected_accounts: [],
          subscription_tier: 'free',
          usage_limits: {
            ad_generations: 0,
            automated_posts: 0
          }
        });
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) throw error;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Social login with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // Check if user has valid subscription
  async checkSubscriptionStatus(userId) {
    try {
      const user = await dbHelpers.getUserById(userId);
      return {
        isActive: user.payment_status === 'active',
        tier: user.subscription_tier,
        usageLimits: user.usage_limits
      };
    } catch (error) {
      console.error('Check subscription error:', error);
      return {
        isActive: false,
        tier: 'free',
        usageLimits: { ad_generations: 0, automated_posts: 0 }
      };
    }
  },

  // Check usage limits
  async checkUsageLimits(userId, action) {
    try {
      const user = await dbHelpers.getUserById(userId);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const startDate = `${currentMonth}-01`;
      const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
      
      const usage = await dbHelpers.getUserUsage(userId, startDate, endDate);
      const actionCount = usage.filter(u => u.action === action).length;
      
      const limits = user.usage_limits || {};
      const limit = limits[action] || 0;
      
      return {
        current: actionCount,
        limit: limit,
        canPerformAction: limit === -1 || actionCount < limit // -1 means unlimited
      };
    } catch (error) {
      console.error('Check usage limits error:', error);
      return {
        current: 0,
        limit: 0,
        canPerformAction: false
      };
    }
  }
};
