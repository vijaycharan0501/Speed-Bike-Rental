import { io } from 'socket.io-client';

let socket = null;
const listeners = new Map();

/**
 * Get or create the shared Socket.IO client instance
 */
export function getSocket() {
  if (!socket) {
    const rawServer = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
    const serverUrl = rawServer
      ? rawServer.replace(/\/api\/?$/, '').replace(/\/$/, '')
      : (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? 'https://speed-bike-rental.onrender.com'
          : window.location.origin);

    const socketUrl = serverUrl.includes(':5173')
      ? serverUrl.replace(':5173', ':5000')
      : serverUrl;

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Realtime] Connected to real-time sync server');
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Realtime] Disconnected from server:', reason);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`[Realtime] Reconnected successfully after ${attempt} attempts`);
      // Trigger all registered re-sync callbacks
      dispatchCustomEvent('realtime:reconnected');
    });

    // Wire global event forwarding
    const events = [
      'bike:created',
      'bike:updated',
      'bike:deleted',
      'bike:availabilityChanged',
      'content:updated',
      'booking:created',
    ];

    events.forEach((ev) => {
      socket.on(ev, (data) => {
        console.log(`[Realtime] Received "${ev}":`, data);
        dispatchCustomEvent(ev, data);
      });
    });
  }

  return socket;
}

/**
 * Dispatch an event to window for decoupled React hook listening
 */
function dispatchCustomEvent(name, detail = null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

/**
 * Subscribe a component or callback to real-time events
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToRealtimeEvent(eventName, callback) {
  // Ensure socket is initialized
  getSocket();

  const handler = (e) => callback(e.detail);
  window.addEventListener(eventName, handler);
  return () => {
    window.removeEventListener(eventName, handler);
  };
}

/**
 * Request joining the admin room (for new booking notifications)
 */
export function joinAdminRealtime() {
  const s = getSocket();
  if (s.connected) {
    s.emit('join:admin');
  } else {
    s.once('connect', () => {
      s.emit('join:admin');
    });
  }
}
