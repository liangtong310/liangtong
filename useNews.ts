import { useState, useEffect } from 'react';

// 新闻项接口
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  newsUrl?: string;
  imageUrl?: string;
  createdAt: string;
  commentsCount: number;
}

// 模拟初始新闻数据
const initialNewsData: NewsItem[] = [
  {
    id: '1',
    title: '人工智能技术在教育领域的应用与挑战',
    content: '随着人工智能技术的快速发展，越来越多的教育机构开始探索AI在教学中的应用。从智能辅导系统到个性化学习平台，AI正在改变传统的教育模式。然而，这一变革也带来了数据隐私、算法偏见等诸多挑战。如何平衡技术创新与教育本质，成为当前教育界讨论的热点话题。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=AI%20technology%20in%20education%2C%20classroom%20with%20computers%2C%20interactive%20learning&sign=5467b25f8f52c1a6d1f55f20ebd94f78',
    createdAt: '2025-11-25T10:30:00Z',
    commentsCount: 8,
  },
  {
    id: '2',
    title: '全球气候变化对粮食安全的影响分析',
    content: '全球气候变化正以前所未有的速度影响着我们的星球。极端天气事件频发、温度升高、降水模式改变等因素，对全球粮食生产和供应构成了严峻挑战。专家呼吁国际社会加强合作，共同应对气候变化对粮食安全的威胁，同时推动农业可持续发展。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Climate%20change%20impact%20on%20agriculture%2C%20farmland%20drought%2C%20global%20food%20security&sign=494d19ed045abceb1bf632730d2afeab',
    createdAt: '2025-11-24T14:20:00Z',
    commentsCount: 12,
  },
  {
    id: '3',
    title: '数字经济时代的就业市场变革',
    content: '数字经济的蓬勃发展正在重塑全球就业市场。一方面，新技术创造了大量新兴职业；另一方面，传统行业面临着自动化和智能化带来的转型压力。在这一背景下，劳动力市场对数字技能的需求大幅增加，教育体系和职业培训也需要相应调整，以适应这一变革趋势。',
    createdAt: '2025-11-23T09:15:00Z',
    commentsCount: 6,
  },
];

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  
  // 从本地存储加载新闻数据
  useEffect(() => {
    const storedNews = localStorage.getItem('news');
    if (storedNews) {
      setNews(JSON.parse(storedNews));
    } else {
      // 如果没有存储的数据，使用初始数据
      setNews(initialNewsData);
      localStorage.setItem('news', JSON.stringify(initialNewsData));
    }
  }, []);
  
  // 保存新闻数据到本地存储
  useEffect(() => {
    if (news.length > 0) {
      localStorage.setItem('news', JSON.stringify(news));
    }
  }, [news]);
  
  // 添加新闻
  const addNews = (newsItem: Omit<NewsItem, 'id' | 'createdAt' | 'commentsCount'>) => {
    const newNews: NewsItem = {
      ...newsItem,
      id: `news_${Date.now()}`,
      createdAt: new Date().toISOString(),
      commentsCount: 0,
    };
    
    setNews(prevNews => [newNews, ...prevNews]);
  };
  
  // 更新新闻
  const updateNews = (updatedNews: NewsItem) => {
    setNews(prevNews => 
      prevNews.map(news => 
        news.id === updatedNews.id ? updatedNews : news
      )
    );
  };
  
  // 删除新闻
  const deleteNews = (id: string) => {
    setNews(prevNews => prevNews.filter(news => news.id !== id));
  };
  
  return {
    news,
    addNews,
    updateNews,
    deleteNews,
  };
}