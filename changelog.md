# Changelog

All notable changes to this project will be documented in this file.

## [2025-10-17] - 创建健身房回本计划项目

### 添加内容
- 创建 `src/apps/gym-roi/` 项目文件夹结构
- 编写详细需求文档 (`docs/gym-roi-requirements.md`)
- 创建配置文件 (`config.js`)
- 创建数据模板文件 (`expenses.json`, `activities.json`)
- 创建示例私教笔记 Markdown 文件
- 创建项目 README 说明文档

### 为什么这样做
- 采用模块化设计，将健身房回本计划作为独立 app，方便后续添加其他项目
- 详细的需求文档帮助明确功能范围和技术实现
- 配置文件集中管理权重、参考价等可调整参数
- 示例数据为后续开发提供参考模板

### 如何工作
1. **文件结构**: 采用 `apps/` 目录管理多个独立应用
2. **数据设计**:
   - 支出数据包含会员费、固定资产、其他费用
   - 活动数据包含游泳、团课、私教记录
   - 私教笔记使用 Markdown 格式存储
3. **计算逻辑**:
   - 基于权重系统计算加权活动次数
   - 平均成本 = 总支出 ÷ 加权活动次数
   - 支持市场参考价对比，计算性价比
4. **双模式设计**:
   - Admin 模式（localhost）: 使用 localStorage 实时录入数据
   - Public 模式（GitHub Pages）: 读取静态 JSON 展示数据

### 架构说明
```
src/apps/gym-roi/
├── components/  # React 组件（待开发）
├── pages/       # 管理页面和展示页面（待开发）
├── data/        # 数据文件（JSON + Markdown）
├── utils/       # 工具函数（待开发）
└── config.js    # 配置文件
```

## [2025-10-17] - 修复部署权限

### 修改内容
- 更新 README 为中文说明
- 修复 GitHub Actions 工作流权限配置

### 为什么这样做
- GitHub Actions 需要写入权限才能部署到 GitHub Pages
- 在仓库设置中启用了 "Read and write permissions"

### 如何工作
- 推送代码会触发 GitHub Actions 重新构建和部署

## [2025-10-17] - 初始化项目

### 添加内容
- 使用 Vite + React 创建个人网站项目
- 配置 GitHub Actions 自动部署到 GitHub Pages
- 设置项目基础结构

### 为什么这样做
- Vite 提供快速的开发体验和优化的生产构建
- React 是流行的前端框架，便于构建交互式用户界面
- GitHub Actions 自动化部署流程，每次推送到 main 分支时自动更新网站

### 如何工作
1. **项目初始化**: 使用 `npm create vite@latest` 创建 React 模板
2. **Vite 配置**: 在 `vite.config.js` 中设置 `base: '/duckiki/'` 以适配 GitHub Pages 的子路径
3. **GitHub Actions**: 创建 `.github/workflows/deploy.yml` 配置文件
   - 当代码推送到 main 分支时触发
   - 安装依赖并构建项目
   - 将构建产物（dist 目录）部署到 GitHub Pages
4. **架构**:
   - `src/`: React 源代码目录
   - `public/`: 静态资源目录
   - `dist/`: 构建输出目录（部署到 GitHub Pages）
