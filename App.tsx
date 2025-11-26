import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentView from "@/pages/StudentView";
import NewsDetail from "@/pages/NewsDetail";
import CommentGeneration from "@/pages/CommentGeneration";
import ViewpointVisualization from "@/pages/ViewpointVisualization";
import { useState } from "react";
import { AuthContext, UserInfo } from '@/contexts/authContext';
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Empty } from "@/components/Empty";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  // 路由保护组件
  const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (role && user?.role !== role) {
      return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
    }
    
    return children;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, setIsAuthenticated, setUser, logout }}
    >
      {isAuthenticated && <Navbar />}
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 p-4 md:p-6 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/teacher" element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student" element={
              <ProtectedRoute role="student">
                <StudentView />
              </ProtectedRoute>
            } />
            <Route path="/news/:id" element={
              <ProtectedRoute>
                <NewsDetail />
              </ProtectedRoute>
            } />
            <Route path="/comment-generation/:id" element={
              <ProtectedRoute role="teacher">
                <CommentGeneration />
              </ProtectedRoute>
            } />
            <Route path="/viewpoint-visualization/:id" element={
              <ProtectedRoute role="teacher">
                <ViewpointVisualization />
              </ProtectedRoute>
            } />
            <Route path="/my-viewpoints" element={
              <ProtectedRoute role="student">
                <Empty />
              </ProtectedRoute>
            } />
              <Route path="/examples" element={
                <ProtectedRoute>
                  <Empty />
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Empty />
                </ProtectedRoute>
             } />
                <Route path="/resources" element={
                  <ProtectedRoute>
                    <Empty />
                  </ProtectedRoute>
                } />
            </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}
