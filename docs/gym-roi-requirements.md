# 健身房回本计划 - 需求文档

## 1. 项目概述

### 1.1 项目名称
Gym ROI Tracker - 健身房投资回报追踪工具

### 1.2 项目目标
帮助个人追踪健身房会员卡的支出和使用情况，计算每次锻炼的实际成本，评估健身房投资的性价比。

### 1.3 核心价值
- 量化健身房的使用频率和投资回报
- 激励更频繁地使用健身房设施
- 提供数据支持，帮助决策是否续卡

---

## 2. 用户场景

### 2.1 主要用户
个人使用者（作者本人）

### 2.2 使用流程

#### 场景1：在本地管理数据（localhost）
1. 打开 Admin 管理页面
2. 录入支出：购买年卡 ¥3000
3. 录入固定资产：购买游泳装备 ¥500
4. 每次去健身房后记录：
   - 游泳 1000 米
   - 上团课 1 次（高强度）
   - 私教课 1 次 + 写训练笔记
5. 查看实时统计：
   - 总支出 ¥3500
   - 总活动 15 次（加权）
   - 平均每次成本 ¥233
6. 导出数据为 JSON 文件

#### 场景2：展示给他人（GitHub Pages）
1. 将 JSON 数据推送到 GitHub
2. 访问公开页面查看可视化数据
3. 其他人可以看到你的健身记录和回本进度

---

## 3. 功能需求

### 3.1 支出管理

#### 3.1.1 支出类型
1. **会员费用** (Membership)
   - 周卡、月卡、季卡、年卡
   - 日期、金额、有效期
2. **固定资产** (Equipment)
   - 游泳装备、健身服、锁、鞋等
   - 一次性投入
3. **其他费用** (Others)
   - 临时消费（如储物柜单次租用、场地费等）

#### 3.1.2 数据字段
```json
{
  "id": "exp_001",
  "type": "membership | equipment | others",
  "category": "年卡 | 游泳装备 | ...",
  "amount": 3000,
  "date": "2025-10-17",
  "validFrom": "2025-10-17",
  "validTo": "2026-10-17",
  "note": "备注信息"
}
```

### 3.2 活动记录

#### 3.2.1 活动类型
1. **游泳** (Swimming)
   - 记录次数、距离（米）
   - 权重：1.0
   - 市场参考价：¥50/次
2. **团课** (Group Class)
   - 课程名称（瑜伽、动感单车、普拉提等）
   - 强度等级（低/中/高）
   - 权重：1.5
   - 市场参考价：¥80/次
3. **私教课** (Personal Training)
   - 课程主题
   - 时长（分钟）
   - 教练名字
   - 关联笔记 Markdown 文件
   - 权重：3.0
   - 市场参考价：¥300/次

#### 3.2.2 数据字段
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
    "noteFile": "2025-10-17-leg-training.md"
  },
  "note": "今天状态不错"
}
```

### 3.3 私教笔记系统

#### 3.3.1 功能
- Markdown 编辑器
- 自动生成文件名：`YYYY-MM-DD-topic.md`
- 保存到 `src/apps/gym-roi/data/notes/`
- 支持预览和导出

#### 3.3.2 笔记模板
```markdown
# 私教课程笔记

**日期**: 2025-10-17
**教练**: 张教练
**主题**: 腿部力量训练
**时长**: 60 分钟

## 训练内容
- 深蹲 4组 × 12次
- 腿举 3组 × 15次
- 保加利亚分腿蹲 3组 × 10次

## 重点提示
- 深蹲时膝盖不要超过脚尖
- 核心收紧，背部挺直

## 下次目标
- 增加深蹲重量到 80kg
```

### 3.4 数据分析与可视化

#### 3.4.1 核心指标
1. **总支出** (Total Expense)
   - 所有支出的总和
2. **加权活动次数** (Weighted Activities)
   - 游泳次数 × 1.0 + 团课次数 × 1.5 + 私教次数 × 3.0
3. **平均单次成本** (Average Cost per Session)
   - 总支出 ÷ 加权活动次数
4. **回本进度** (ROI Progress)
   - (实际成本 vs 市场参考价) × 100%
5. **节省金额** (Money Saved)
   - Σ(市场参考价 - 实际成本) × 活动次数

#### 3.4.2 计算公式

```javascript
// 加权总次数
const weightedTotal = activities.reduce((sum, act) => {
  const weight = config.weights[act.type];
  return sum + weight;
}, 0);

