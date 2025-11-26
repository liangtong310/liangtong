import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '@/contexts/authContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  
  // 教师侧边栏菜单
  const teacherMenuItems = [
    {
      id: 'dashboard',
      name: '控制面板',
      icon: 'fas fa-tachometer-alt',
      path: '/teacher',
    },
    {
      id: 'help',
      name: '使用帮助',
      icon: 'fas fa-question-circle',
      path: '/help',
    },
  ];
  
  // 学生侧边栏菜单
  const studentMenuItems = [
    {
      id: 'discussions',
      name: '讨论主题',
      icon: 'fas fa-comments',
      path: '/student',
    },
    {
      id: 'my-viewpoints',
      name: '我的观点',
      icon: 'fas fa-lightbulb',
      path: '/my-viewpoints',
    },
    {
      id: 'help',
      name: '使用帮助',
      icon: 'fas fa-question-circle',
      path: '/help',
    },
  ];
  
  const menuItems = user?.role === 'teacher' ? teacherMenuItems : studentMenuItems;
  
  return (
    <aside className="w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 hidden md:block overflow-y-auto">
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={item.path}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                <i className={`${item.icon} mr-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}></i>
                {item.name}
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10">
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            教学资源
          </h3>
          <div className="mt-3 space-y-1">
            <Link
              to="/resources"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <i className="fas fa-book mr-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
              评论写作指南
            </Link>
            <Link
              to="/examples"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <i className="fas fa-file-alt mr-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
              优秀案例
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}