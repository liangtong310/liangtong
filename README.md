# 新闻评论教学智能体

一个用于收集、分析和整合学生对新闻观点的教学智能工具，帮助教师更好地进行新闻评论教学。

## 功能特点

- 📝 **新闻主题管理** - 教师可以创建和管理新闻讨论主题
- 💬 **学生观点收集** - 学生可以针对新闻发表自己的观点和看法
- 🧠 **智能文本分析** - 自动分析学生观点，提取关键词和主要论点
- 📊 **观点可视化** - 通过图表直观展示学生观点分布和情感倾向
- ✍️ **评论生成** - 整合学生观点，生成专业的新闻评论
- 🌓 **深色模式** - 支持明暗两种主题，提升用户体验

## 技术栈

- **前端框架**: React 18+
- **编程语言**: TypeScript
- **UI组件**: Tailwind CSS v3
- **路由**: React Router
- **动画**: Framer Motion
- **图表**: Recharts
- **构建工具**: Vite
- **数据存储**: LocalStorage

## 快速开始

### 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install

# 或使用npm
npm install

# 或使用yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev

# 或
yarn dev
```

服务器将在 http://localhost:3000 启动

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 或
npm run build

# 或
yarn build
```

构建后的文件将位于 `dist` 目录中

## 部署指南

### 部署到 GitHub Pages

1. **创建GitHub仓库**
   - 在GitHub上创建一个新的仓库

2. **将项目推送到GitHub**
   ```bash
   # 初始化git仓库
   git init
   
   # 添加远程仓库
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # 添加所有文件
   git add .
   
   # 提交更改
   git commit -m "Initial commit"
   
   # 推送到GitHub
   git push -u origin main
   ```

3. **部署到GitHub Pages**
   有两种方式部署到GitHub Pages:

   **方式1: 手动部署**
   ```bash
   # 安装gh-pages包
   pnpm add -D gh-pages
   
   # 或
   npm install -D gh-pages
   
   # 或
   yarn add -D gh-pages
   
   # 添加部署脚本到package.json
   # "scripts": {
   #   ...
   #   "deploy": "gh-pages -d dist"
   # }
   
   # 构建并部署
   pnpm build && pnpm deploy
   ```

   **方式2: 使用GitHub Actions**
   - 在项目根目录创建 `.github/workflows/deploy.yml` 文件
   - 添加以下内容:
     ```yaml
     name: Deploy to GitHub Pages
     
     on:
       push:
         branches: [ main ]
     
     jobs:
       deploy:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           
           - name: Setup Node.js
             uses: actions/setup-node@v3
             with:
               node-version: '18'
               
           - name: Install dependencies
             run: npm install
             
           - name: Build
             run: npm run build
             
           - name: Deploy to GitHub Pages
             uses: peaceiris/actions-gh-pages@v3
             with:
               github_token: ${{ secrets.GITHUB_TOKEN }}
               publish_dir: ./dist
     ```

4. **配置GitHub Pages**
   - 进入GitHub仓库的设置页面
   - 选择"Pages"选项卡
   - 在"Source"下拉菜单中选择"Deploy from a branch"
   - 选择"gh-pages"分支和"/ (root)"目录
   - 点击"Save"按钮

5. **访问您的网站**
   - 通常需要几分钟时间部署
   - 部署完成后，您可以通过 `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/` 访问您的网站

### 其他部署选项

您也可以选择其他平台部署这个项目:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)

这些平台都提供简单的一键部署功能，通常只需要连接您的GitHub仓库即可。

## 使用说明

### 教师使用指南

1. **登录**
   - 在登录页面选择"教师"身份
   - 用户名输入"teacher"登录

2. **管理新闻主题**
   - 在控制面板页面，您可以创建、查看和删除新闻主题
   - 点击"创建新闻主题"按钮添加新的讨论主题
   - 您可以输入新闻标题、内容、原文链接和图片URL

3. **查看学生观点**
   - 点击新闻卡片上的"查看详情"按钮
   - 在新闻详情页面，您可以查看所有学生提交的观点

4. **生成综合评论**
   - 在新闻卡片上点击"生成评论"按钮
   - 在评论生成页面，您可以调整生成设置并生成基于学生观点的综合评论
   - 系统会分析学生观点，提取关键词和主要论点，并生成专业的新闻评论

5. **查看观点图谱**
   - 在新闻卡片上点击"观点图谱"按钮
   - 在观点可视化页面，您可以通过图表直观地查看学生观点的分布和统计信息

### 学生使用指南

1. **登录**
   - 在登录页面选择"学生"身份
   - 输入任意姓名即可登录

2. **参与讨论**
   - 在讨论主题页面，您可以浏览所有可用的新闻主题
   - 点击"参与讨论"按钮进入新闻详情页面

3. **提交观点**
   - 在新闻详情页面，您可以阅读新闻内容
   - 在页面下方的表单中，输入您的观点并选择观点类别
   - 点击"提交观点"按钮分享您的看法

4. **查看观点**
   - 提交观点后，您可以在页面上方看到所有同学的观点
   - 您可以通过点击"赞同"按钮支持您认同的观点
   - 您可以根据观点类别和排序方式筛选和排序观点

## 开源协议

本项目采用 [MIT License](LICENSE)

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 联系我们

如有任何问题或建议，请随时联系我们。