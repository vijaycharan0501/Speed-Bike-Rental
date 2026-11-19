import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/LoadingState';

export function ProtectedRoute({ children }) {
  const { admin, checkingAuth } = useAuth();
  const location = useLocation();

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-grey">
        <LoadingState message="Verifying administrator session..." />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
