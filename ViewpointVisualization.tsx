import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNews } from '@/hooks/useNews';
import { useViewpoints } from '@/hooks/useViewpoints';

export default function ViewpointVisualization() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { news } = useNews();
  const { viewpoints } = useViewpoints();
  
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  
  const newsItem = news.find(item => item.id === id);
  const newsViewpoints = viewpoints.filter(vp => vp.newsId === id);
  
  if (!newsItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">未找到该新闻</p>
      </div>
    );
  }
  
  // 按类别统计观点数量和赞同数
  const categoryStats = newsViewpoints.reduce((acc, viewpoint) => {
    if (!acc[viewpoint.category]) {
      acc[viewpoint.category] = {
        count: 0,
        agreeCount: 0,
        viewpoints: [] as typeof viewpoints,
      };
    }
    
    acc[viewpoint.category].count += 1;
    acc[viewpoint.category].agreeCount += viewpoint.agreeCount;
    acc[viewpoint.category].viewpoints.push(viewpoint);
    
    return acc;
  }, {} as Record<string, {
    count: number;
    agreeCount: number;
    viewpoints: typeof viewpoints;
  }>);
  
  // 准备图表数据
  const barChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    name: category,
    观点数量: stats.count,
    赞同总数: stats.agreeCount,
  }));
  
  const pieChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    name: category,
    value: stats.count,
  }));
  
  // 图表颜色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          观点图谱可视化
        </motion.h1>
        <div className="flex items-center space-x-3">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                chartType === 'bar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              柱状图
            </button>
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-sm font-medium rounded-r-lg ${
                chartType === 'pie' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              饼图
            </button>
          </div>
          
          <button 
            onClick={() => navigate(`/news/${id}`)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <i className="fas fa-arrow-left mr-1"></i> 返回
          </button>
        </div>
      </div>
      
      {/* 新闻标题 */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          新闻标题: {newsItem.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          总观点数: {newsViewpoints.length} | 总赞同数: {Object.values(categoryStats).reduce((sum, stats) => sum + stats.agreeCount, 0)}
        </p>
      </motion.div>
      
      {/* 图表容器 */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          观点分布统计
        </h2>
        
        <div className="h-80">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                <Legend />
                <Bar dataKey="观点数量" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="赞同总数" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} 条观点`, '数量']}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
      
      {/* 各类别观点详情 */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          观点详情分析
        </h2>
        
        <div className="space-y-6">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3">
                <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-3 mb-3">
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {stats.count} 条观点
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-sm">
                    {stats.agreeCount} 个赞同
                  </div>
                  <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                    平均赞同: {Math.round(stats.agreeCount / stats.count)}
                  </div>
                </div>
                
                {/* 显示赞同数最高的观点 */}
                {stats.viewpoints.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      最受欢迎的观点:
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <p className="text-gray-900 dark:text-white text-sm">
                        {stats.viewpoints.sort((a, b) => b.agreeCount - a.agreeCount)[0].content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.viewpoints.sort((a, b) => b.agreeCount - a.agreeCount)[0].userName}
                        </span>
                        <span className="text-xs text-blue-600 flex items-center">
                          <i className="fas fa-thumbs-up mr-1"></i>
                          {stats.viewpoints.sort((a, b) => b.agreeCount - a.agreeCount)[0].agreeCount}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}