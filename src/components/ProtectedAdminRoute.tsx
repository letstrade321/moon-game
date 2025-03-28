import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { encryption } from '@/lib/encryption';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const location = useLocation();
  
  try {
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    // Decrypt and verify admin session
    const decryptedSession = JSON.parse(encryption.decrypt(adminSession));
    const sessionAge = Date.now() - decryptedSession.timestamp;
    
    // Check if session is expired (24 hours)
    if (sessionAge > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('admin_session');
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error('Admin session verification error:', error);
    localStorage.removeItem('admin_session');
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }
};

export default ProtectedAdminRoute; 