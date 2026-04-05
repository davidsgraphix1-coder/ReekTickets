const { connectDB } = require('../config/db');

// Helper functions for Supabase 'users' table
const getUserByEmail = async (email) => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
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

const deleteUser = async (id) => {
	const supabase = await connectDB();
	const { error } = await supabase.from('users').delete().eq('id', id);
	if (error) throw error;
	return true;
};

module.exports = {
	getUserByEmail,
	createUser,
	updateUser,
	deleteUser,
};
