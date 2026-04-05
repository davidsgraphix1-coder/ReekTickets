const { connectDB } = require('../config/db');

// Helper functions for Supabase 'events' table
const getEventById = async (id) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const createEvent = async (eventData) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('events').insert(eventData).select().single();
  if (error) throw error;
  return data;
};

const updateEvent = async (id, updates) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteEvent = async (id) => {
  const supabase = await connectDB();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
