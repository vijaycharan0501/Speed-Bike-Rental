import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page Not Found');
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <span className="rounded-xl bg-brand-black px-3.5 py-1.5 font-display text-sm font-extrabold text-brand-yellow">
        404
      </span>
      <h1 className="mt-4 text-3xl font-extrabold text-brand-black sm:text-4xl">
        Road Not Found
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        The page you are looking for doesn’t exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link to="/bikes" className="btn-secondary">
          Explore Bikes
        </Link>
      </div>
    </div>
  );
}
