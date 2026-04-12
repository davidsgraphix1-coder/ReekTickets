const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
	if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
		supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
	}
	return supabase;
}

const TABLE = 'sales_agents';

async function getAllSalesAgents() {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getSalesAgentById(id) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createSalesAgent(agent) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).insert([agent]).single();
	if (error) throw error;
	return data;
}

async function updateSalesAgent(id, updates) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteSalesAgent(id) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).delete().eq('id', id);
	if (error) throw error;
	return data;
}

module.exports = {
	getAllSalesAgents,
	getSalesAgentById,
	createSalesAgent,
	updateSalesAgent,
	deleteSalesAgent,
};