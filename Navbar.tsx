import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AuthContext } from '@/contexts/authContext';
import { useTheme } from '@/hooks/useTheme';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast.success('已成功登出');
    navigate('/login');
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <i className="fas fa-comments text-blue-600 text-xl mr-2"></i>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">新闻评论教学智能体</span>
            </motion.div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user?.role === 'teacher' ? (
                <>
                  <Link 
                    to="/teacher" 
                    className="border-blue-500 text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <i className="fas fa-home mr-1"></i>
                    首页
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/student" 
                    className="border-blue-500 text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <i className="fas fa-home mr-1"></i>
                    首页
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="切换主题"
            >
              {theme === 'light' ? (
                <i className="fas fa-moon"></i>
              ) : (
                <i className="fas fa-sun"></i>
              )}
            </button>
            
            <div className="relative">
              <button
                className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                <span className="mr-1">欢迎，{user?.name}</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {user?.role === 'teacher' ? '教师' : '学生'}
                </span>
              </button>
            </div>
            
            <motion.button
              onClick={handleLogout}
              className="ml-3 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              whileHover={{ scale: 1.05 }}whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              退出登录
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}