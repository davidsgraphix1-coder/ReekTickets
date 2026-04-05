const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const TABLE = 'wallets';

async function getAllWallets() {
	const { data, error } = await supabase.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getWalletById(id) {
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createWallet(wallet) {
	const { data, error } = await supabase.from(TABLE).insert([wallet]).single();
	if (error) throw error;
	return data;
}

async function updateWallet(id, updates) {
	const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteWallet(id) {
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw error;
	return data;
}

module.exports = {
	getAllWallets,
	getWalletById,
	createWallet,
	updateWallet,
	deleteWallet,
};
