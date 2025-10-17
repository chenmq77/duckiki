# 健身房回本计划 - 技术架构设计 v3.0

> **架构理念**：本地 Flask API 开发 + GitHub Pages 静态展示
> **核心优势**：前后端分离开发体验 + 零部署成本 + 数据安全

---

## 📊 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        本地开发环境                              │
│                    (你的 MacBook)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────────────┐   │
│  │  Flask API       │◄─────────┤  React Admin 前端         │   │
│  │  (Python 3.8)    │  HTTP    │  (http://localhost:5173)  │   │
│  │                  │  REST    │                           │   │
│  │  - 数据录入 API  │          │  - 支出录入表单           │   │
│  │  - ROI 计算引擎  │          │  - 活动记录表单           │   │
│  │  - 统计分析      │          │  - 训练日记编辑器         │   │
│  │  - JSON 导出     │          │  - 配置管理界面           │   │
│  │                  │          │  - 统计看板               │   │
│  └────────┬─────────┘          │  - "导出到 GitHub" 按钮   │   │
│           │                     └──────────────────────────┘   │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │  SQLite 数据库   │                                          │
│  │  gym_roi.db      │                                          │
│  │                  │                                          │
│  │  - expenses 表   │    ⚠️ 不推送到 GitHub                    │
│  │  - activities 表 │    (包含真实个人数据)                    │
│  │  - notes 表      │                                          │
│  │  - configs 表    │                                          │
│  └──────────────────┘                                          │
│                                                                 │
│           ┃ 点击"导出到 GitHub"                                 │
│           ▼                                                     │
│  ┌──────────────────────────────────────┐                     │
│  │  生成 JSON 文件 (脱敏后的展示数据)   │                     │
│  │  src/apps/gym-roi/data/              │                     │
│  │                                       │                     │
│  │  - roi-summary.json                  │                     │
│  │  - activities-timeline.json          │                     │
│  │  - stats.json                        │                     │
│  │  - training-notes.json               │                     │
│  └──────────────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ 手动执行
                           │ git add, commit, push
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Repository                            │
│                    (chenmq77/duckiki)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/apps/gym-roi/data/                                         │
│  ├── roi-summary.json         ✅ 推送到 GitHub                  │
│  ├── activities-timeline.json                                  │
│  └── stats.json                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ GitHub Actions
                           │ 自动部署
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Pages                                 │
│          https://chenmq77.github.io/duckiki/gym-roi             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────┐                     │
│  │  React Public 前端 (纯静态)          │                     │
│  │                                       │                     │
│  │  - 读取 JSON 文件 (fetch)            │                     │
│  │  - ROI 进度卡片                      │                     │
│  │  - 图表可视化 (Chart.js)             │                     │
│  │  - 训练日记时间轴                    │                     │
│  │  - 响应式设计 (手机友好)             │                     │
│  │                                       │                     │
│  │  ❌ 无 API 调用                       │                     │
│  │  ✅ 纯静态展示                        │                     │
│  │  ✅ 加载速度快                        │                     │
│  └──────────────────────────────────────┘                     │
│                                                                 │
│  访问者：朋友、粉丝、招聘者                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 技术栈选型

### 后端 (本地开发)

| 技术 | 版本 | 用途 | 为什么选择 |
|------|------|------|------------|
| **Python** | 3.8.11 | 后端语言 | 数学计算优雅，NumPy 支持高斯函数 |
| **Flask** | 3.0+ | Web 框架 | 轻量级，快速开发 RESTful API |
| **SQLAlchemy** | 2.0+ | ORM | 优雅的数据库操作，支持 SQLite |
| **SQLite** | 3.x | 数据库 | 零配置，本地文件数据库，适合个人项目 |
| **Flask-CORS** | 4.0+ | 跨域支持 | 允许 React 前端调用本地 API |
| **NumPy** | 1.24+ | 科学计算 | 高斯函数计算 |
| **python-dotenv** | 1.0+ | 环境变量 | 管理配置和敏感信息 |

### 前端 (Admin 页面 - 本地)

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.x | UI 框架 |
| **Vite** | 5.x | 构建工具 |
| **Axios** | 1.6+ | HTTP 客户端（调用本地 API） |
| **React Hook Form** | 7.x | 表单管理 |
| **Tailwind CSS** | 3.x | 样式框架 |
| **React Markdown** | 9.x | Markdown 渲染（训练日记） |
| **Chart.js / Recharts** | - | 图表库（实时统计） |

### 前端 (Public 页面 - GitHub Pages)

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.x | UI 框架 |
| **Vite** | 5.x | 构建工具 |
| **纯 fetch API** | 原生 | 读取静态 JSON（无需 Axios） |
| **Tailwind CSS** | 3.x | 样式框架 |
| **Chart.js** | 4.x | 图表可视化 |
| **React Markdown** | 9.x | 训练日记展示 |

---

## 📁 项目目录结构

```
duckiki/
├── backend/                         # 🆕 Flask API 后端
│   ├── app.py                       # Flask 主应用
│   ├── models.py                    # 数据库模型（SQLAlchemy）
│   ├── calculator.py                # ROI 计算引擎
│   ├── config.py                    # Flask 配置
│   ├── requirements.txt             # Python 依赖列表
│   ├── .env.example                 # 环境变量模板
│   ├── .env                         # 环境变量 (不推送)
│   ├── venv/                        # 虚拟环境 (不推送)
│   ├── gym_roi.db                   # SQLite 数据库 (不推送)
│   ├── routes/                      # API 路由
│   │   ├── expenses.py              # 支出相关 API
│   │   ├── activities.py            # 活动相关 API
│   │   ├── roi.py                   # ROI 计算 API
│   │   ├── stats.py                 # 统计分析 API
│   │   └── export.py                # JSON 导出 API
│   ├── utils/                       # 工具函数
│   │   ├── gaussian.py              # 高斯函数计算
│   │   ├── weight_calculator.py     # 活动权重计算
│   │   └── data_sanitizer.py        # 数据脱敏处理
│   └── README.md                    # 后端开发说明
│
├── src/
│   ├── apps/
│   │   └── gym-roi/
│   │       ├── admin/               # 🆕 Admin 前端（本地开发）
│   │       │   ├── pages/
│   │       │   │   ├── Dashboard.jsx       # 主看板
│   │       │   │   ├── ExpenseManager.jsx  # 支出管理
│   │       │   │   ├── ActivityManager.jsx # 活动管理
│   │       │   │   ├── NotesEditor.jsx     # 训练日记编辑
│   │       │   │   └── ConfigPanel.jsx     # 配置管理
│   │       │   ├── components/
│   │       │   │   ├── ExpenseForm.jsx
│   │       │   │   ├── ActivityForm.jsx
│   │       │   │   ├── MarkdownEditor.jsx
│   │       │   │   └── ExportButton.jsx    # 导出到 GitHub
│   │       │   ├── services/
│   │       │   │   └── api.js              # Axios 封装
│   │       │   └── App.jsx
│   │       │
│   │       ├── public/              # Public 前端（GitHub Pages）
│   │       │   ├── pages/
│   │       │   │   ├── Home.jsx            # 首页
│   │       │   │   ├── ROIProgress.jsx     # 回本进度页
│   │       │   │   ├── TrainingDiary.jsx   # 训练日记页
│   │       │   │   └── Stats.jsx           # 统计分析页
│   │       │   ├── components/
│   │       │   │   ├── ROICard.jsx         # 回本进度卡片
│   │       │   │   ├── ROIChart.jsx        # ROI 曲线图
│   │       │   │   ├── ActivityTimeline.jsx
│   │       │   │   └── NoteViewer.jsx
│   │       │   ├── services/
│   │       │   │   └── dataLoader.js       # 读取静态 JSON
│   │       │   └── App.jsx
│   │       │
│   │       ├── data/                # 📊 导出的 JSON（推送到 GitHub）
│   │       │   ├── roi-summary.json
│   │       │   ├── activities-timeline.json
│   │       │   ├── stats.json
│   │       │   └── notes/
│   │       │       └── *.json       # 训练日记摘要
│   │       │
│   │       ├── config.js            # 前端配置（复用）
│   │       └── README.md
│   │
│   └── main.jsx
│
├── docs/
│   ├── gym-roi-requirements.md      # 需求文档
│   ├── gym-roi-architecture.md      # 本文件：架构设计
│   └── development-guide.md         # 🆕 开发最佳实践指南
│
├── .gitignore                       # ✅ 已更新（Python 规则）
├── package.json
├── vite.config.js
├── README.md
└── changelog.md
```

---

## 🔌 API 接口设计

### 基础 URL
```
本地开发: http://localhost:5000/api
生产环境: 无（GitHub Pages 无后端）
```

### 1. 支出管理 API

#### 1.1 获取所有支出
```http
GET /api/expenses
```

**响应示例**：
```json
{
  "expenses": [
    {
      "id": "exp_001",
      "type": "membership_weekly",
      "weeklyAmount": 17,
      "currency": "NZD",
      "actualPaid": 136,
      "expectedTotal": 816
    }
  ],
  "meta": {
    "total": 1,
    "totalAmount": 136
  }
}
```

#### 1.2 添加支出
```http
POST /api/expenses
Content-Type: application/json

{
  "type": "equipment",
  "category": "游泳装备",
  "amount": 100,
  "currency": "NZD",
  "assetType": "essential"
}
```

#### 1.3 更新支出
```http
PUT /api/expenses/<expense_id>
```

#### 1.4 删除支出
```http
DELETE /api/expenses/<expense_id>
```

---

### 2. 活动管理 API

#### 2.1 获取所有活动
```http
GET /api/activities
```

#### 2.2 添加活动
```http
POST /api/activities
Content-Type: application/json

{
  "type": "swimming",
  "date": "2025-10-17",
  "data": {
    "distance": 1500
  },
  "note": "状态不错"
}
```

**后端自动计算**：
- `calculatedWeight`: 基于高斯函数计算游泳权重
- 存入数据库

---

### 3. ROI 计算 API

#### 3.1 获取 ROI 摘要
```http
GET /api/roi/summary
```

**响应示例**：
```json
{
  "mode_a": {
    "actualPaid": 136,
    "weightedActivities": 11.72,
    "costPerActivity": 11.60,
    "message": "已超值！远低于市场价 $50"
  },
  "mode_b": {
    "expectedTotal": 816,
    "targetActivities": {
      "breakeven": 16.32,
      "bronze": 20.40,
      "silver": 27.20,
      "gold": 40.80
    },
    "currentProgress": {
      "breakeven": {
        "percentage": 71.8,
        "remaining": 4.6,
        "achieved": false
      },
      "bronze": {
        "percentage": 57.5,
        "remaining": 8.68,
        "achieved": false
      }
    }
  }
}
```

#### 3.2 获取 ROI 趋势数据
```http
GET /api/roi/trend?period=weekly
```

---

### 4. 统计分析 API

#### 4.1 获取统计摘要
```http
GET /api/stats/summary
```

**响应示例**：
```json
{
  "totalActivities": 6,
  "totalWeightedActivities": 11.72,
  "averageWeeklyActivities": 2.5,
  "mostFrequentType": "swimming",
  "totalExpense": 286,
  "currency": "NZD"
}
```

#### 4.2 获取活动频率分析
```http
GET /api/stats/activity-frequency
```

---

### 5. 数据导出 API（核心功能）

#### 5.1 导出 JSON 文件
```http
POST /api/export/json
```

**功能**：
1. 从 SQLite 读取所有数据
2. **数据脱敏**：移除敏感个人信息（如真实姓名、详细地址）
3. **数据优化**：压缩 JSON 大小，移除冗余字段
4. 生成以下文件到 `src/apps/gym-roi/data/`：
   - `roi-summary.json`: ROI 计算结果
   - `activities-timeline.json`: 活动时间轴
   - `stats.json`: 统计数据
   - `notes/*.json`: 训练日记摘要

**响应示例**：
```json
{
  "success": true,
  "files": [
    "src/apps/gym-roi/data/roi-summary.json",
    "src/apps/gym-roi/data/activities-timeline.json",
    "src/apps/gym-roi/data/stats.json"
  ],
  "message": "数据导出成功！请执行以下命令推送到 GitHub:\n\ngit add src/apps/gym-roi/data\ngit commit -m \"更新健身数据 $(date +%Y-%m-%d)\"\ngit push"
}
```

---

## 🔄 数据流向详解

### 场景 1：本地录入活动

```
用户在 Admin 页面填写表单
  ↓
React Admin 调用 POST /api/activities
  ↓
Flask API 接收数据
  ↓
calculator.py 计算权重（高斯函数）
  ↓
SQLAlchemy 存入 SQLite
  ↓
返回成功响应给前端
  ↓
Admin 页面刷新展示最新数据
```

### 场景 2：查看实时统计

```
用户访问 Admin Dashboard
  ↓
React Admin 调用 GET /api/roi/summary
  ↓
Flask API 查询 SQLite
  ↓
calculator.py 计算双重 ROI
  ↓
返回计算结果
  ↓
Admin 页面渲染图表和卡片
```

### 场景 3：导出数据到 GitHub

```
用户点击 "导出到 GitHub" 按钮
  ↓
React Admin 调用 POST /api/export/json
  ↓
Flask API 执行导出逻辑：
  1. 从 SQLite 读取所有数据
  2. 数据脱敏（移除敏感信息）
  3. 计算 ROI、统计数据
  4. 生成 JSON 文件
  5. 写入 src/apps/gym-roi/data/
  ↓
返回 Git 命令提示
  ↓
Admin 页面显示 Git 命令
  ↓
用户复制命令到终端执行：
  git add src/apps/gym-roi/data
  git commit -m "更新健身数据"
  git push
  ↓
GitHub Actions 自动构建部署
  ↓
Public 页面更新（朋友可见最新数据）
```

### 场景 4：朋友访问 Public 页面

```
朋友访问 https://chenmq77.github.io/duckiki/gym-roi
  ↓
React Public 页面加载
  ↓
fetch('/gym-roi/data/roi-summary.json')
fetch('/gym-roi/data/activities-timeline.json')
  ↓
读取静态 JSON 文件
  ↓
渲染 ROI 进度卡片、图表、训练日记
  ↓
纯静态展示（无 API 调用，加载快）
```

---

## 🛡️ 数据安全与隐私

### 本地数据（不推送）
- `gym_roi.db`: 包含完整的真实数据
- `.env`: 包含敏感配置
- `venv/`: 虚拟环境

### 导出数据（推送到 GitHub）
- **脱敏处理**：移除姓名、教练名称、详细备注中的隐私信息
- **数据聚合**：只导出统计结果，不导出原始明细
- **可配置脱敏规则**：在 `backend/utils/data_sanitizer.py` 中定义

**示例**：
```python
# 原始数据（本地 SQLite）
{
  "type": "personal_training",
  "data": {
    "trainer": "张教练",
    "topic": "腿部力量训练",
    "duration": 60
  },
  "note": "在健身房A区，旁边是李先生"
}

# 导出数据（GitHub Pages）
{
  "type": "personal_training",
  "data": {
    "topic": "腿部力量训练",
    "duration": 60
  },
  "note": "私教课程"
}
```

---

## 🚀 部署策略

### 本地开发环境

#### 启动后端
```bash
cd backend
source venv/bin/activate
flask run
# 运行在 http://localhost:5000
```

#### 启动前端
```bash
npm run dev
# Admin: http://localhost:5173/admin
# Public: http://localhost:5173/gym-roi (本地测试)
```

### 生产环境（GitHub Pages）

#### 构建
```bash
npm run build
# 输出到 dist/
```

#### 部署
```bash
git push
# GitHub Actions 自动部署到 GitHub Pages
```

---

## 🎯 开发优先级

### 阶段 1：后端基础 (Week 1)
- ✅ 数据库模型设计
- ✅ CRUD API 实现
- ✅ 高斯函数计算引擎
- ✅ 虚拟环境配置

### 阶段 2：Admin 前端 (Week 2-3)
- ✅ 支出录入表单
- ✅ 活动录入表单
- ✅ 训练日记编辑器（Markdown）
- ✅ 实时统计看板
- ✅ 配置管理界面

### 阶段 3：导出功能 (Week 3)
- ✅ JSON 导出 API
- ✅ 数据脱敏逻辑
- ✅ Git 命令生成

### 阶段 4：Public 前端 (Week 4)
- ✅ 静态数据加载
- ✅ ROI 进度卡片
- ✅ 图表可视化
- ✅ 训练日记展示
- ✅ 响应式设计

---

## 📚 相关文档

- [需求文档 v2.0](./gym-roi-requirements.md)
- [开发最佳实践指南](./development-guide.md)
- [后端开发说明](../backend/README.md)
- [前端配置说明](../src/apps/gym-roi/config.js)

---

**创建日期**: 2025-10-17
**更新日期**: 2025-10-17
**架构版本**: v3.0 (本地 Flask + GitHub Pages)
**作者**: chenmq77
