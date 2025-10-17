# Changelog

All notable changes to this project will be documented in this file.

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
