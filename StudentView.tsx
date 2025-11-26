import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { NewsItem, useNews } from '@/hooks/useNews';
import NewsCard from '@/components/NewsCard';

export default function StudentView() {
  const { theme } = useTheme();
  const { news } = useNews();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popularity'>('newest');

  // 过滤和排序新闻
  const filteredNews = [...news]
    .filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        // 按评论数排序（模拟热度）
        return b.commentsCount - a.commentsCount;
      }
    });

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          新闻评论课堂
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400">
          参与讨论，分享您的观点
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
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">排序方式:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                sortBy === 'newest' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              最新
            </button>
            <button
              type="button"
              onClick={() => setSortBy('popularity')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                sortBy === 'popularity' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              热门
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((newsItem) => (
            <NewsCard 
              key={newsItem.id}
              news={newsItem}
              isTeacherView={false}
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
              {searchTerm ? '没有找到匹配的新闻，请尝试其他关键词。' : '老师还没有发布任何新闻主题，请稍后再来查看。'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}