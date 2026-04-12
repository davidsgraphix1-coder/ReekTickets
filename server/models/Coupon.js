const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
	if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
		supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
	}
	return supabase;
}

const TABLE = 'coupons';

async function getAllCoupons() {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getCouponById(id) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createCoupon(coupon) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).insert([coupon]).single();
	if (error) throw error;
	return data;
}

async function updateCoupon(id, updates) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteCoupon(id) {
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase not configured');
	const { data, error } = await client.from(TABLE).delete().eq('id', id);
	if (error) throw error;
	return data;
}

module.exports = {
	getAllCoupons,
	getCouponById,
	createCoupon,
	updateCoupon,
	deleteCoupon,
};
