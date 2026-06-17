import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-page"><div className="spinner" /></div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    // Redirect to their correct home
    if (user.role === 'admin')       return <Navigate to="/admin"  replace />;
    if (user.role === 'store_owner') return <Navigate to="/owner"  replace />;
    return <Navigate to="/stores" replace />;
  }

  return children;
}
