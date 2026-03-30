import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../hooks/useAuth';
import { refreshToken } from '../services/auth';

/**
 * Protected route wrapper component
 * Redirects unauthenticated users to /admin/login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const { company_slug } = useParams();

  const {
    data: refreshResponse,
    isLoading: isCheckingAuth,
    isError: isRefreshError,
  } = useQuery({
    queryKey: ['auth-check-refresh'],
    queryFn: refreshToken,
    enabled: !isAuthenticated,
    retry: false,
  });

  const loginPath = company_slug ? `/${company_slug}/login` : '/admin/login';

  if (isAuthenticated) {
    return children;
  }

  if (isCheckingAuth) {
    return null;
  }

  if (isRefreshError || !refreshResponse?.success) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
