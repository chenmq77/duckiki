# Gym ROI Tracker - 健身房回本计划

## 📖 项目简介

这是一个帮助追踪健身房投资回报的工具，记录支出和使用情况，计算每次锻炼的实际成本。

## 📁 文件结构

```
gym-roi/
├── README.md                   # 项目说明（本文件）
├── config.js                   # 配置文件（权重、参考价等）
├── components/                 # React 组件
│   ├── ExpenseForm.jsx        # 支出录入表单
│   ├── ActivityForm.jsx       # 活动记录表单
│   ├── NoteEditor.jsx         # Markdown 笔记编辑器
│   ├── Dashboard.jsx          # 数据看板
│   ├── ROIChart.jsx           # 回本曲线图
│   ├── ExpenseTimeline.jsx    # 支出趋势图
│   ├── ActivityFrequency.jsx  # 活动频率图
│   └── DataTable.jsx          # 数据列表
├── pages/
│   ├── AdminPage.jsx          # 管理页面（localhost）
│   └── PublicPage.jsx         # 公开展示页面（GitHub Pages）
├── data/
│   ├── expenses.json          # 支出数据
│   ├── activities.json        # 活动数据
│   └── notes/                 # Markdown 笔记
│       └── *.md
├── utils/
│   ├── storage.js             # localStorage 封装
│   ├── calculator.js          # ROI 计算逻辑
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
- 录入支出和活动数据
- 编辑私教笔记
- 查看实时统计
- 导出数据为 JSON

### 2. 生产展示（Public 模式）
```bash
# 推送代码到 GitHub
git add .
git commit -m "更新健身数据"
git push

# 访问 https://chenmq77.github.io/duckiki/gym-roi
```

## 📊 数据模型

### 支出数据 (expenses.json)
```json
{
  "id": "exp_001",
  "type": "membership | equipment | others",
  "category": "年卡 | 游泳装备 | ...",
  "amount": 3000,
  "date": "2025-10-17",
  "validFrom": "2025-10-17",  // 可选
  "validTo": "2026-10-17",    // 可选
  "note": "备注"
}
```

### 活动数据 (activities.json)
```json
{
  "id": "act_001",
  "type": "swimming | group_class | personal_training",
  "date": "2025-10-17",
  "data": {
    // 游泳
    "distance": 1000,

    // 团课
    "className": "动感单车",
    "intensity": "high | medium | low",

    // 私教
    "topic": "腿部力量训练",
    "duration": 60,
    "trainer": "张教练",
    "noteFile": "2025-10-18-leg-training.md"
  },
  "note": "备注"
}
```

## 🔧 配置说明

编辑 `config.js` 可以自定义：

### 活动权重
```javascript
weights: {
  swimming: 1.0,         // 游泳
  group_class: 1.5,      // 团课
  personal_training: 3.0 // 私教
}
```

### 市场参考价
```javascript
referencePrices: {
  swimming: 50,          // 单次游泳 ¥50
  group_class: 80,       // 单次团课 ¥80
  personal_training: 300 // 单次私教 ¥300
}
```

## 📈 计算逻辑

### 加权总次数
```
加权总次数 = 游泳次数×1.0 + 团课次数×1.5 + 私教次数×3.0
```

### 平均成本
```
平均成本 = 总支出 ÷ 加权总次数
```

### 每种活动单次成本
```
游泳单次成本 = 平均成本 × 1.0
团课单次成本 = 平均成本 × 1.5
私教单次成本 = 平均成本 × 3.0
```

### 性价比
```
性价比 = (市场参考价 - 实际成本) ÷ 市场参考价 × 100%
```

## 📝 使用流程

### 本地录入数据
1. 启动开发服务器 `npm run dev`
2. 访问 `/admin` 页面
3. 录入支出：购买年卡、装备等
4. 记录活动：游泳、团课、私教
5. 编写私教笔记（Markdown）
6. 查看实时统计和图表

### 导出并部署
1. 点击"导出数据"按钮
2. 数据写入 `data/*.json` 文件
3. 提交到 Git
4. 推送到 GitHub
5. 自动部署到 GitHub Pages

### 公开展示
1. 访问 `https://chenmq77.github.io/duckiki/gym-roi`
2. 查看数据看板和图表
3. 分享给朋友展示你的健身成果

## 🎯 功能特性

### ✅ 已实现
- [x] 项目结构搭建
- [x] 需求文档编写
- [x] 配置文件和数据模板
- [x] 示例数据和笔记

### 🚧 待开发
- [ ] React 组件开发
- [ ] localStorage 存储逻辑
- [ ] ROI 计算引擎
- [ ] 图表可视化
- [ ] Markdown 编辑器
- [ ] 数据导出功能

## 📚 相关文档

- [详细需求文档](../../../docs/gym-roi-requirements.md)
- [配置文件说明](./config.js)

---

**创建日期**: 2025-10-17
**作者**: chenmq77
