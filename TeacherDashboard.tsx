import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { NewsItem, useNews } from '@/hooks/useNews';
import NewsCard from '@/components/NewsCard';
import CreateNewsModal from '@/components/CreateNewsModal';

export default function TeacherDashboard() {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { news, addNews, deleteNews } = useNews();
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤新闻
  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteNews = (id: string) => {
    if (window.confirm('确定要删除这条新闻吗？')) {
      deleteNews(id);
      toast.success('新闻已删除');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          新闻评论教学管理
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理新闻主题，查看学生观点，生成客观评论
        </p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="搜索新闻..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <i className="fas fa-plus mr-2"></i>
          创建新闻主题
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((newsItem) => (
            <NewsCard 
              key={newsItem.id}
              news={newsItem}
              onDelete={() => handleDeleteNews(newsItem.id)}
              isTeacherView={true}
            />
          ))
        ) : (
          <motion.div 
            className="col-span-full flex flex-col items-center justify-center p-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fas fa-newspaper text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              暂无新闻主题
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              {searchTerm ? '没有找到匹配的新闻，请尝试其他关键词。' : '点击"创建新闻主题"按钮开始添加您的第一条新闻。'}
            </p>
            {!searchTerm && (
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="fas fa-plus mr-2"></i>
                创建第一条新闻
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {isModalOpen && <CreateNewsModal onClose={() => setIsModalOpen(false)} onSubmit={addNews} />}
    </div>
  );
}