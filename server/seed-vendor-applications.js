const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const VendorApplication = require('./models/VendorApplication');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedVendorApplications = async () => {
  try {
    // Get existing vendors and events
    const vendors = await User.find({ role: 'vendor' }).limit(3);
    const events = await Event.find().limit(3);

    if (vendors.length === 0 || events.length === 0) {
      console.log('No vendors or events found. Please create some first.');
      return;
    }

    // Clear existing applications
    await VendorApplication.deleteMany({});

    // Create sample applications
    const applications = [
      {
        vendor: vendors[0]._id,
        event: events[0]._id,
        vendorType: 'food',
        payableAmount: 500,
        status: 'pending',
        applicationDate: new Date('2024-03-15'),
      },
      {
        vendor: vendors[0]._id,
        event: events[1]._id,
        vendorType: 'merchandise',
        payableAmount: 300,
        status: 'approved',
        applicationDate: new Date('2024-03-10'),
        booth: 'A12',
      },
      {
        vendor: vendors.length > 1 ? vendors[1]._id : vendors[0]._id,
        event: events[0]._id,
        vendorType: 'services',
        payableAmount: 200,
        status: 'rejected',
        applicationDate: new Date('2024-03-05'),
        notes: 'Booth space unavailable',
      },
      {
        vendor: vendors.length > 1 ? vendors[1]._id : vendors[0]._id,
        event: events.length > 1 ? events[1]._id : events[0]._id,
        vendorType: 'entertainment',
        payableAmount: 800,
        status: 'pending',
        applicationDate: new Date('2024-03-20'),
      },
      {
        vendor: vendors.length > 2 ? vendors[2]._id : vendors[0]._id,
        event: events.length > 2 ? events[2]._id : events[0]._id,
        vendorType: 'food',
        payableAmount: 450,
        status: 'approved',
        applicationDate: new Date('2024-03-12'),
        booth: 'B08',
      },
    ];

    await VendorApplication.insertMany(applications);
    console.log('Vendor applications seeded successfully');

  } catch (error) {
    console.error('Error seeding vendor applications:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedVendorApplications();
  process.exit(0);
};

runSeed();