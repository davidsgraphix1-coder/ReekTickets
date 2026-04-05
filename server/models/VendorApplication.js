const { connectDB } = require('../config/db');

// Helper functions for Supabase 'vendor_applications' table
const createVendorApplication = async (applicationData) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from('vendor_applications').insert(applicationData).select().single();
  if (error) throw error;
  return data;
};

const deleteAllVendorApplications = async () => {
  const supabase = await connectDB();
  const { error } = await supabase.from('vendor_applications').delete();
  if (error) throw error;
  return true;
};

module.exports = {
  createVendorApplication,
  deleteAllVendorApplications,
};