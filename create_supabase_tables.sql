-- Create users table in Supabase
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'attendee',
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  password TEXT NOT NULL,
  otp_code TEXT,
  otp_expiry TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  failed_attempts INTEGER DEFAULT 0,
  last_failed_attempt TIMESTAMP,
  lock_until TIMESTAMP,
  business_name TEXT,
  contact_number TEXT,
  business_partners JSONB,
  business_details JSONB,
  terms_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create support_chats table
CREATE TABLE support_chats (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  category TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'open',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
