const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const initSupabase = () => {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  
  if (!url || !key) {
    console.error('[DB] Missing Supabase credentials:', {
      url: url ? '✓' : '✗ SUPABASE_URL missing',
      key: key ? '✓' : '✗ SUPABASE_KEY missing'
    });
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set for Supabase provider');
  }

  supabase = createClient(url, key);
  console.log('[DB] Supabase client initialized');
  return supabase;
};

const connectDB = async () => {
  return initSupabase();
};

module.exports = { connectDB, initSupabase };

