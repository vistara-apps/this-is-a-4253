-- AdSpark Database Schema
-- This schema implements the data model specified in the PRD

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (matches PRD User entity)
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status VARCHAR(50) DEFAULT 'inactive' CHECK (payment_status IN ('active', 'inactive', 'past_due', 'canceled')),
  connected_accounts JSONB DEFAULT '[]'::jsonb,
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro')),
  usage_limits JSONB DEFAULT '{"ad_generations": 0, "automated_posts": 0}'::jsonb
);

-- Projects table (matches PRD Project entity)
CREATE TABLE projects (
  project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Ad Variations table (matches PRD AdVariation entity)
CREATE TABLE ad_variations (
  ad_variation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  asset_url TEXT NOT NULL,
  copy TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'posted', 'failed', 'archived')),
  performance_metrics JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  social_media_post_id VARCHAR(255) DEFAULT NULL
);

-- Subscriptions table for Stripe integration
CREATE TABLE subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table for monitoring and billing
CREATE TABLE usage_tracking (
  usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'ad_generation', 'social_post', 'ai_analysis'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  billing_period DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Social media accounts table
CREATE TABLE social_accounts (
  account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  platform_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);

-- Performance analytics table
CREATE TABLE performance_analytics (
  analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_variation_id UUID NOT NULL REFERENCES ad_variations(ad_variation_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ad_variation_id, date)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_ad_variations_project_id ON ad_variations(project_id);
CREATE INDEX idx_ad_variations_platform ON ad_variations(platform);
CREATE INDEX idx_ad_variations_status ON ad_variations(status);
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_billing_period ON usage_tracking(billing_period);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_performance_analytics_ad_variation_id ON performance_analytics(ad_variation_id);
CREATE INDEX idx_performance_analytics_date ON performance_analytics(date);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Ad variations policies
CREATE POLICY "Users can view own ad variations" ON ad_variations FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.project_id = ad_variations.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create ad variations for own projects" ON ad_variations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.project_id = ad_variations.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update own ad variations" ON ad_variations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.project_id = ad_variations.project_id AND projects.user_id = auth.uid())
);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);

-- Social accounts policies
CREATE POLICY "Users can manage own social accounts" ON social_accounts FOR ALL USING (auth.uid() = user_id);

-- Performance analytics policies
CREATE POLICY "Users can view own analytics" ON performance_analytics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ad_variations 
    JOIN projects ON projects.project_id = ad_variations.project_id 
    WHERE ad_variations.ad_variation_id = performance_analytics.ad_variation_id 
    AND projects.user_id = auth.uid()
  )
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_variations_updated_at BEFORE UPDATE ON ad_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
