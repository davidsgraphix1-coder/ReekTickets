
const dotenv = require('dotenv');
const { getUserByEmail } = require('./models/User');
const { getEventById } = require('./models/Event');
const { createVendorApplication, deleteAllVendorApplications } = require('./models/VendorApplication');

dotenv.config();


const seedVendorApplications = async () => {
  try {
    // TODO: Implement fetching vendors and events from Supabase if needed
    // For now, just clear all vendor applications and insert a sample
    await deleteAllVendorApplications();
    const sampleApplication = {
      vendor: 'sample-vendor-id',
      event: 'sample-event-id',
      vendorType: 'food',
      payableAmount: 500,
      status: 'pending',
      applicationDate: new Date('2024-03-15'),
    };
    await createVendorApplication(sampleApplication);
    console.log('Vendor applications seeded successfully');
  } catch (error) {
    console.error('Error seeding vendor applications:', error);
  }
};

const runSeed = async () => {
  await seedVendorApplications();
  process.exit(0);
};

runSeed();