const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodbridge';

console.log('Connecting to:', uri);
mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected successfully');
    const seedDB = require('./seed');
    await seedDB();
    const User = require('./models/User');
    const BloodBank = require('./models/BloodBank');

    console.log('Testing User model count...');
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);

    console.log('Testing BloodBank model count...');
    const bankCount = await BloodBank.countDocuments();
    console.log('BloodBank count:', bankCount);

    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });
