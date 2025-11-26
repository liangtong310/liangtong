import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ViewpointFormProps {
  onSubmit: (content: string, category: string) => void;
}

export default function ViewpointForm({ onSubmit }: ViewpointFormProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('请输入您的观点内容');
      return;
    }
    
    if (!category.trim()) {
      alert('请选择观点类别');
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟提交延迟
    setTimeout(() => {
      onSubmit(content.trim(), category.trim());
      setContent('');
      setIsSubmitting(false);
    }, 500);
  };
  
  // 预定义的观点类别
  const categories = [
    '政治观点',
    '经济分析',
    '社会影响',
    '文化视角',
    '教育意义',
    '个人感受',
    '其他'
  ];
  
  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          您的观点
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请分享您对这则新闻的看法和观点..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white min-h-[120px]"
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {content.length}/500
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          观点类别
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <motion.label
              key={cat}
              className={`px-4 py-2 rounded-md cursor-pointer transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <input
                type="radio"
                name="category"
                value={cat}
                checked={category === cat}
                onChange={(e) => setCategory(e.target.value)}
                className="sr-only"
              />
              {cat}
            </motion.label>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!isSubmitting ? { scale: 1.03 } : {}}
          whileTap={!isSubmitting ? { scale: 0.97 } : {}}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-circle-notch fa-spin mr-2"></i>
              提交中...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane mr-2"></i>
              提交观点
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}