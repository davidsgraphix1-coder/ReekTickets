const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const TABLE = 'coupons';

async function getAllCoupons() {
	const { data, error } = await supabase.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getCouponById(id) {
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createCoupon(coupon) {
	const { data, error } = await supabase.from(TABLE).insert([coupon]).single();
	if (error) throw error;
	return data;
}

async function updateCoupon(id, updates) {
	const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteCoupon(id) {
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
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
