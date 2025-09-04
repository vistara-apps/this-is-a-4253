import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database schema types
export const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects', 
  AD_VARIATIONS: 'ad_variations',
  SUBSCRIPTIONS: 'subscriptions',
  USAGE_TRACKING: 'usage_tracking'
};

// Helper functions for common database operations
export const dbHelpers = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Project operations
  async createProject(projectData) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .insert([projectData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserProjects(userId) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select(`
        *,
        ad_variations (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Ad variation operations
  async createAdVariations(variations) {
    const { data, error } = await supabase
      .from(TABLES.AD_VARIATIONS)
      .insert(variations)
      .select();
    
    if (error) throw error;
    return data;
  },

  async updateAdVariation(variationId, updates) {
    const { data, error } = await supabase
      .from(TABLES.AD_VARIATIONS)
      .update(updates)
      .eq('ad_variation_id', variationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Usage tracking
  async trackUsage(userId, action, metadata = {}) {
    const { data, error } = await supabase
      .from(TABLES.USAGE_TRACKING)
      .insert([{
        user_id: userId,
        action,
        metadata,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    return data;
  },

  async getUserUsage(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from(TABLES.USAGE_TRACKING)
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
    if (error) throw error;
    return data;
  }
};
