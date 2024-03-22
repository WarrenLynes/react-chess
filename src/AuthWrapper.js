import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";


export default function AuthWrapper({ children }) {
  const { authenticated } = useSelector(({ auth }) => auth);
  const location = useLocation();

  if (!authenticated)
    return <Navigate to='/login' state={{ from: location }} replace />

  return children;
}