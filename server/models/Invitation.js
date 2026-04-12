const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
	if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
		supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
	}
	return supabase;
}

const TABLE = 'invitations';

async function getAllInvitations() {
	const { data, error } = await supabase.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getInvitationById(id) {
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createInvitation(invitation) {
	const { data, error } = await supabase.from(TABLE).insert([invitation]).single();
	if (error) throw error;
	return data;
}

async function updateInvitation(id, updates) {
	const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteInvitation(id) {
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw error;
	return data;
}

module.exports = {
	getAllInvitations,
	getInvitationById,
	createInvitation,
	updateInvitation,
	deleteInvitation,
};