// 平均成本
const avgCost = totalExpense / weightedTotal;

// 每种活动的单次成本
const costPerSwimming = avgCost * config.weights.swimming; // 1.0
const costPerClass = avgCost * config.weights.group_class; // 1.5
const costPerPT = avgCost * config.weights.personal_training; // 3.0

// 性价比（相比市场价）
const savings = (referencePrice - actualCost) / referencePrice * 100;
```

#### 3.4.3 可视化图表
1. **支出趋势图** (Expense Timeline)
   - 折线图：时间 vs 累计支出
2. **活动频率图** (Activity Frequency)
   - 柱状图：每月活动次数分布
3. **回本曲线** (ROI Curve)
   - 折线图：累计支出 vs 累计价值（按市场价）
4. **活动类型占比** (Activity Distribution)
   - 饼图：游泳/团课/私教的次数占比

### 3.5 管理页面 (Admin)

#### 3.5.1 页面布局
```
+------------------------------------------+
|  Gym ROI Tracker - 管理中心              |
+------------------------------------------+
|  [支出管理] [活动记录] [笔记] [数据看板]  |
+------------------------------------------+
|                                          |
|  [录入表单区域]                           |
|                                          |
|  - 支出类型选择                           |
|  - 日期选择（默认今天）                   |
|  - 金额输入                               |
|  - 其他字段...                            |
|                                          |
|  [提交] [重置]                           |
|                                          |
+------------------------------------------+
|  最近记录列表                             |
|  - 编辑                                   |
|  - 删除                                   |
+------------------------------------------+
|  [导出数据到 JSON] [清空所有数据]         |
+------------------------------------------+
```

#### 3.5.2 功能按钮
- **导出数据**：下载 JSON 文件到本地
- **生成静态数据**：覆盖 `src/apps/gym-roi/data/` 下的 JSON
- **清空数据**：清除 localStorage（需确认）

### 3.6 展示页面 (Public)

#### 3.6.1 页面布局
```
+------------------------------------------+
|  健身房回本计划 - 数据看板                |
+------------------------------------------+
|  💰 总支出: ¥3,500                       |
|  🏃 总活动: 30 次（加权）                 |
|  💵 平均成本: ¥116.67/次                 |
|  📈 节省: ¥1,200 (相比市场价)             |
+------------------------------------------+
|  [支出趋势] [活动频率] [回本曲线]         |
|  [图表区域]                               |
+------------------------------------------+
|  活动明细                                 |
|  - 游泳: 15次 × ¥116.67 = ¥1,750        |
|    市场价 ¥50/次，节省 0%                 |
|  - 团课: 8次 × ¥175 = ¥1,400            |
|    市场价 ¥80/次，超值！                  |
|  - 私教: 5次 × ¥350 = ¥1,750            |
|    市场价 ¥300/次，略贵                   |
+------------------------------------------+
```

---

## 4. 数据模型

### 4.1 配置文件 (config.js)
```javascript
export const config = {
  // 活动权重
  weights: {
    swimming: 1.0,
    group_class: 1.5,
    personal_training: 3.0
  },

  // 市场参考价（可选）
  referencePrices: {
    swimming: 50,
    group_class: 80,
    personal_training: 300
  },

  // 团课强度系数（可选）
  intensityMultiplier: {
    low: 0.8,
    medium: 1.0,
    high: 1.2
  }
};
```

### 4.2 数据存储结构

#### expenses.json
```json
{
  "expenses": [
    {
      "id": "exp_001",
      "type": "membership",
      "category": "年卡",
      "amount": 3000,
      "date": "2025-10-17",
      "validFrom": "2025-10-17",
      "validTo": "2026-10-17",
      "note": ""
    },
    {
      "id": "exp_002",
      "type": "equipment",
      "category": "游泳装备",
      "amount": 500,
      "date": "2025-10-17",
      "note": "泳镜、泳帽、耳塞"
    }
  ]
}
```

#### activities.json
```json
{
  "activities": [
    {
      "id": "act_001",
      "type": "swimming",
      "date": "2025-10-17",
      "data": {
        "distance": 1000
      },
      "note": "状态不错"
    },
    {
      "id": "act_002",
      "type": "group_class",
      "date": "2025-10-17",
      "data": {
        "className": "动感单车",
        "intensity": "high"
      },
      "note": ""
    },
    {
      "id": "act_003",
      "type": "personal_training",
      "date": "2025-10-18",
      "data": {
        "topic": "腿部力量训练",
        "duration": 60,
        "trainer": "张教练",
        "noteFile": "2025-10-18-leg-training.md"
      },
      "note": ""
    }
  ]
}
```

---

## 5. 技术实现

### 5.1 技术栈
- **前端框架**: React 18 + Vite
- **UI 组件库**: Ant Design (推荐) / Tailwind CSS
- **图表库**: Recharts
- **路由**: React Router v6
- **Markdown**: react-markdown + remark-gfm
- **日期处理**: date-fns
- **数据存储**: localStorage (开发) + JSON (生产)

### 5.2 目录结构
```
src/apps/gym-roi/
├── components/
│   ├── ExpenseForm.jsx        # 支出录入表单
│   ├── ActivityForm.jsx       # 活动记录表单
│   ├── NoteEditor.jsx         # Markdown 笔记编辑器
│   ├── Dashboard.jsx          # 数据看板组件
│   ├── ROIChart.jsx           # 回本曲线图
│   ├── ExpenseTimeline.jsx    # 支出趋势图
│   ├── ActivityFrequency.jsx  # 活动频率图
│   └── DataTable.jsx          # 数据列表
├── pages/
│   ├── AdminPage.jsx          # 管理页面
│   └── PublicPage.jsx         # 公开展示页面
├── data/
│   ├── expenses.json          # 静态支出数据
│   ├── activities.json        # 静态活动数据
│   └── notes/                 # Markdown 笔记文件夹
├── utils/
│   ├── storage.js             # localStorage 封装
│   ├── calculator.js          # ROI 计算逻辑
│   ├── export.js              # 数据导出功能
│   └── dataLoader.js          # 数据加载（JSON/localStorage）
└── config.js                  # 配置文件
```

### 5.3 路由设计
```javascript
// App.jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/gym-roi" element={<PublicPage />} />
  <Route path="/admin" element={<AdminPage />} />
