import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Speed Bike Rental] Uncaught runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-4 py-12 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#16181F] p-6 shadow-2xl text-center sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-white sm:text-2xl">
              Something went wrong
            </h2>
            <p className="mt-2 text-xs text-white/70 sm:text-sm">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn-primary flex-1 py-2.5 text-xs font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Page
              </button>
              <a
                href="/"
                className="btn-secondary flex-1 py-2.5 text-xs font-bold border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Home className="h-3.5 w-3.5" />
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
