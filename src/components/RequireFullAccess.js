import { Navigate } from 'react-router-dom';
import StorageService from '../utils/StorageService';

/**
 * Renders children only if user is logged in.
 * Otherwise redirects to login.
 */
const RequireFullAccess = ({ children }) => {
  const loginInfo = StorageService.getLoginInfo();
  const user = loginInfo?.user;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default RequireFullAccess;
