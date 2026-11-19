import http from 'http';
import bcrypt from 'bcryptjs';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { getOrCreateSettings } from './services/settingsService.js';
import { seedDemoData } from './scripts/seedDemo.js';
import { Admin } from './models/Admin.js';
import { initSocket } from './services/socketService.js';

async function startServer() {
  try {
    await connectDB();
    await getOrCreateSettings();
    await seedDemoData();

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash('AdminSpeed2026!', 10);
      await Admin.create({
        name: 'Speed Admin',
        email: 'admin@speedbikerental.com',
        passwordHash,
        role: 'superadmin',
        isActive: true,
      });
      console.log('[Startup] Default admin created: admin@speedbikerental.com / AdminSpeed2026!');
    }
  } catch (err) {
    console.warn(
      `[Startup] Database connection note (${err.message}). Activating in-memory store for development/preview.`
    );
  }

  const app = createApp();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`[API] Speed Bike Rental API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

startServer();
