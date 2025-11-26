import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NewsItem } from '@/hooks/useNews';

interface NewsCardProps {
  news: NewsItem;
  isTeacherView: boolean;
  onDelete?: () => void;
}

export default function NewsCard({ news, isTeacherView, onDelete }: NewsCardProps) {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
    >
      {news.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {news.title}
          </h3>
          {isTeacherView && onDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 focus:outline-none"
              aria-label="删除新闻"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {news.content}
        </p>
        
        {news.newsUrl && (
          <div className="flex items-center mb-4 text-xs text-blue-600 dark:text-blue-400">
            <i className="fas fa-link mr-1"></i>
            <a 
              href={news.newsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline truncate"
            >
              查看原文
            </a>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-md text-xs">
            {new Date(news.createdAt).toLocaleDateString()}
          </span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-md text-xs flex items-center">
            <i className="fas fa-comment mr-1"></i>
            {news.commentsCount} 条观点
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <Link
            to={`/news/${news.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isTeacherView ? '查看详情' : '参与讨论'}
            <i className="fas fa-arrow-right ml-1"></i>
          </Link>
          
          {isTeacherView && (
            <div className="flex space-x-2">
              <Link
                to={`/comment-generation/${news.id}`}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs flex items-center"
              >
                <i className="fas fa-magic mr-1"></i> 生成评论
              </Link>
              <Link
                to={`/viewpoint-visualization/${news.id}`}
                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs flex items-center"
              >
                <i className="fas fa-chart-network mr-1"></i> 观点图谱
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}