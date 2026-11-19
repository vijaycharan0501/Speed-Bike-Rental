import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
      <p className="mt-3 text-sm font-medium text-brand-muted">{message}</p>
    </div>
  );
}
