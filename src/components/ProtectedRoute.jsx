import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

/**
 * Protected route wrapper component
 * Redirects unauthenticated users to /admin/login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
