const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
	if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
		supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
	}
	return supabase;
}

const TABLE = 'announcements';

async function getAllAnnouncements() {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getAnnouncementById(id) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createAnnouncement(announcement) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).insert([announcement]).single();
	if (error) throw error;
	return data;
}

async function updateAnnouncement(id, updates) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteAnnouncement(id) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).delete().eq('id', id);
	if (error) throw error;
	return data;
}

module.exports = {
	getAllAnnouncements,
	getAnnouncementById,
	createAnnouncement,
	updateAnnouncement,
	deleteAnnouncement,
};
