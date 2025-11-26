import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AuthContext } from '@/contexts/authContext';
import { useNews } from '@/hooks/useNews';
import { useViewpoints } from '@/hooks/useViewpoints';
import ViewpointForm from '@/components/ViewpointForm';
import ViewpointCard from '@/components/ViewpointCard';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { news, updateNews } = useNews();
  const { viewpoints, addViewpoint, deleteViewpoint, updateViewpoint } = useViewpoints();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'agreeCount'>('newest');
  
  const newsItem = news.find(item => item.id === id);
  
  if (!newsItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">未找到该新闻</p>
      </div>
    );
  }
  
  // 获取当前新闻的所有观点
  const newsViewpoints = viewpoints.filter(vp => vp.newsId === id);
  
  // 过滤和排序观点
  const filteredViewpoints = [...newsViewpoints]
    .filter(vp => !selectedCategory || vp.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.agreeCount - a.agreeCount;
      }
    });
  
  // 获取所有唯一的观点类别
  const categories = [...new Set(newsViewpoints.map(vp => vp.category))];
  
  const handleAddViewpoint = (content: string, category: string) => {
    if (!user) return;
    
    const newViewpoint = {
      id: `vp_${Date.now()}`,
      newsId: id!,
      userId: user.id,
      userName: user.name,
      content,
      category,
      agreeCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    addViewpoint(newViewpoint);
    
    // 更新新闻的评论数
    updateNews({
      ...newsItem,
      commentsCount: newsItem.commentsCount + 1
    });
    
    toast.success('观点提交成功！');
  };
  
  const handleDeleteViewpoint = (viewpointId: string) => {
    if (window.confirm('确定要删除这条观点吗？')) {
      deleteViewpoint(viewpointId);
      
      // 更新新闻的评论数
      updateNews({
        ...newsItem,
        commentsCount: Math.max(0, newsItem.commentsCount - 1)
      });
      
      toast.success('观点已删除');
    }
  };
  
  const handleAgree = (viewpointId: string) => {
    const viewpoint = viewpoints.find(vp => vp.id === viewpointId);
    if (viewpoint) {
      updateViewpoint({
        ...viewpoint,
        agreeCount: viewpoint.agreeCount + 1
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 新闻内容 */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {newsItem.title}
          </h1>
          {user?.role === 'teacher' && (
            <div className="flex space-x-2">
              <button 
                onClick={() => navigate(`/comment-generation/${id}`)}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <i className="fas fa-magic mr-1"></i> 生成评论
              </button>
              <button 
                onClick={() => navigate(`/viewpoint-visualization/${id}`)}
                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                <i className="fas fa-chart-network mr-1"></i> 观点图谱
              </button>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>发布时间: {new Date(newsItem.createdAt).toLocaleString()}</span>
          <span className="mx-2">•</span>
          <span>评论数: {newsItem.commentsCount}</span>
        </div>
        
         <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {newsItem.content}
          </p>
          
          {newsItem.newsUrl && (
            <div className="my-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center">
              <i className="fas fa-link text-blue-500 mr-2"></i>
              <a 
                href={newsItem.newsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
              >
                查看原文链接
              </a>
            </div>
          )}
          
          {newsItem.imageUrl && (
            <div className="my-4 rounded-lg overflow-hidden">
              <img 
                src={newsItem.imageUrl} 
                alt={newsItem.title} 
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </motion.div>
      
      {/* 学生提交观点 */}
      {user?.role === 'student' && (
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            分享您的观点
          </h2>
          <ViewpointForm onSubmit={handleAddViewpoint} />
        </motion.div>
      )}
      
      {/* 观点筛选和排序 */}
      {(categories.length > 0 || user?.role === 'teacher') && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            所有观点 ({filteredViewpoints.length})
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* 分类筛选 */}
            {categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">分类:</span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                      selectedCategory === null 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    全部
                  </button>
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm font-medium ${
                        selectedCategory === category 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${index === categories.length - 1 ? 'rounded-r-lg' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 排序 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">排序:</span>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                    sortBy === 'newest' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  最新
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('agreeCount')}
                  className={`px-3 py-1 text-sm font-medium rounded-r-lg ${
                    sortBy === 'agreeCount' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  赞同数
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 观点列表 */}
      <div className="space-y-4">
        {filteredViewpoints.length > 0 ? (
          filteredViewpoints.map((viewpoint) => (
            <ViewpointCard 
              key={viewpoint.id}
              viewpoint={viewpoint}
              onDelete={handleDeleteViewpoint}
              onAgree={handleAgree}
              currentUserId={user?.id || ''}
              isTeacher={user?.role === 'teacher'}
            />
          ))
        ) : (
          <motion.div 
            className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fas fa-comment-slash text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无观点
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === 'student' ? '成为第一个分享观点的人吧！' : '还没有学生分享观点，请鼓励学生参与讨论。'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}