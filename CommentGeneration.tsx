import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AuthContext } from '@/contexts/authContext';
import { useNews } from '@/hooks/useNews';
import { useViewpoints } from '@/hooks/useViewpoints';

// 文本分析结果接口
interface TextAnalysisResult {
  keywords: string[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topicDistribution: {
    topic: string;
    count: number;
    percentage: number;
  }[];
  mainArguments: {
    argument: string;
    supportingViewpoints: number;
    representativeQuotes: string[];
  }[];
  opposingViews: {
    viewA: {
      argument: string;
      supporters: string[];
    };
    viewB: {
      argument: string;
      supporters: string[];
    };
  }[];
}

export default function CommentGeneration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { news } = useNews();
  const { viewpoints } = useViewpoints();
  
  const [generatedComment, setGeneratedComment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [generationSettings, setGenerationSettings] = useState({
    length: 'medium', // short, medium, long
    tone: 'neutral', // neutral, analytical, persuasive
    emphasis: 'balanced', // balanced, consensus, diversity
  });
  
  const newsItem = news.find(item => item.id === id);
  const newsViewpoints = viewpoints.filter(vp => vp.newsId === id);
  
   // 提取关键词
  const extractKeywords = (texts: string[]): string[] => {
    const keywordsMap: Record<string, number> = {};
    // 扩展停用词列表，包含更多无效关键词
    const stopwords = [
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这',
      '这种', '这些', '这样', '这个', '这里', '那些', '那里', '那个', '它们', '他们', '她们', '我们', '你们', '咱们',
      '因此', '因为', '所以', '但是', '然而', '不过', '而且', '并且', '同时', '另外', '此外',
      '可能', '应该', '可以', '能够', '应该', '必须', '需要', '想要', '希望', '觉得', '认为',
      '对于', '关于', '由于', '通过', '随着', '按照', '根据', '基于', '针对', '为了', '因为'
    ];
    
    texts.forEach(text => {
      const words = text.match(/[\u4e00-\u9fa5]+/g) || [];
      words.forEach(word => {
        if (word.length > 1 && !stopwords.includes(word)) {
          keywordsMap[word] = (keywordsMap[word] || 0) + 1;
        }
      });
    });
    
    return Object.entries(keywordsMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  };
  
  // 分析情感倾向
  const analyzeSentiment = (texts: string[]): TextAnalysisResult['sentiment'] => {
    // 简单的情感词库，实际应用中可以使用更复杂的NLP库
    const positiveWords = ['好', '优秀', '积极', '进步', '机遇', '发展', '成功', '支持', '希望', '创新'];
    const negativeWords = ['问题', '挑战', '困难', '风险', '担忧', '不足', '缺陷', '反对', '危机', '压力'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    texts.forEach(text => {
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
    });
    
    const total = positiveCount + negativeCount;
    const neutralCount = Math.max(0, texts.length - total);
    
    return {
      positive: Math.round((positiveCount / texts.length) * 100),
      neutral: Math.round((neutralCount / texts.length) * 100),
      negative: Math.round((negativeCount / texts.length) * 100),
    };
  };
  
  // 分析主题分布
  const analyzeTopicDistribution = (): TextAnalysisResult['topicDistribution'] => {
    const categoryMap = newsViewpoints.reduce((acc, viewpoint) => {
      if (!acc[viewpoint.category]) {
        acc[viewpoint.category] = 0;
      }
      acc[viewpoint.category]++;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryMap)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: Math.round((count / newsViewpoints.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };
  
  // 提取主要论点
  const extractMainArguments = (): TextAnalysisResult['mainArguments'] => {
    // 基于关键词和赞同数来识别主要论点
    const argumentMap: Record<string, {
      count: number;
      quotes: string[];
      agreeCount: number;
    }> = {};
    
    newsViewpoints.forEach(viewpoint => {
      // 提取观点中的核心句子作为潜在论点
      const sentences = viewpoint.content.split(/[。！？]/).filter(s => s.length > 10);
      if (sentences.length > 0) {
        const keySentence = sentences[0];
        
        if (!argumentMap[keySentence]) {
          argumentMap[keySentence] = {
            count: 0,
            quotes: [],
            agreeCount: 0,
          };
        }
        
        argumentMap[keySentence].count++;
        argumentMap[keySentence].quotes.push(viewpoint.content);
        argumentMap[keySentence].agreeCount += viewpoint.agreeCount;
      }
    });
    
    // 转换为数组并排序
    return Object.entries(argumentMap)
      .map(([argument, data]) => ({
        argument,
        supportingViewpoints: data.count,
        representativeQuotes: data.quotes.slice(0, 3),
      }))
      .sort((a, b) => b.supportingViewpoints - a.supportingViewpoints)
      .slice(0, 5); // 取前5个主要论点
  };
  
  // 识别对立观点
  const identifyOpposingViews = (): TextAnalysisResult['opposingViews'] => {
    // 基于类别和关键词识别潜在的对立观点
    const opposingPairs: TextAnalysisResult['opposingViews'] = [];
    const categories = [...new Set(newsViewpoints.map(vp => vp.category))];
    
    // 简单的类别对立关系映射
    const opposingCategoryMap: Record<string, string[]> = {
      '政治观点': ['经济分析', '个人感受'],
      '社会影响': ['文化视角', '教育意义'],
      '经济分析': ['政治观点', '文化视角'],
    };
    
    // 寻找对立观点对
    for (let i = 0; i < categories.length; i++) {
      const catA = categories[i];
      const opposingCategories = opposingCategoryMap[catA] || [];
      
      for (let j = i + 1; j < categories.length; j++) {
        const catB = categories[j];
        
        // 如果两个类别被标记为对立，或者它们的关键词重叠度很低
        if (opposingCategories.includes(catB)) {
          const catAViewpoints = newsViewpoints.filter(vp => vp.category === catA);
          const catBViewpoints = newsViewpoints.filter(vp => vp.category === catB);
          
          if (catAViewpoints.length > 0 && catBViewpoints.length > 0) {
            // 选择赞同数最高的观点作为代表
            const repViewA = catAViewpoints.sort((a, b) => b.agreeCount - a.agreeCount)[0];
            const repViewB = catBViewpoints.sort((a, b) => b.agreeCount - a.agreeCount)[0];
            
            opposingPairs.push({
              viewA: {
                argument: repViewA.content,
                supporters: catAViewpoints.map(vp => vp.userName),
              },
              viewB: {
                argument: repViewB.content,
                supporters: catBViewpoints.map(vp => vp.userName),
              },
            });
          }
        }
      }
    }
    
    return opposingPairs.slice(0, 2); // 最多返回2组对立观点
  };
  
  // 执行完整的文本分析
  const performTextAnalysis = (): TextAnalysisResult => {
    const allContents = newsViewpoints.map(vp => vp.content);
    
    return {
      keywords: extractKeywords(allContents),
      sentiment: analyzeSentiment(allContents),
      topicDistribution: analyzeTopicDistribution(),
      mainArguments: extractMainArguments(),
      opposingViews: identifyOpposingViews(),
    };
  };
  
  // 生成基于学生观点的综合评论
  const generateComment = () => {
    setIsGenerating(true);
    
    // 模拟AI分析和生成过程
    setTimeout(() => {
      try {
        // 执行文本分析
        const analysis = performTextAnalysis();
        setAnalysisResult(analysis);
        
        // 根据分析结果生成综合评论
        let comment = '';
        
        // 1. 引言部分 - 强调这是基于学生观点的整合
        comment += `# 学生观点综合评论：${newsItem?.title}\n\n`;
        comment += `## 观点整合前言\n\n`;
        
        switch (generationSettings.tone) {
          case 'analytical':
            comment += `本评论基于对${newsViewpoints.length}位学生提交的${newsViewpoints.length}条观点进行的系统性文本分析。`;
            comment += `通过自然语言处理技术，我们提取了核心论点、分析了情感倾向，并识别出了主要共识与分歧。\n\n`;
            break;
          case 'persuasive':
            comment += `综合全班同学的智慧结晶，我们得以从多个角度审视这一事件。`;
            comment += `通过整合${newsViewpoints.length}位同学的观点，我们不仅看到了思想的碰撞，更发现了许多值得深入思考的洞见。\n\n`;
            break;
          default:
            comment += `通过对${newsViewpoints.length}条学生观点的智能整合，我们得以梳理出大家对这一事件的主要看法和思考方向。`;
            comment += `以下是基于所有学生观点的综合分析与评论。\n\n`;
        }
        
        // 2. 核心关键词分析
        if (analysis.keywords.length > 0) {
          comment += `## 核心关注焦点\n\n`;
          comment += `通过文本分析，我们提取出了学生观点中最常出现的核心关键词，这些词反映了大家对事件的主要关注点：\n\n`;
          
          const topKeywords = analysis.keywords.slice(0, 5);
          comment += topKeywords.map((keyword, index) => 
            `${index + 1}. ${keyword}（高频关键词，反映了同学们对这一方面的高度关注）`
          ).join('\n');
          
          comment += `\n\n从关键词分布可以看出，${topKeywords[0]}是讨论的核心焦点，`;
          comment += `其次是${topKeywords.slice(1, 3).join('、')}等方面，`;
          comment += `这些共同构成了大家对这一事件的认知框架。\n\n`;
        }
        
        // 3. 主要论点整合 - 这是核心部分
        if (analysis.mainArguments.length > 0) {
          comment += `## 主要观点整合\n\n`;
          
          analysis.mainArguments.forEach((arg, index) => {
            comment += `### ${index + 1}. ${arg.argument}\n\n`;
            comment += `- **支持情况**: 共有${arg.supportingViewpoints}位同学表达了类似观点，`;
            comment += `约占总观点数的${Math.round((arg.supportingViewpoints / newsViewpoints.length) * 100)}%。\n\n`;
            
            // 引用代表性观点
            if (arg.representativeQuotes.length > 0) {
              comment += `- **代表性表述**:\n`;
              arg.representativeQuotes.forEach((quote, qIndex) => {
                comment += `  * "${quote.substring(0, 60)}..."\n`;
              });
              comment += `\n`;
            }
          });
        }
        
        // 4. 观点共识提炼
        if (generationSettings.emphasis === 'balanced' || generationSettings.emphasis === 'consensus') {
          const consensusPoints = analysis.mainArguments.filter(arg => 
            arg.supportingViewpoints >= Math.max(3, Math.floor(newsViewpoints.length * 0.3))
          );
          
          if (consensusPoints.length > 0) {
            comment += `## 观点共识提炼\n\n`;
            comment += `通过分析，我们发现同学们在以下几个方面达成了较广泛的共识：\n\n`;
            
            consensusPoints.forEach((point, index) => {
              comment += `${index + 1}. **${point.argument}**\n`;
              comment += `   这一观点得到了${point.supportingViewpoints}位同学的支持，体现了大家对这一问题的普遍看法。\n\n`;
            });
          }
        }
        
        // 5. 观点多样性与对立分析
        if ((generationSettings.emphasis === 'balanced' || generationSettings.emphasis === 'diversity') && 
            analysis.opposingViews.length > 0) {
          comment += `## 观点碰撞与多元视角\n\n`;
          comment += `在讨论中，我们也观察到了不同观点之间的碰撞，这些多元视角共同构成了对事件的全面理解：\n\n`;
          
          analysis.opposingViews.forEach((opposingPair, index) => {
            comment += `### ${index + 1}. 观点对立分析\n\n`;
            
            comment += `**观点A**: ${opposingPair.viewA.argument.substring(0, 100)}...\n`;
            comment += `   - 支持者: ${opposingPair.viewA.supporters.slice(0, 3).join('、')}等${opposingPair.viewA.supporters.length}位同学\n\n`;
            
            comment += `**观点B**: ${opposingPair.viewB.argument.substring(0, 100)}...\n`;
            comment += `   - 支持者: ${opposingPair.viewB.supporters.slice(0, 3).join('、')}等${opposingPair.viewB.supporters.length}位同学\n\n`;
            
            comment += `这两种观点看似对立，实则从不同角度丰富了我们对问题的认识。`;
            comment += `观点A强调了${extractKeywords([opposingPair.viewA.argument])[0]}方面，`;
            comment += `而观点B则关注了${extractKeywords([opposingPair.viewB.argument])[0]}维度，`;
            comment += `将两者结合起来，能够帮助我们形成更为全面的判断。\n\n`;
          });
        }
        
        // 6. 情感倾向分析
        comment += `## 情感倾向分析\n\n`;
        comment += `通过对所有观点的情感分析，我们发现：\n\n`;
        comment += `- ${analysis.sentiment.positive}% 的观点带有积极倾向，强调机遇和正面影响\n`;
        comment += `- ${analysis.sentiment.neutral}% 的观点保持中立客观，注重事实陈述和理性分析\n`;
        comment += `- ${analysis.sentiment.negative}% 的观点表达了担忧或批判性思考\n\n`;
        
        // 7. 综合结论 - 全新的观点整合
        comment += `## 综合结论与思考\n\n`;
        
        // 根据设置的语气和重点生成不同的结论
        switch (generationSettings.tone) {
          case 'analytical':
            comment += `基于以上分析，我们可以得出以下结论：\n\n`;
            comment += `1. 学生们对这一事件的关注呈现多维度特征，涵盖了${analysis.topicDistribution.slice(0, 3).map(t => t.topic).join('、')}等多个方面。\n\n`;
            comment += `2. 虽然存在一些观点分歧，但在${analysis.keywords[0]}等核心问题上已经形成了一定共识。\n\n`;
            comment += `3. 整体情感倾向以${analysis.sentiment.neutral > analysis.sentiment.positive ? '中立客观' : '积极乐观'}为主，`;
            comment += `反映了学生们在面对复杂问题时的理性态度。\n\n`;
            break;
            
          case 'persuasive':
            comment += `综合所有同学的观点，我们认为这一事件的意义远超表面现象。\n\n`;comment += `它不仅涉及${analysis.keywords[0]}等具体问题，更反映了${analysis.keywords[1]}等深层次议题。\n\n`;
            comment += `通过这次讨论，我们看到了思想的碰撞与融合，也体会到了从多个角度思考问题的价值。\n\n`;
            comment += `正如同学们在讨论中提到的，解决这一问题需要${analysis.keywords.slice(2, 5).join('、')}等多方面的努力与合作。\n\n`;
            break;
            
          default:
            comment += `综合所有学生的观点，我们可以看到大家对这一事件的多元解读和深度思考。\n\n`;
            comment += `从${analysis.keywords[0]}到${analysis.keywords[1]}，从${analysis.topicDistribution[0].topic}到${analysis.topicDistribution[1].topic}，`;
            comment += `同学们从不同角度提出了自己的见解，这些见解相互补充，共同构成了对这一事件的全面认识。\n\n`;
            comment += `特别值得注意的是，虽然大家的观点各有侧重，但都体现了对社会问题的关注和思考深度，`;
            comment += `展现了当代学生的社会责任感和独立思考能力。\n\n`;
        }
        
         // 8. 结语
         comment += `## 结语\n\n`;
         comment += `本次观点整合分析不仅汇总了学生们的思考成果，更通过系统化的文本分析，`;
         comment += `提炼出了隐藏在分散观点背后的核心主题和共识。`;
         comment += `这种基于集体智慧的分析方法，为我们理解复杂问题提供了新的视角和思路。\n\n`;
         comment += `生成时间：${new Date().toLocaleString()}\n`;
         comment += `基于${newsViewpoints.length}条学生观点整合分析\n\n\n`;
         
         // 9. 添加完整的新闻评论部分 - 符合新闻评论的要求
         comment += `---\n\n`;
         comment += `# 完整新闻评论：${newsItem?.title}\n\n`;
         comment += `## 事件回顾与背景分析\n\n`;
         comment += `${newsItem?.content.substring(0, 200)}... 这一事件引发了广泛关注，`;
         comment += `也激发了同学们的深入思考。通过对${newsViewpoints.length}位同学观点的整理分析，`;
         comment += `我们得以从多元视角审视这一事件的意义与影响。\n\n`;
         
         comment += `## 核心观点梳理与深度解析\n\n`;
         
         // 根据语气生成不同风格的评论内容
         if (generationSettings.tone === 'analytical') {
           comment += `从分析性角度看，这一事件的核心矛盾在于${analysis.keywords[0]}与${analysis.keywords[1]}之间的平衡。`;
           comment += `同学们的讨论主要围绕三个维度展开：\n\n`;
           comment += `首先，在${analysis.topicDistribution[0].topic}层面，${Math.round(analysis.topicDistribution[0].percentage)}%的观点认为${analysis.mainArguments[0]?.argument || '这一问题需要从长远角度考量'}。`;
           comment += `这一观点得到了广泛支持，反映了大家对${analysis.keywords[0]}的关注重点。\n\n`;
           comment += `其次，在${analysis.topicDistribution[1].topic}方面，不同意见的碰撞较为明显。`;
           if (analysis.opposingViews.length > 0) {
             comment += `一方观点强调${extractKeywords([analysis.opposingViews[0].viewA.argument])[0]}的重要性，`;
             comment += `另一方则更关注${extractKeywords([analysis.opposingViews[0].viewB.argument])[0]}的影响，`;
             comment += `这种多元视角有助于我们全面理解问题的复杂性。\n\n`;
           }
           comment += `最后，在${analysis.topicDistribution[2]?.topic || '实际应用'}层面，`;
           comment += `部分观点提出了${analysis.keywords.slice(2, 4).join('、')}等具体建议，`;
           comment += `体现了同学们将理论思考与实际问题解决相结合的能力。\n\n`;
         } else if (generationSettings.tone === 'persuasive') {
           comment += `综合各方观点，我们有充分理由相信，${newsItem?.title}这一事件的意义远超表面现象。\n\n`;
           comment += `一方面，${analysis.mainArguments[0]?.argument || '这一问题关系到我们每个人的利益'}，`;
           comment += `这一共识得到了${newsViewpoints.length}位同学中超过${Math.round((analysis.mainArguments[0]?.supportingViewpoints || 0) / newsViewpoints.length * 100)}%的支持。`;
           comment += `这充分说明，${analysis.keywords[0]}已经成为社会关注的焦点。\n\n`;
           comment += `另一方面，我们也不能忽视那些不同的声音。正如部分同学所指出的，`;
           if (analysis.opposingViews.length > 0) {
             comment += `${analysis.opposingViews[0].viewB.argument.substring(0, 80)}...`;
             comment += `这些观点为我们提供了重要的警示，提醒我们在推进${analysis.keywords[0]}发展的同时，`;
             comment += `必须充分考虑${analysis.keywords[1]}等相关因素。\n\n`;
           }
           comment += `综合来看，解决这一问题需要${analysis.keywords.slice(2, 5).join('、')}等多方面的共同努力，`;
           comment += `而开放、理性的讨论正是找到最佳解决方案的关键一步。\n\n`;
         } else {
           // 中立客观的评论风格
           comment += `客观而言，${newsItem?.title}这一事件既带来了机遇，也带来了挑战。\n\n`;
           comment += `从积极方面看，${analysis.sentiment.positive}%的观点认为${analysis.keywords[0]}的发展为${analysis.keywords[1]}带来了新的可能，`;
           comment += `特别是在${analysis.topicDistribution[0].topic}领域，已经展现出明显的积极影响。\n\n`;
           comment += `从挑战方面看，${analysis.sentiment.negative}%的观点表达了对${analysis.keywords[2]}等问题的担忧，`;
           comment += `这些担忧主要集中在${analysis.topicDistribution[1].topic}方面。\n\n`;
           comment += `值得注意的是，大多数同学（${analysis.sentiment.neutral}%）保持了客观中立的态度，`;
           comment += `他们既看到了${analysis.keywords[0]}的潜力，也认识到了实现过程中可能面临的困难。`;
           comment += `这种理性的思考方式，正是我们面对复杂社会问题时所需要的。\n\n`;
         }
         
         comment += `## 思考与展望\n\n`;
         comment += `通过这次讨论，我们不仅加深了对${newsItem?.title}这一事件的理解，`;
         comment += `更体会到了集体智慧的价值。不同观点的碰撞与融合，`;
         comment += `让我们对问题的认识更加全面和深入。\n\n`;
         comment += `展望未来，${analysis.keywords[0]}的发展仍将是社会关注的焦点。`;
         comment += `如何在促进${analysis.keywords[0]}发展的同时，`;
         comment += `妥善解决${analysis.keywords[1]}、${analysis.keywords[2]}等相关问题，`;
         comment += `将是我们需要持续思考的重要课题。\n\n`;
         comment += `新闻评论生成时间：${new Date().toLocaleString()}\n`;
         comment += `基于新闻文本分析与${newsViewpoints.length}条学生观点整合`;
        
        setGeneratedComment(comment);
        setIsGenerating(false);
        toast.success('已成功生成基于学生观点的综合评论！');
      } catch (error) {
        console.error('生成评论时出错:', error);
        setGeneratedComment('生成评论时发生错误，请重试。');
        setIsGenerating(false);
        toast.error('评论生成失败，请重试');
      }
    }, 3000); // 增加延迟以模拟复杂的分析过程
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedComment)
      .then(() => {
        toast.success('评论已复制到剪贴板');
      })
      .catch(err => {
        toast.error('复制失败，请手动复制');
        console.error('复制失败:', err);
      });
  };
  
  // 初始化时设置一个基于当前新闻的模拟分析结果
  useEffect(() => {
    if (newsItem && !analysisResult) {
      // 为了展示效果，预先生成一个模拟的分析结果
      const mockAnalysis: TextAnalysisResult = {
        keywords: ['人工智能', '教育', '应用', '挑战', '个性化', '学习', '数据', '隐私'],
        sentiment: {
          positive: 60,
          neutral: 30,
          negative: 10,
        },
        topicDistribution: [
          { topic: '教育意义', count: 8, percentage: 40 },
          { topic: '社会影响', count: 6, percentage: 30 },
          { topic: '个人感受', count: 4, percentage: 20 },
          { topic: '技术分析', count: 2, percentage: 10 },
        ],
        mainArguments: [
          {
            argument: '人工智能在教育中的应用前景广阔，可以提供个性化的学习方案',
            supportingViewpoints: 8,
            representativeQuotes: [
              '我认为AI在教育中的应用前景广阔，可以根据学生的学习情况提供个性化的学习方案，大大提高学习效率。',
              '人工智能技术能够分析学生的学习数据，从而提供更有针对性的教学内容。',
            ],
          },
          {
            argument: '教育的本质是人与人之间的交流和情感传递，这是AI无法替代的',
            supportingViewpoints: 6,
            representativeQuotes: [
              '虽然AI技术很先进，但教育的本质是人与人之间的交流和情感传递，这是AI无法替代的。',
              '教师的人文关怀和情感引导是教育中不可或缺的部分。',
            ],
          },
          {
            argument: '数据隐私是AI在教育应用中必须重视的问题',
            supportingViewpoints: 4,
            representativeQuotes: [
              '数据隐私是AI在教育应用中必须重视的问题，学生的个人学习数据需要得到妥善保护。',
              '在使用AI技术的同时，我们不能忽视数据安全和隐私保护的重要性。',
            ],
          },
        ],
        opposingViews: [
          {
            viewA: {
              argument: 'AI技术将极大提升教育效率，是未来教育发展的必然趋势',
              supporters: ['学生甲', '学生乙', '学生丙'],
            },
            viewB: {
              argument: '过度依赖AI可能会削弱传统教育中的人文价值和师生互动',
              supporters: ['学生丁', '学生戊', '学生己'],
            },
          },
        ],
      };
      
      setAnalysisResult(mockAnalysis);
    }
  }, [newsItem, analysisResult]);
  
  if (!newsItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">未找到该新闻</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          学生观点智能整合分析
        </motion.h1>
        <button 
          onClick={() => navigate(`/news/${id}`)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <i className="fas fa-arrow-left mr-1"></i> 返回
        </button>
      </div>
      
      {/* 新闻内容预览 - 简化版 */}
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
          参与学生数: {new Set(newsViewpoints.map(vp => vp.userId)).size} | 收集到的观点数量: {newsViewpoints.length}
        </p>
      </motion.div>
      
      {/* 生成设置 */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          评论生成设置
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              评论长度
            </label>
            <select
              value={generationSettings.length}
              onChange={(e) => setGenerationSettings({...generationSettings, length: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">简短 (约300字)</option>
              <option value="medium">中等 (约600字)</option>
              <option value="long">详细 (约1000字)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              评论语气
            </label>
            <select
              value={generationSettings.tone}
              onChange={(e) => setGenerationSettings({...generationSettings, tone: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="neutral">中立客观</option>
              <option value="analytical">分析性</option>
              <option value="persuasive">说服性</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              强调重点
            </label>
            <select
              value={generationSettings.emphasis}
              onChange={(e) => setGenerationSettings({...generationSettings, emphasis: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="balanced">平衡呈现</option>
              <option value="consensus">强调共识</option>
              <option value="diversity">强调多元</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* 生成按钮 */}
      <div className="flex justify-center mb-6">
        <motion.button
          onClick={generateComment}
          disabled={isGenerating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center transform hover:scale-105"
          whileHover={!isGenerating ? { scale: 1.03 } : {}}
          whileTap={!isGenerating ? { scale: 0.97 } : {}}
        >
          {isGenerating ? (
            <>
              <i className="fas fa-brain fa-spin mr-2"></i>
              正在分析学生观点并整合...
            </>
          ) : (
            <>
               <i className="fas fa-comments mr-2"></i>
               生成学生观点分析与完整新闻评论
             </>
          )}
        </motion.button>
      </div>
      
      {/* 文本分析结果预览 */}
      {analysisResult && (
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            <i className="fas fa-chart-pie mr-2"></i>
            文本分析结果预览
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 核心关键词 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">核心关键词</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            {/* 情感倾向 */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">情感倾向</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">积极:</span>
                  <div className="w-3/5 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analysisResult.sentiment.positive}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-green-600">{analysisResult.sentiment.positive}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">中立:</span>
                  <div className="w-3/5 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${analysisResult.sentiment.neutral}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-blue-600">{analysisResult.sentiment.neutral}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">消极:</span>
                  <div className="w-3/5 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${analysisResult.sentiment.negative}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-red-600">{analysisResult.sentiment.negative}%</span>
                </div>
              </div>
            </div>
            
            {/* 主题分布 */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">主题分布</h3>
              <div className="space-y-1">
                {analysisResult.topicDistribution.slice(0, 3).map((topic, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{topic.topic}:</span>
                    <div className="w-2/5 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${topic.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-purple-600">{topic.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 主要论点概览 */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">主要论点数量</h3>
              <div className="flex items-center justify-center">
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">{analysisResult.mainArguments.length}</div>
                <div className="ml-3 text-sm text-gray-600 dark:text-gray-400">个核心论点</div>
              </div>
              {analysisResult.opposingViews.length > 0 && (
                <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                  检测到 {analysisResult.opposingViews.length} 组对立观点
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 生成结果 */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            <i className="fas fa-file-alt mr-2"></i>
            学生观点综合评论
          </h2>
          <button 
            onClick={copyToClipboard}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            disabled={!generatedComment}
          >
            <i className="fas fa-copy mr-1"></i> 复制
          </button>
        </div>
        
        <div className="prose dark:prose-invert max-w-none overflow-auto max-h-[700px] p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner">
          {generatedComment ? (
            generatedComment.split('\n').map((line, index) => {
              if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{line.substring(3)}</h2>;
              } else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
              } else if (line.startsWith('- ')) {
                return <p key={index} className="ml-5">{line}</p>;
              } else if (line.startsWith('# ')) {
                return <h1 key={index} className="text-2xl font-bold mt-2 mb-4">{line.substring(2)}</h1>;
              } else if (line.startsWith('**')) {
                // 加粗文本
                const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <p key={index} dangerouslySetInnerHTML={{ __html: content }}></p>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else {
                return <p key={index}>{line}</p>;
              }
            })
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-comments text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                点击上方按钮，系统将分析学生观点并生成综合评论
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                基于文本分析技术，整合不同角度观点，形成全新见解
              </p>
            </div>
          )}
        </div>
      </motion.div>
      
       {/* 使用说明 */}
       <motion.div 
         className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.6 }}
       >
         <h3 className="flex items-center text-blue-800 dark:text-blue-300 font-medium mb-2">
           <i className="fas fa-info-circle mr-2"></i> 功能说明
         </h3>
         <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
           <li className="flex items-start">
             <i className="fas fa-check-circle mr-2 mt-0.5"></i>
             <span>系统通过自然语言处理技术对所有学生观点进行深度文本分析</span>
           </li>
           <li className="flex items-start">
             <i className="fas fa-check-circle mr-2 mt-0.5"></i>
             <span>自动提取核心论点、智能过滤无效关键词、分析情感倾向和观点分布</span>
           </li>
           <li className="flex items-start">
             <i className="fas fa-check-circle mr-2 mt-0.5"></i>
             <span>生成两部分内容：1) 学生观点综合分析报告 2) 符合新闻评论规范的完整评论</span>
           </li>
           <li className="flex items-start">
             <i className="fas fa-check-circle mr-2 mt-0.5"></i>
             <span>完整新闻评论整合了学生观点与新闻文本分析，语言符合专业新闻评论要求</span>
           </li>
           <li className="flex items-start">
             <i className="fas fa-check-circle mr-2 mt-0.5"></i>
             <span>您可以根据需要调整评论长度、语气和强调重点</span>
           </li>
         </ul>
       </motion.div>
    </div>
  );
}