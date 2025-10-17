# Gym ROI Tracker - 健身房回本计划 v2.0

## 📖 项目简介

这是一个帮助追踪健身房投资回报的工具，记录支出和使用情况，计算每次锻炼的实际成本。

## 📚 相关文档

在开始之前，建议先阅读：

- **业务需求**：[需求文档 - 项目概述](../../../docs/gym-roi-requirements.md#1-项目概述) 或 [[gym-roi-requirements#1. 项目概述|需求文档]] - 了解项目目标和功能
- **双重回本计算**：[需求文档 3.4.2](../../../docs/gym-roi-requirements.md#342-双重回本计算详解) 或 [[gym-roi-requirements#3.4.2 双重回本计算详解|双重回本]] - 详细业务逻辑
- **整体架构**：[架构设计文档 - 整体架构](../../../docs/gym-roi-architecture.md#整体架构) 或 [[gym-roi-architecture#整体架构|架构文档]] - 了解系统设计
- **后端实现**：[后端开发指南 - 核心计算逻辑](../../../backend/README.md#核心计算逻辑) 或 [[../backend/README#核心计算逻辑|后端指南]] - Python/Flask API 实现
- **配置说明**：[config.js](./config.js) 或 [[config|配置文件]] - 前端配置和计算函数

**v2.0 新特性**：
- 🌐 多币种支持（NZD/RMB 可切换）
- 📅 周扣费年卡模式
- 🎯 双重回本计算（短期 + 长期）
- 🏅 回本目标层级系统（回本线/铜牌/银牌/金牌）
- 🏊 游泳距离动态权重（高斯函数）
- 💪 所有活动类型支持强度权重
- 🏋️ 新增力量训练日（Gym Day）
- 📝 升级为训练日记系统
- ⚙️ 配置管理界面（Admin 可编辑）

## 📁 文件结构

```
gym-roi/
├── README.md                   # 项目说明（本文件）
├── config.js                   # 配置文件 v2.0（新增多币种、回本目标等）
├── components/                 # React 组件（待开发）
│   ├── ExpenseForm.jsx        # 支出录入表单
│   ├── ActivityForm.jsx       # 活动记录表单
│   ├── NoteEditor.jsx         # Markdown 笔记编辑器
│   ├── ConfigManager.jsx      # 配置管理界面（新增）
│   ├── Dashboard.jsx          # 数据看板
│   ├── ROIProgressCard.jsx    # 回本进度卡片（新增）
│   ├── ROIChart.jsx           # 回本曲线图
│   ├── ExpenseTimeline.jsx    # 支出趋势图
│   └── ActivityFrequency.jsx  # 活动频率图
├── pages/
│   ├── AdminPage.jsx          # 管理页面（localhost）
│   └── PublicPage.jsx         # 公开展示页面（GitHub Pages）
├── data/
│   ├── expenses.json          # 支出数据（新增周扣费年卡）
│   ├── activities.json        # 活动数据（新增 Gym Day）
│   └── notes/                 # 训练日记（Markdown）
│       ├── 2025-10-18-leg-training.md
│       └── 2025-10-19-chest-back-day.md
├── utils/
│   ├── storage.js             # localStorage 封装
│   ├── calculator.js          # ROI 计算逻辑（新增双重回本）
│   ├── export.js              # 数据导出
│   └── dataLoader.js          # 数据加载
```

## 🚀 快速开始

### 1. 本地开发（Admin 模式）
```bash
npm run dev
# 访问 http://localhost:5173/admin
```

在 Admin 页面可以：
- 录入支出和活动数据（支持多币种）
- 编辑训练日记（所有活动类型）
- 管理配置（权重、汇率、回本目标等）
- 查看实时统计
- 同步数据到 GitHub

### 2. 本地测试 Public 页面
```bash
npm run dev
# 访问 http://localhost:5173/gym-roi
```

**用途**：
- 模拟 GitHub Pages 展示效果
- 测试数据可视化
- 测试回本进度智能折叠显示
- 验证多币种切换

**数据流向**：
```
localStorage (Admin) → JSON 文件 → Public 页面
```

### 3. 生产展示（GitHub Pages）
```bash
# 在 Admin 点击"同步到 GitHub"后，执行：
git add src/apps/gym-roi/data
git commit -m "更新健身数据"
git push

# 访问 https://chenmq77.github.io/duckiki/gym-roi
```

## 📊 数据模型 v2.0

### 周扣费年卡 (新增)
```json
{
  "id": "exp_001",
  "type": "membership_weekly",
  "category": "周扣费年卡",
  "weeklyAmount": 17,
  "currency": "NZD",
  "contractMonths": 12,
  "freeWeeks": 4,
  "startDate": "2025-10-17",
  "billingDay": "Monday",
  "expectedTotal": 816,
  "actualPaid": 136,
  "discounts": [...]
}
```

### 固定资产（更新）
```json
{
  "id": "exp_002",
  "type": "equipment",
  "category": "游泳装备",
  "amount": 100,
  "currency": "NZD",
  "assetType": "essential",  // 新增：essential | reward
  "includeInROI": true
}
```

### 活动数据（更新）
```json
{
  "id": "act_001",
  "type": "swimming | group_class | personal_training | gym_day",
  "date": "2025-10-17",
  "data": {
    "distance": 1500,           // 游泳
    "className": "HIIT",        // 团课
    "intensity": "high",        // 新增：所有活动都有强度
    "exercises": "胸背日",      // 力量训练（新增）
    "noteFile": "*.md"
  },
  "calculatedWeight": 1.64      // 新增：动态计算的权重
}
```

## 🔧 配置说明 v2.0

### 货币设置（新增）
```javascript
currency: {
  default: 'NZD',
  exchangeRates: {
    NZD_TO_RMB: 4.1  // 可在 Admin 配置页面修改
  }
}
```

### 活动权重配置（更新）
```javascript
activityTypes: {
  swimming: {
    baseWeight: 1.0,
    dynamicWeight: true,      // 使用距离动态权重
    weightParams: {
      baseline: 1000,         // 基准距离（可调整）
      sigma: 400              // 标准差
    }
  },
  group_class: {
    baseWeight: 1.5,
    intensityMultiplier: {    // 新增
      light: 0.7,
      medium: 1.0,
      high: 1.3,
      extreme: 1.5
    }
  },
  gym_day: {                  // 新增类型
    baseWeight: 1.2,
    intensityMultiplier: { ... }
  }
}
```

### 回本目标层级（新增）
```javascript
roiTargets: {
  breakeven: { priceRatio: 1.0 },    // 市场价
  bronze: { priceRatio: 0.8 },       // 市场价 80%
  silver: { priceRatio: 0.6 },       // 市场价 60%
  gold: { priceRatio: 0.4 },         // 市场价 40%
  custom: { customPrice: null }      // 自定义
}
```

## 📈 计算逻辑 v2.0

**详细业务逻辑**：参见[需求文档 - 数据分析与可视化](../../../docs/gym-roi-requirements.md#3-4-数据分析与可视化)

**前端实现**：所有计算函数在 [`config.js`](./config.js) 中实现，包括：
- `calculateSwimmingWeight()`: 游泳距离动态权重（高斯函数）
- `calculateActivityWeight()`: 活动权重计算（含强度系数）

**核心逻辑概览**：

### 游泳距离动态权重
- 基准距离 1000m → 权重 1.0
- 少于基准 → 权重降低（如 500m → 0.64）
- 多于基准 → 权重增加（如 1500m → 1.64）

### 强度权重
- 最终权重 = 基础权重 × 强度系数
- 示例：高强度团课 = 1.5 × 1.3 = 1.95

### 双重回本计算

#### 模式 A：已扣费回本（短期激励）
```
已扣费: $34 NZD (2周)
当前活动: 10 次（加权）
单次成本: $3.4 NZD
→ ✅ 已超值！远低于市场价 $50
```

#### 模式 B：全年预期回本（长期目标）
```
预期总投入: $816 NZD
回本线目标: 816 / 50 = 16.32 次
当前进度: 10 / 16.32 = 61%
→ 还需 6 次达成回本线
```

## 📝 使用流程 v2.0

### 本地录入数据
1. 启动开发服务器 `npm run dev`
2. 访问 `/admin` 页面
3. **切换货币**：点击右上角 NZD ⇄ RMB
4. **录入周扣费年卡**：设置每周金额、扣款日等
5. **记录活动**：选择类型和强度
6. **编写训练日记**：支持所有活动类型
7. **调整配置**：在"配置管理"tab 修改权重、汇率等

### 同步到 GitHub
1. 点击"同步到 GitHub"按钮
2. 数据自动写入 `data/*.json`
3. 复制提示的 Git 命令
4. 在终端执行：
   ```bash
   git add src/apps/gym-roi/data
   git commit -m "更新健身数据"
   git push
   ```
5. GitHub Actions 自动部署

### 公开展示
1. 访问 `https://chenmq77.github.io/duckiki/gym-roi`
2. 切换币种查看数据
3. **查看回本进度**（智能折叠）：
   - 默认显示：已完成目标 + 下一个目标
   - 点击"展开"查看所有目标
4. 查看训练日记时间轴

## 🎯 功能特性 v2.0

### ✅ 已实现
- [x] 项目结构搭建
- [x] 需求文档编写 v2.0
- [x] 配置文件 v2.0（多币种、回本目标等）
- [x] 数据模板 v2.0（周扣费、Gym Day）
- [x] 示例训练日记（力量训练）

### 🚧 待开发
- [ ] React 组件开发
- [ ] 多币种切换UI
- [ ] 配置管理界面
- [ ] localStorage 存储逻辑
- [ ] 双重回本计算引擎
- [ ] 回本目标智能折叠显示
- [ ] 游泳距离动态权重实现
- [ ] 图表可视化
- [ ] 训练日记展示页面
- [ ] Markdown 编辑器
- [ ] 数据同步功能

## 📚 相关文档

- [详细需求文档 v2.0](../../../docs/gym-roi-requirements.md)
- [配置文件说明](./config.js)

## 🔄 版本历史

### v2.0 (2025-10-17)
- ✅ 多币种支持
- ✅ 周扣费年卡模式
- ✅ 双重回本计算
- ✅ 回本目标层级系统
- ✅ 游泳距离动态权重
- ✅ 所有活动类型强度权重
- ✅ 新增 Gym Day
- ✅ 训练日记系统
- ✅ 配置管理界面
- ✅ 智能折叠显示

### v1.0 (2025-10-17)
- 初始版本

---

**创建日期**: 2025-10-17
**更新日期**: 2025-10-17
**作者**: chenmq77