</Routes>
```

---

## 6. 部署方案

### 6.1 开发环境 (localhost)
- 使用 `npm run dev` 启动开发服务器
- 数据存储在浏览器 localStorage
- 可以实时录入和查看数据
- Admin 页面完全功能

### 6.2 生产环境 (GitHub Pages)
- 推送代码到 GitHub 自动部署
- 读取静态 JSON 文件展示数据
- Public 页面只读展示
- 其他人可以访问查看

### 6.3 数据同步流程
1. 在 localhost Admin 页面录入数据
2. 点击"导出数据"按钮
3. 数据写入 `src/apps/gym-roi/data/*.json`
4. Git 提交并推送到 GitHub
5. GitHub Actions 自动部署
6. Public 页面读取新数据展示

---

## 7. 后续扩展

### 7.1 Phase 2 功能（可选）
- 支持导入历史数据（CSV/Excel）
- 添加目标设定（每周/月活动次数）
- 邮件提醒（健身打卡提醒）
- 数据对比（月度/年度）

### 7.2 技术优化
- 接入后端数据库（Supabase / Firebase）
- 支持多用户（登录系统）
- 移动端适配（PWA）
- 数据备份与恢复

---

## 8. 交付清单

### 8.1 文档
- ✅ 需求文档（本文档）
- ⬜ API 接口文档（如有后端）
- ⬜ 用户使用手册

### 8.2 代码
- ⬜ 前端页面和组件
- ⬜ 数据处理逻辑
- ⬜ 配置文件
- ⬜ 单元测试（可选）

### 8.3 数据
- ⬜ JSON 数据模板
- ⬜ 示例数据
- ⬜ 示例 Markdown 笔记

---

## 9. 时间规划

### 第一阶段：基础框架（预计 2-3 天）
- 创建项目结构
- 搭建路由和页面框架
- 实现 localStorage 存储

### 第二阶段：核心功能（预计 3-4 天）
- 支出和活动表单
- 数据计算逻辑
- 基础数据展示

### 第三阶段：可视化（预计 2-3 天）
- 集成图表库
- 实现各类图表
- 优化界面样式

### 第四阶段：完善与测试（预计 1-2 天）
- Markdown 笔记功能
- 数据导出导入
- 测试和修复 bug

---

**文档版本**: v1.0
**创建日期**: 2025-10-17
**作者**: Claude & chenmq77
