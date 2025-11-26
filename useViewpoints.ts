import { useState, useEffect } from 'react';

// 观点接口
export interface Viewpoint {
  id: string;
  newsId: string;
  userId: string;
  userName: string;
  content: string;
  category: string;
  agreeCount: number;
  createdAt: string;
}

// 模拟初始观点数据
const initialViewpointsData: Viewpoint[] = [
  {
    id: 'vp_1',
    newsId: '1',
    userId: '2',
    userName: '学生甲',
    content: '我认为AI在教育中的应用前景广阔，可以根据学生的学习情况提供个性化的学习方案，大大提高学习效率。',
    category: '教育意义',
    agreeCount: 5,
    createdAt: '2025-11-25T11:00:00Z',
  },
  {
    id: 'vp_2',
    newsId: '1',
    userId: '3',
    userName: '学生乙',
    content: '虽然AI技术很先进，但教育的本质是人与人之间的交流和情感传递，这是AI无法替代的。',
    category: '个人感受',
    agreeCount: 8,
    createdAt: '2025-11-25T11:30:00Z',
  },
  {
    id: 'vp_3',
    newsId: '1',
    userId: '4',
    userName: '学生丙',
    content: '数据隐私是AI在教育应用中必须重视的问题，学生的个人学习数据需要得到妥善保护。',
    category: '社会影响',
    agreeCount: 6,
    createdAt: '2025-11-25T14:15:00Z',
  },
  {
    id: 'vp_4',
    newsId: '2',
    userId: '2',
    userName: '学生甲',
    content: '气候变化对发展中国家的影响更为严重，国际社会应该给予更多支持和帮助。',
    category: '政治观点',
    agreeCount: 7,
    createdAt: '2025-11-24T15:00:00Z',
  },
  {
    id: 'vp_5',
    newsId: '2',
    userId: '3',
    userName: '学生乙',
    content: '发展可持续农业技术是应对气候变化影响的有效途径，应该加大研发投入。',
    category: '经济分析',
    agreeCount: 9,
    createdAt: '2025-11-24T16:20:00Z',
  },
];

export function useViewpoints() {
  const [viewpoints, setViewpoints] = useState<Viewpoint[]>([]);
  
  // 从本地存储加载观点数据
  useEffect(() => {
    const storedViewpoints = localStorage.getItem('viewpoints');
    if (storedViewpoints) {
      setViewpoints(JSON.parse(storedViewpoints));
    } else {
      // 如果没有存储的数据，使用初始数据
      setViewpoints(initialViewpointsData);
      localStorage.setItem('viewpoints', JSON.stringify(initialViewpointsData));
    }
  }, []);
  
  // 保存观点数据到本地存储
  useEffect(() => {
    if (viewpoints.length > 0) {
      localStorage.setItem('viewpoints', JSON.stringify(viewpoints));
    }
  }, [viewpoints]);
  
  // 添加观点
  const addViewpoint = (viewpoint: Viewpoint) => {
    setViewpoints(prevViewpoints => [viewpoint, ...prevViewpoints]);
  };
  
  // 更新观点
  const updateViewpoint = (updatedViewpoint: Viewpoint) => {
    setViewpoints(prevViewpoints => 
      prevViewpoints.map(viewpoint => 
        viewpoint.id === updatedViewpoint.id ? updatedViewpoint : viewpoint
      )
    );
  };
  
  // 删除观点
  const deleteViewpoint = (id: string) => {
    setViewpoints(prevViewpoints => prevViewpoints.filter(viewpoint => viewpoint.id !== id));
  };
  
  return {
    viewpoints,
    addViewpoint,
    updateViewpoint,
    deleteViewpoint,
  };
}