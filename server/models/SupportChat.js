const { connectDB } = require('../config/db');

// Helper functions for Supabase 'support_chats' table
const getSupportChatById = async (id) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('support_chats').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const createSupportChat = async (chatData) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('support_chats').insert(chatData).select().single();
  if (error) throw error;
  return data;
};

const findSupportChatByUser = async (userId, status = 'open') => {
  const supabase = await connectDB();
  let query = supabase.from('support_chats').select('*').eq('userId', userId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.limit(1).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const getAllSupportChats = async () => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('support_chats').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return data || [];
};

const updateSupportChat = async (id, updates) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('support_chats').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteSupportChat = async (id) => {
  const supabase = await connectDB();
  const { error } = await supabase.from('support_chats').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getSupportChatById,
  createSupportChat,
  updateSupportChat,
  deleteSupportChat,
};
