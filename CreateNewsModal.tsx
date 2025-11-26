import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { NewsItem } from '@/hooks/useNews';

interface CreateNewsModalProps {
  onClose: () => void;
  onSubmit: (news: Omit<NewsItem, 'id' | 'createdAt' | 'commentsCount'>) => void;
}

export default function CreateNewsModal({ onClose, onSubmit }: CreateNewsModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  
  // 从新闻链接加载内容（模拟功能）
  const handleLoadFromUrl = () => {
    if (!newsUrl.trim()) {
      toast.error('请输入新闻链接');
      return;
    }
    
    // 简单的URL验证
    try {
      new URL(newsUrl);
    } catch (e) {
      toast.error('请输入有效的URL');
      return;
    }
    
    setIsLoadingFromUrl(true);
    
    // 模拟从链接加载内容的过程
    setTimeout(() => {
      // 这里只是模拟，实际应用中可能需要调用后端API来提取网页内容
      toast.success('已从链接加载新闻信息，您可以进行编辑');
      setIsLoadingFromUrl(false);
    }, 1500);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('请输入新闻标题');
      return;
    }
    
    if (!content.trim()) {
      toast.error('请输入新闻内容');
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟提交延迟
    setTimeout(() => {
      onSubmit({
        title,
        content,
        newsUrl: newsUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      
      // 重置表单
      setTitle('');
      setContent('');
      setNewsUrl('');
      setImageUrl('');
      setIsSubmitting(false);
      onClose();
    }, 800);
  };
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
      >
        <motion.div 
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              创建新闻主题
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              aria-label="关闭"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  新闻标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入新闻标题"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {title.length}/100
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="newsUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  新闻链接
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="newsUrl"
                    value={newsUrl}
                    onChange={(e) => setNewsUrl(e.target.value)}
                    placeholder="请输入新闻原文链接"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <motion.button
                    type="button"
                    onClick={handleLoadFromUrl}
                    disabled={isLoadingFromUrl || !newsUrl.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    whileHover={!isLoadingFromUrl ? { scale: 1.02 } : {}}
                    whileTap={!isLoadingFromUrl ? { scale: 0.98 } : {}}
                  >
                    {isLoadingFromUrl ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin mr-1"></i>
                        加载中
                      </>
                    ) : (
                      <>
                        <i className="fas fa-link mr-1"></i>
                        加载内容
                      </>
                    )}
                  </motion.button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  输入新闻链接可自动提取内容，支持常见新闻网站
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  新闻内容概括
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入新闻内容概括..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[150px]"
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {content.length}/1000
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  图片URL（可选）
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="请输入图片URL"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  支持JPG、PNG等常见图片格式
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      创建中...
                    </>
                  ) : (
                    '创建'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}