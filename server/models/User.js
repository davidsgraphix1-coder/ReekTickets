const { connectDB } = require('../config/db');

// Helper functions for Supabase 'users' table
const getUserByEmail = async (email) => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
	if (error && error.code !== 'PGRST116') throw error;
	return data || null;
};

const getUserByPhone = async (phone) => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
	if (error && error.code !== 'PGRST116') throw error;
	return data || null;
};

const createUser = async (userData) => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').insert(userData).select().single();
	if (error) throw error;
	return data;
};

const updateUser = async (id, updates) => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
	if (error) throw error;
	return data;
};

const getUserById = async (id) => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
	if (error && error.code !== 'PGRST116') throw error;
	return data || null;
};

const deleteUser = async (id) => {
	const supabase = await connectDB();
	const { error } = await supabase.from('users').delete().eq('id', id);
	if (error) throw error;
	return true;
};

const getAllUsers = async () => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
	if (error) throw error;
	return data || [];
};

module.exports = {
	getUserByEmail,
	getUserByPhone,
	createUser,
	updateUser,
	getUserById,
	deleteUser,
	getAllUsers,
};
