const { connectDB } = require('../config/db');

// Helper functions for Supabase 'support_messages' table
const getSupportMessageById = async (id) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('support_messages').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const createSupportMessage = async (msgData) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('support_messages').insert(msgData).select().single();
  if (error) throw error;
  return data;
};

const updateSupportMessage = async (id, updates) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('support_messages').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteSupportMessage = async (id) => {
  const supabase = await connectDB();
  const { error } = await supabase.from('support_messages').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getSupportMessageById,
  createSupportMessage,
  updateSupportMessage,
  deleteSupportMessage,
};
