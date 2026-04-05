const { connectDB } = require('../config/db');

// Helper functions for Supabase 'payments' table
const getPaymentById = async (id) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const createPayment = async (paymentData) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('payments').insert(paymentData).select().single();
  if (error) throw error;
  return data;
};

const updatePayment = async (id, updates) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deletePayment = async (id) => {
  const supabase = await connectDB();
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
  return true;
};

module.exports = {
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
