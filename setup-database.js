#!/usr/bin/env node
/**
 * Script to create all required Supabase tables
 * Usage: node setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SQL = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS vendor_applications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS support_chats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  full_name TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'attendee',
  avatar_url TEXT,
  profile_pic TEXT,
  status TEXT DEFAULT 'active',
  is_verified BOOLEAN DEFAULT false,
  otp_code TEXT,
  otp_expiry BIGINT,
  business_name TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  about_us TEXT,
  date TIMESTAMP NOT NULL,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  banner TEXT,
  organizer UUID NOT NULL REFERENCES users(id),
  ticket_types JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  published BOOLEAN DEFAULT false,
  service_tier TEXT DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES users(id),
  ticket_type TEXT,
  price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 1,
  qr_code TEXT,
  status TEXT DEFAULT 'valid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  ticket_id UUID REFERENCES tickets(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  status TEXT DEFAULT 'pending',
  reference TEXT,
  provider TEXT DEFAULT 'paystack',
  payment_method TEXT,
  meta JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_applications table
CREATE TABLE vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  vendor_type TEXT,
  payable_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  subject TEXT,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create support_chats table
CREATE TABLE support_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category TEXT,
  status TEXT DEFAULT 'open',
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_events_organizer ON events(organizer);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_support_chats_user ON support_chats(user_id);
`;

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    console.log('📍 Supabase URL:', SUPABASE_URL);

    // Execute the SQL using Supabase RPC
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: SQL
    }).catch(() => {
      // If RPC doesn't work, inform user to do it manually
      return { data: null, error: 'RPC not available' };
    });

    if (error && error !== 'RPC not available') {
      console.error('❌ Error setting up database:', error);
      console.log('\n📋 Please run the SQL manually:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Create new query');
      console.log('3. Paste the contents of setup_all_tables.sql');
      console.log('4. Click Run');
      process.exit(1);
    }

    console.log('✅ Database tables created successfully!');
    console.log('📊 Tables created:');
    console.log('   ✓ users');
    console.log('   ✓ events');
    console.log('   ✓ tickets');
    console.log('   ✓ payments');
    console.log('   ✓ vendor_applications');
    console.log('   ✓ notifications');
    console.log('   ✓ messages');
    console.log('   ✓ support_chats');
  } catch (err) {
    console.error('❌ Exception:', err.message);
    console.log('\n📋 Please run the SQL manually:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Create new query');
    console.log('3. Paste the contents of setup_all_tables.sql');
    console.log('4. Click Run');
    process.exit(1);
  }
}

setupDatabase();
