# Duckiki - 我的个人网站

> 使用 React + Vite + Flask 构建的个人网站项目

## 🌐 在线访问

- **主页**: https://chenmq77.github.io/duckiki/
- **健身房回本计划**: https://chenmq77.github.io/duckiki/gym-roi

---

## 📁 项目结构

```
duckiki/
├── backend/                  # Flask API 后端（本地开发）
│   ├── app.py               # Flask 主应用
│   ├── models.py            # 数据库模型
│   ├── calculator.py        # ROI 计算引擎
│   └── README.md            # 后端开发说明
│
├── src/                     # React 前端
│   ├── apps/               # 独立应用模块
│   │   └── gym-roi/        # 健身房回本计划
│   │       ├── admin/      # Admin 前端（本地开发）
│   │       ├── public/     # Public 前端（GitHub Pages）
│   │       ├── data/       # 数据文件（JSON）
│   │       └── config.js   # 配置文件
│   └── main.jsx
│
├── docs/                    # 项目文档
│   ├── gym-roi-requirements.md      # 需求文档
│   ├── gym-roi-architecture.md      # 架构设计
│   └── development-guide.md         # 开发最佳实践指南
│
├── .github/workflows/       # GitHub Actions
└── vite.config.js
```

---

## 🚀 快速开始

### 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问页面
# Admin: http://localhost:5173/admin
# Public: http://localhost:5173/gym-roi
```

### 后端开发（健身房回本计划）

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（首次）
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件修改配置

# 启动 Flask 服务器
flask run

# 访问 API: http://localhost:5000/api
```

**详细后端开发说明**: 见 [backend/README.md](./backend/README.md)

---

## 🏋️ 项目：健身房回本计划

### 架构说明

```
┌─────────────────────┐
│   本地开发环境        │
│                     │
│  Flask API (5000)   │ ← Python 计算引擎、SQLite 数据库
│         ↕           │
│  React Admin (5173) │ ← 数据录入、配置管理、统计看板
│         ↓           │
│  导出 JSON 文件      │ ← 脱敏后的展示数据
└─────────────────────┘
         │
         │ git push
         ▼
┌─────────────────────┐
│   GitHub Pages      │ ← 纯静态展示（朋友/粉丝可访问）
│  React Public       │    读取 JSON 文件，无后端 API
└─────────────────────┘
```

### 功能特性

- 🌐 **多币种支持**: NZD/RMB 可切换显示
- 📅 **周扣费年卡**: 跟踪每周自动扣费模式
- 🎯 **双重回本计算**: 短期激励 + 长期目标
- 🏅 **回本目标层级**: 回本线/铜牌/银牌/金牌
- 🏊 **游泳距离动态权重**: 高斯函数计算
- 💪 **活动强度系数**: 所有活动类型支持强度权重
- 📝 **训练日记系统**: Markdown 格式记录成长轨迹
- ⚙️ **配置管理界面**: Admin 可调整所有参数

### 相关文档

- [需求文档 v2.0](./docs/gym-roi-requirements.md)
- [架构设计文档](./docs/gym-roi-architecture.md)
- [开发最佳实践指南](./docs/development-guide.md)
- [后端开发说明](./backend/README.md)

---

## 🛠️ 开发工作流

### 日常开发流程

```bash
# 1. 启动后端（新终端窗口）
cd backend
source venv/bin/activate
flask run

# 2. 启动前端（新终端窗口）
npm run dev

# 3. 开发...
# Admin: http://localhost:5173/admin
# 录入数据、查看统计、编辑配置

# 4. 导出数据到 GitHub
# 在 Admin 页面点击"导出到 GitHub"
# 执行提示的 Git 命令

# 5. 推送到 GitHub
git add src/apps/gym-roi/data
git commit -m "更新健身数据 $(date +%Y-%m-%d)"
git push

# 6. GitHub Actions 自动部署
# 访问 https://chenmq77.github.io/duckiki/gym-roi 查看更新
```

### 构建与部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 推送到 GitHub（自动部署）
git push
```

---

## 📚 技术栈

### 前端
- **React** 18.x
- **Vite** 5.x
- **React Router** v6
- **Tailwind CSS** 3.x
- **Chart.js** / **Recharts** (图表)
- **React Markdown** (日记渲染)

### 后端（本地）
- **Python** 3.8.11
- **Flask** 3.0+
- **SQLAlchemy** 2.0+
- **SQLite** 3.x
- **NumPy** 1.24+ (科学计算)

### 部署
- **GitHub Pages** (前端静态托管)
- **GitHub Actions** (自动部署)

---

## 📖 开发最佳实践

### 虚拟环境管理

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 退出虚拟环境
deactivate
```

**为什么需要虚拟环境？**
- 隔离项目依赖，避免版本冲突
- 方便管理和复现环境
- 详见 [开发最佳实践指南](./docs/development-guide.md#1-虚拟环境-virtual-environment)

### 环境变量配置

```bash
# 后端环境变量
cd backend
cp .env.example .env
# 编辑 .env 文件修改配置
```

**重要**：`.env` 文件包含敏感信息，已添加到 `.gitignore`，不会推送到 GitHub。

### Git 提交规范

```bash
# 好的提交信息示例
git commit -m "feat: 添加游泳距离高斯权重计算函数"
git commit -m "fix: 修复活动删除时的外键约束错误"
git commit -m "docs: 更新架构设计文档"
git commit -m "更新健身数据 2025-10-17"
```

---

## 🤝 贡献指南

### 提交代码前

1. 确保代码能正常运行
2. 检查 `.gitignore` 是否正确（不推送 `.env`、`venv/`、`*.db`）
3. 写清晰的提交信息
4. 更新相关文档

### 代码风格

- **Python**: 遵循 PEP 8 规范
- **JavaScript**: 使用 ESLint 检查
- **组件命名**: 大驼峰 (PascalCase)

---

## 📝 更新日志

见 [changelog.md](./changelog.md)

---

## 📄 许可证

MIT License

---

**作者**: chenmq77
**创建日期**: 2025-10-17
**最后更新**: 2025-10-17
