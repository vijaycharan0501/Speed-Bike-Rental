import { useEffect } from 'react';
import { subscribeToRealtimeEvent } from '../services/socket';

/**
 * Custom React hook for live synchronization of bike collections.
 * Updates state instantly when bikes are created, updated, or deleted by the admin.
 *
 * @param {Array} bikes - current state array of bikes
 * @param {Function} setBikes - React state setter for bikes
 * @param {Function} onRefresh - optional callback to re-fetch when reconnected
 */
export function useRealtimeBikes(bikes, setBikes, onRefresh = null) {
  useEffect(() => {
    // 1. Bike Created
    const unsubCreated = subscribeToRealtimeEvent('bike:created', (newBike) => {
      if (!newBike || !newBike._id) return;
      setBikes((prev) => {
        const exists = prev.some((b) => b._id === newBike._id || b.slug === newBike.slug);
        if (exists) {
          return prev.map((b) =>
            b._id === newBike._id || b.slug === newBike.slug ? { ...b, ...newBike } : b
          );
        }
        return [newBike, ...prev];
      });
    });

    // 2. Bike Updated (price, details, specs, images)
    const unsubUpdated = subscribeToRealtimeEvent('bike:updated', (updatedBike) => {
      if (!updatedBike || !updatedBike._id) return;
      setBikes((prev) =>
        prev.map((b) =>
          b._id === updatedBike._id || b.slug === updatedBike.slug
            ? { ...b, ...updatedBike }
            : b
        )
      );
    });

    // 3. Bike Availability Changed
    const unsubAvailability = subscribeToRealtimeEvent(
      'bike:availabilityChanged',
      ({ id, slug, availabilityStatus }) => {
        setBikes((prev) =>
          prev.map((b) =>
            b._id === id || b.slug === slug ? { ...b, availabilityStatus } : b
          )
        );
      }
    );

    // 4. Bike Deleted
    const unsubDeleted = subscribeToRealtimeEvent('bike:deleted', ({ id, slug }) => {
      setBikes((prev) => prev.filter((b) => b._id !== id && b.slug !== slug));
    });

    // 5. Reconnected Sync
    const unsubReconnected = subscribeToRealtimeEvent('realtime:reconnected', () => {
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubAvailability();
      unsubDeleted();
      unsubReconnected();
    };
  }, [setBikes, onRefresh]);
}

/**
 * Custom React hook for live synchronization of a single bike details page.
 */
export function useRealtimeSingleBike(bike, setBike, onRefresh = null) {
  useEffect(() => {
    if (!bike) return;

    const unsubUpdated = subscribeToRealtimeEvent('bike:updated', (updated) => {
      if (!updated) return;
      if (
        (bike._id && updated._id === bike._id) ||
        (bike.slug && updated.slug?.toLowerCase() === bike.slug.toLowerCase())
      ) {
        setBike((prev) => ({ ...prev, ...updated }));
      }
    });

    const unsubAvailability = subscribeToRealtimeEvent(
      'bike:availabilityChanged',
      ({ id, slug, availabilityStatus }) => {
        if (
          (bike._id && id === bike._id) ||
          (bike.slug && slug?.toLowerCase() === bike.slug.toLowerCase())
        ) {
          setBike((prev) => ({ ...prev, availabilityStatus }));
        }
      }
    );

    const unsubDeleted = subscribeToRealtimeEvent('bike:deleted', ({ id, slug }) => {
      if (
        (bike._id && id === bike._id) ||
        (bike.slug && slug?.toLowerCase() === bike.slug.toLowerCase())
      ) {
        setBike(null);
      }
    });

    const unsubReconnected = subscribeToRealtimeEvent('realtime:reconnected', () => {
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    });

    return () => {
      unsubUpdated();
      unsubAvailability();
      unsubDeleted();
      unsubReconnected();
    };
  }, [bike, setBike, onRefresh]);
}
