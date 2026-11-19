import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io = null;

/**
 * Initialize Socket.IO with HTTP server and CORS configuration
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || env.frontendOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev to ensure real-time connects reliably
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  io.on('connection', (socket) => {
    // Client joins public real-time room by default
    socket.join('public:updates');

    // Admin clients can request joining admin notifications room
    socket.on('join:admin', () => {
      socket.join('admin:updates');
    });

    socket.on('disconnect', () => {
      // Clean up handled automatically by Socket.IO
    });
  });

  console.log('[Realtime] Socket.IO server initialized');
  return io;
}

export function getIO() {
  return io;
}

/**
 * Broadcast when a bike is created
 */
export function emitBikeCreated(bike) {
  if (!io) return;
  // Ensure public safe payload (strip internal sensitive fields if any)
  const safeBike = { ...bike };
  io.to('public:updates').emit('bike:created', safeBike);
  io.to('admin:updates').emit('bike:created', safeBike);
  console.log(`[Realtime] Emitted bike:created for "${bike.name}"`);
}

/**
 * Broadcast when a bike is updated (name, price, specs, images, etc.)
 */
export function emitBikeUpdated(bike) {
  if (!io) return;
  const safeBike = { ...bike };
  io.to('public:updates').emit('bike:updated', safeBike);
  io.to('admin:updates').emit('bike:updated', safeBike);
  console.log(`[Realtime] Emitted bike:updated for "${bike.name}" (${bike._id})`);
}

/**
 * Broadcast when a bike's availability changes
 */
export function emitBikeAvailabilityChanged({ id, slug, availabilityStatus }) {
  if (!io) return;
  io.to('public:updates').emit('bike:availabilityChanged', { id, slug, availabilityStatus });
  io.to('admin:updates').emit('bike:availabilityChanged', { id, slug, availabilityStatus });
  console.log(`[Realtime] Emitted bike:availabilityChanged for ${slug} -> ${availabilityStatus}`);
}

/**
 * Broadcast when a bike is deleted
 */
export function emitBikeDeleted({ id, slug }) {
  if (!io) return;
  io.to('public:updates').emit('bike:deleted', { id, slug });
  io.to('admin:updates').emit('bike:deleted', { id, slug });
  console.log(`[Realtime] Emitted bike:deleted for ${slug} (${id})`);
}

/**
 * Broadcast when website content / settings are updated
 */
export function emitContentUpdated(settings) {
  if (!io) return;
  io.to('public:updates').emit('content:updated', settings);
  io.to('admin:updates').emit('content:updated', settings);
  console.log('[Realtime] Emitted content:updated');
}

/**
 * Broadcast when a new booking is submitted (to admin dashboard in real-time)
 */
export function emitBookingCreated(booking) {
  if (!io) return;
  io.to('admin:updates').emit('booking:created', booking);
  console.log(`[Realtime] Emitted booking:created to admin room: ${booking.bookingReference}`);
}
