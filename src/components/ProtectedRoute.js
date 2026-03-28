import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import StorageService from '../utils/StorageService';

/**
 * A wrapper component to protect routes from unauthorized access.
 * If the user is not authenticated, they will be redirected to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const logininfo = useSelector((state) => state.logininfo);
  const isLoggedIn = !!(logininfo?.token || StorageService.isLoggedIn());

  // If the user is not authenticated, redirect to the login page
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the children
  return children;
};

export default ProtectedRoute;
