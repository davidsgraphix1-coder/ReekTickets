const { connectDB } = require('../config/db');

// Normalize phone number to standard format (233 + 9 digits)
const normalizePhone = (phone) => {
	if (!phone) return '';
	let clean = String(phone).trim();
	clean = clean.replace(/\s+/g, '').replace(/^\+/, '');
	if (clean.startsWith('0')) {
		clean = `233${clean.slice(1)}`;
	}
	if (!clean.startsWith('233')) {
		clean = `233${clean}`;
	}
	return clean;
};

// Helper functions for Supabase 'users' table
const getUserByEmail = async (email) => {
	const supabase = await connectDB();
	const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
	if (error && error.code !== 'PGRST116') throw error;
	return data || null;
};

const getUserByPhone = async (phone) => {
	const supabase = await connectDB();
	const normalizedPhone = normalizePhone(phone);
	
	// Try exact match first
	let { data, error } = await supabase.from('users').select('*').eq('phone', normalizedPhone).single();
	if (!error) return data;
	
	// If no exact match, try to find user by checking variations
	// This handles cases where the phone was stored in a different format
	const { data: allUsers, error: allError } = await supabase.from('users').select('*');
	if (allError) throw allError;
	
	const user = allUsers?.find(u => normalizePhone(u.phone) === normalizedPhone);
	return user || null;
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
