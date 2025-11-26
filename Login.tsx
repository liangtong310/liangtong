import React, { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Login() {
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('请输入用户名');
      return;
    }

    setIsSubmitting(true);

    // 模拟登录请求延迟
    setTimeout(() => {
      // 为教师和学生生成不同的ID格式，但都允许使用任意姓名登录
      const selectedUser = { 
        id: role === 'teacher' ? `teacher_${Date.now()}` : `student_${Date.now()}`, 
        name: username, 
        role: role 
      };

      setUser(selectedUser);
      setIsAuthenticated(true);
      toast.success(`欢迎，${selectedUser.name}!`);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* 登录卡片 */}
      <motion.div 
        className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-gray-800/90 shadow-2xl overflow-hidden backdrop-blur-sm border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 卡片头部 - 美化的封面区域 */}
        <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-comments text-white text-4xl"></i>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-white">新闻评论教学智能体</h1>
            </motion.div>
          </div>
          {/* 装饰图形 */}
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white/10 to-transparent"></div>
          <div className="absolute top-5 right-5 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-5 left-10 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* 卡片内容 */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleLogin}>
            {/* 角色选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择身份
              </label>
              <div className="flex space-x-4">
                <motion.label 
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="teacher" 
                    checked={role === 'teacher'}
                    onChange={() => setRole('teacher')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    <i className="fas fa-user-tie mr-1"></i> 教师
                  </span>
                </motion.label>
                <motion.label 
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="student" 
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    <i className="fas fa-user-graduate mr-1"></i> 学生
                  </span>
                </motion.label>
              </div>
            </div>

            {/* 用户名输入 */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {role === 'teacher' ? '教师姓名' : '您的姓名'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className={`fas ${role === 'teacher' ? 'fa-user-tie' : 'fa-user-graduate'} text-gray-400`}></i>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'teacher' ? '请输入您的姓名' : '请输入您的姓名'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
            </div>

            {/* 登录按钮 */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  登录中...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  登录
                </>
              )}
            </motion.button>
          </form>

          {/* 登录提示 */}
          <motion.div 
            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="mb-1 flex items-center justify-center">
              <i className="fas fa-info-circle mr-1 text-blue-500"></i>
              {role === 'teacher' ? '请输入您的真实姓名' : '请输入您的姓名'}
            </p>
            <p className="text-xs mt-2 bg-blue-50 dark:bg-blue-900/30 py-2 px-3 rounded-md">
              登录后可以参与新闻讨论或管理学生观点
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}