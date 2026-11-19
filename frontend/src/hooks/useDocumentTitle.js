import { useEffect } from 'react';

export function useDocumentTitle(title, description = '') {
  useEffect(() => {
    document.title = title ? `${title} | Speed Bike Rental` : 'Speed Bike Rental — Ride More. Worry Less.';
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}
