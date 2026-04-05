const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const TABLE = 'sales_agents';

async function getAllSalesAgents() {
	const { data, error } = await supabase.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getSalesAgentById(id) {
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createSalesAgent(agent) {
	const { data, error } = await supabase.from(TABLE).insert([agent]).single();
	if (error) throw error;
	return data;
}

async function updateSalesAgent(id, updates) {
	const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteSalesAgent(id) {
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
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