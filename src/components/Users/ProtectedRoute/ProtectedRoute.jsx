import React, { useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    // Synchronous check for faster performance
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Quick validation without parsing if basic data missing
    if (!token || !user) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      if (!parsedUser?.email) {
        // Clean up and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }
    } catch {
      // Clean up corrupted data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      return;
    }

    // All checks passed
    setIsChecking(false);
  }, [navigate]);

  // Show minimal loading only during check
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;