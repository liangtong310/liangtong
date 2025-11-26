import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

export default function Home() {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }
  
  return <Navigate to="/student" replace />;
}