require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.error(
      'Missing admin credentials. Set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.'
    );
    process.exit(1);
  }

  await connectDB();

  try {
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role === 'admin') {
        console.log(`User "${existing.username}" (${email}) is already an admin. Nothing to do.`);
      } else {
        existing.role = 'admin';
        await existing.save();
        console.log(`Promoted existing user "${existing.username}" (${email}) to admin.`);
      }
    } else {
      const admin = await User.create({ username, email, password, role: 'admin' });
      console.log(`Created admin "${admin.username}" (${admin.email}).`);
    }
  } catch (err) {
    console.error(`Failed to seed admin: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
