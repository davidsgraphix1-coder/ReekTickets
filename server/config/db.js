const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const initSupabase = () => {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set for Supabase provider');
  }

  supabase = createClient(url, key);
  console.log('Supabase client initialized');
  return supabase;
};

const connectDB = async () => {
  return initSupabase();
};

module.exports = { connectDB, initSupabase };

