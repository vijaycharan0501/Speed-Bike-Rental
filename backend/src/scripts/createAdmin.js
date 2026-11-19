import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';

async function run() {
  await connectDB();

  let name = process.env.ADMIN_NAME?.trim();
  let email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  let password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    const rl = readline.createInterface({ input, output });
    try {
      console.log('\n=== Speed Bike Rental — Create / Update Admin Account ===\n');
      name = name || (await rl.question('Admin full name: ')).trim();
      email = email || (await rl.question('Admin email: ')).trim().toLowerCase();
      password = password || (await rl.question('Admin password (min 8 chars): '));
    } finally {
      rl.close();
    }
  }

  if (!name || name.length < 2) {
    throw new Error('Admin name must be at least 2 characters.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    existing.role = 'superadmin';
    await existing.save();
    console.log(`[Admin Setup] Updated existing admin account: ${email}`);
  } else {
    await Admin.create({
      name,
      email,
      passwordHash,
      role: 'superadmin',
      isActive: true,
    });
    console.log(`[Admin Setup] Created new superadmin account: ${email}`);
  }

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('[Admin Setup Error]', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
