import React from 'react';
import { motion } from 'framer-motion';
import { Viewpoint } from '@/hooks/useViewpoints';

interface ViewpointCardProps {
  viewpoint: Viewpoint;
  onDelete: (id: string) => void;
  onAgree: (id: string) => void;
  currentUserId: string;
  isTeacher: boolean;
}

export default function ViewpointCard({ 
  viewpoint, 
  onDelete, 
  onAgree, 
  currentUserId, 
  isTeacher 
}: ViewpointCardProps) {
  const isOwnViewpoint = viewpoint.userId === currentUserId;
  
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {viewpoint.userName}
          </h4>
          <div className="flex items-center mt-1">
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-md text-xs">
              {viewpoint.category}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {new Date(viewpoint.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        
        {(isOwnViewpoint || isTeacher) && (
          <button
            onClick={() => onDelete(viewpoint.id)}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
            aria-label="删除观点"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
        {viewpoint.content}
      </p>
      
      <div className="flex items-center justify-between">
        <motion.button
          onClick={() => onAgree(viewpoint.id)}
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="fas fa-thumbs-up mr-1"></i>
          <span>{viewpoint.agreeCount}</span>
        </motion.button>
        
        {/* 可以添加更多交互功能，如回复、分享等 */}
      </div>
    </motion.div>
  );
}