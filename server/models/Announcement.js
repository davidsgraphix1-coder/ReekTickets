const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const TABLE = 'announcements';

async function getAllAnnouncements() {
	const { data, error } = await supabase.from(TABLE).select('*');
	if (error) throw error;
	return data;
}

async function getAnnouncementById(id) {
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	if (error) throw error;
	return data;
}

async function createAnnouncement(announcement) {
	const { data, error } = await supabase.from(TABLE).insert([announcement]).single();
	if (error) throw error;
	return data;
}

async function updateAnnouncement(id, updates) {
	const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).single();
	if (error) throw error;
	return data;
}

async function deleteAnnouncement(id) {
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
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
