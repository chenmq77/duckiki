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
- 支持多币种显示，方便跨国使用

### 1.4 多币种支持
- **默认货币**: NZD（新西兰元）
- **可切换显示**: RMB（人民币）
- **汇率**: 1 NZD = 4.1 RMB（可在 Admin 配置）
- **切换方式**: 页面右上角货币切换按钮

---

## 2. 用户场景

### 2.1 主要用户
个人使用者（作者本人）

### 2.2 使用流程

#### 场景1：在本地管理数据（localhost）
1. 打开 Admin 管理页面
2. 录入支出：
   - 周扣费年卡：每周 $17 NZD × 48周 = $816 NZD
   - 固定资产：游泳装备 $100 NZD（必须投入）
3. 每次去健身房后记录：
   - 游泳 1500 米（高强度）
   - 上团课 1 次（HIIT，高强度）
   - 私教课 1 次（极限强度）+ 写训练日记
   - 自主力量训练 1 次（中等强度）
4. 查看实时统计：
   - 总支出: $916 NZD / ¥3,756 RMB（可切换）
   - 总活动: 18 次（加权）
   - 平均每次成本: $50.9 NZD
   - 回本进度: 已达成回本线，冲刺铜牌目标
5. 导出数据为 JSON 文件

#### 场景2：展示给他人（GitHub Pages）
1. 将 JSON 数据推送到 GitHub
2. 访问公开页面查看可视化数据
3. 其他人可以看到你的健身记录和回本进度

---

## 3. 功能需求

### 3.1 支出管理

#### 3.1.1 支出类型
1. **会员费用** (Membership)
   - 一次性支付：周卡、月卡、季卡、年卡
   - **周扣费年卡**（新增）：每周自动扣费模式
     - 记录每周扣费金额、扣款日、合同时长
     - 支持折扣记录（如免费周、优惠活动）
     - 自动计算已扣费金额和预期总价
2. **固定资产** (Equipment)
   - 游泳装备、健身服、锁、鞋等
   - **资产分类**（新增）：
     - `essential`: 必须投入（默认，计入回本成本）
     - `reward`: 阶段性奖励（可选计入）
3. **其他费用** (Others)
   - 临时消费（如储物柜单次租用、场地费等）

#### 3.1.2 数据字段

**一次性会员卡**：
```json
{
  "id": "exp_001",
  "type": "membership",
  "category": "年卡",
  "amount": 816,
  "currency": "NZD",
  "date": "2025-10-17",
  "validFrom": "2025-10-17",
  "validTo": "2026-10-17",
  "note": "备注信息"
}
```

**周扣费年卡**（新增）：
```json
{
  "id": "exp_002",
  "type": "membership_weekly",
  "category": "周扣费年卡",
  "weeklyAmount": 17,
  "currency": "NZD",
  "contractMonths": 12,
  "freeWeeks": 4,
  "startDate": "2025-10-17",
  "billingDay": "Monday",
  "totalWeeks": 52,
  "paidWeeks": 48,
  "expectedTotal": 816,
  "actualPaid": 136,
  "discounts": [
    { "date": "2025-11-01", "amount": 17, "reason": "优惠活动" }
  ],
  "note": "每周一扣费 $17"
}
```

**固定资产**（更新）：
```json
{
  "id": "exp_003",
  "type": "equipment",
  "category": "游泳装备",
  "amount": 100,
  "currency": "NZD",
  "assetType": "essential",
  "date": "2025-10-17",
  "note": "泳镜、泳帽、耳塞",
  "includeInROI": true
}
```

### 3.2 活动记录

#### 3.2.1 活动类型

1. **游泳** (Swimming)
   - 记录距离（米）
   - **动态权重**：基于距离的高斯函数（详见 3.2.3）
     - 基准距离 1000m → 权重 1.0
     - 少于基准 → 权重降低（如 500m → 0.64）
     - 多于基准 → 权重增加（如 1500m → 1.64）
   - 市场参考价：$50 NZD/次

2. **团课** (Group Class)
   - 课程名称（瑜伽、动感单车、普拉提、HIIT 等）
   - **强度等级**（新增权重影响）：
     - `light`: 轻松课程（拉伸、恢复性瑜伽）→ 权重 × 0.7
     - `medium`: 常规强度 → 权重 × 1.0
     - `high`: 高强度（HIIT、搏击操）→ 权重 × 1.3
     - `extreme`: 极限挑战 → 权重 × 1.5
   - 基础权重：1.5
   - 最终权重：1.5 × 强度系数
   - 市场参考价：$80 NZD/次

3. **私教课** (Personal Training)
   - 课程主题
   - 时长（分钟）
   - 教练名字
   - **强度等级**（新增）：
     - `light`: 恢复性训练 → 权重 × 0.8
     - `medium`: 常规训练 → 权重 × 1.0
     - `hard`: 大重量训练 → 权重 × 1.3
     - `extreme`: 力竭训练 → 权重 × 1.5
   - 关联训练日记 Markdown 文件
   - 基础权重：3.0
   - 最终权重：3.0 × 强度系数
   - 市场参考价：$300 NZD/次

4. **力量训练日** (Gym Day)（新增）
   - 训练内容（如：胸背日、腿臀日）
   - 时长（分钟）
   - **强度等级**：
     - `light`: 恢复性训练 → 权重 × 0.8
     - `medium`: 常规训练 → 权重 × 1.0
     - `hard`: 大重量训练 → 权重 × 1.2
     - `extreme`: 力竭训练 → 权重 × 1.4
   - 可关联训练日记
   - 基础权重：1.2
   - 最终权重：1.2 × 强度系数
   - 市场参考价：$0（包含在会员卡内）

#### 3.2.2 游泳距离动态权重公式

使用**高斯函数 + 非对称奖励机制**：

```javascript
/**
 * 游泳距离动态权重（高斯曲线 + 超出基准奖励）
 * @param {number} distance - 游泳距离（米）
 * @param {number} baseline - 基准距离（默认 1000m，可随体能调整）
 * @param {number} sigma - 标准差（默认 400，控制容忍度）
 * @returns {number} 权重系数
 */
function calculateSwimmingWeight(distance, baseline = 1000, sigma = 400) {
  if (distance <= 0) return 0;

  const deviation = distance - baseline;

  // 高斯权重（对称）
  const gaussianWeight = Math.exp(
    -(deviation * deviation) / (2 * sigma * sigma)
  );

  if (distance <= baseline) {
    // 小于等于基准：使用高斯权重（惩罚）
    // 500m  → 0.64
    // 750m  → 0.88
    // 1000m → 1.0
    return gaussianWeight;
  } else {
    // 大于基准：高斯权重 + 1.0（奖励）
    // 1500m → 0.64 + 1 = 1.64
    // 2000m → 0.14 + 1 = 1.14
    // 3000m → 0.00 + 1 = 1.0（保底）
    return gaussianWeight + 1.0;
  }
}

// 效果示例：
// 500m  → 0.64  (少游，惩罚)
// 1000m → 1.0   (基准)
// 1500m → 1.64  (多游500m，奖励！)
// 2000m → 1.14  (多游1000m，继续奖励但递减)
```

**配置参数**：
- `baseline`: 基准距离（1000m），随体能提升可调整（如 1200m、1500m）
- `sigma`: 标准差（400），控制曲线陡峭程度，越大越宽松

#### 3.2.3 数据字段

**游泳记录**：
```json
{
  "id": "act_001",
  "type": "swimming",
  "date": "2025-10-17",
  "data": {
    "distance": 1500
  },
  "calculatedWeight": 1.64,
  "note": "状态不错，多游了500m"
}
```

**团课记录**（更新）：
```json
{
  "id": "act_002",
  "type": "group_class",
  "date": "2025-10-17",
  "data": {
    "className": "HIIT 燃脂",
    "intensity": "high"
  },
  "calculatedWeight": 1.95,
  "note": "高强度，出了很多汗"
}
```

**私教记录**（更新）：
```json
{
  "id": "act_003",
  "type": "personal_training",
  "date": "2025-10-18",
  "data": {
    "topic": "腿部力量训练",
    "duration": 60,
    "trainer": "张教练",
    "intensity": "extreme",
    "noteFile": "2025-10-18-leg-training.md"
  },
  "calculatedWeight": 4.5,
  "note": "极限训练，突破个人记录"
}
```

**力量训练日**（新增）：
```json
{
  "id": "act_004",
  "type": "gym_day",
  "date": "2025-10-19",
  "data": {
    "exercises": "胸背日",
    "duration": 90,
    "intensity": "hard",
    "noteFile": "2025-10-19-chest-back-day.md"
  },
  "calculatedWeight": 1.44,
  "note": "卧推增重5kg"
}
```

### 3.3 训练日记系统（升级）

**从"私教笔记"升级为"训练日记"**，支持所有活动类型的记录。

#### 3.3.1 功能
- Markdown 编辑器（支持实时预览）
- 自动生成文件名：`YYYY-MM-DD-activity-topic.md`
- 保存到 `src/apps/gym-roi/data/notes/`
- 支持所有活动类型：游泳、团课、私教、力量训练
- 支持导出和分享

#### 3.3.2 训练日记展示页面

**时间轴视图**：
- 按日期倒序显示所有日记
- 可按月份筛选
- 可按活动类型筛选（游泳/团课/私教/力量）
- 点击展开查看完整内容（Markdown 渲染）

**成长可视化**：
- 提取关键数据（如：深蹲重量、游泳距离）
- 生成趋势图表，展示进步轨迹

#### 3.3.3 笔记模板示例

**私教课程日记**：
```markdown
# 私教课程 - 腿部力量训练

**日期**: 2025-10-18
**教练**: 张教练
**时长**: 60 分钟
**强度**: 极限 ⭐⭐⭐⭐⭐

## 训练内容
- 深蹲 4组 × 12次 @ 70kg
- 腿举 3组 × 15次 @ 100kg
- 保加利亚分腿蹲 3组 × 10次 @ 自重+10kg

## 重点提示
- 深蹲时膝盖不要超过脚尖
- 核心收紧，背部挺直

## 个人感受
今天状态很好，深蹲重量突破70kg！

## 下次目标
- 深蹲增重到 75kg
```

**力量训练日记**：
```markdown
# 力量训练 - 胸背日

**日期**: 2025-10-19
**时长**: 90 分钟
**强度**: 大重量 ⭐⭐⭐⭐

## 训练内容

### 胸部
- 平板卧推 4组 × 10次 @ 60kg
- 上斜哑铃推举 3组 × 12次 @ 20kg
- 飞鸟 3组 × 15次 @ 12kg

### 背部
- 引体向上 4组 × 8次
- 坐姿划船 4组 × 12次 @ 50kg
- 单臂哑铃划船 3组 × 12次 @ 22kg

## 今日成就
卧推终于突破60kg了！💪

## 下次计划
- 增加引体向上次数到 10 次
```

**游泳日记**（可选）：
```markdown
# 游泳训练

**日期**: 2025-10-20
**距离**: 1500m
**用时**: 35 分钟

## 训练内容
- 热身 200m（自由泳）
- 主组 10×100m（间歇 20 秒）
- 放松 300m（蛙泳）

## 感受
今天配速稳定，100m 保持在 2:10 左右
```

### 3.4 数据分析与可视化

#### 3.4.1 核心指标

1. **总支出** (Total Expense)
   - 所有支出的总和（可按币种显示）
   - 周扣费模式：分别显示"已扣费"和"预期总价"

2. **加权活动次数** (Weighted Activities)
   - 使用动态权重计算
   - 游泳：距离动态权重
   - 团课：基础权重 × 强度系数
   - 私教：基础权重 × 强度系数
   - 力量训练：基础权重 × 强度系数

3. **平均单次成本** (Average Cost per Session)
   - 总支出 ÷ 加权活动次数

4. **双重回本进度**（新增）
   - **模式 A：已扣费回本**（短期激励）
     - 已扣费金额 ÷ 当前加权次数 = 实际单次成本
     - vs 市场价对比
   - **模式 B：全年预期回本**（长期目标）
     - 预期总价 ÷ 目标次数 = 期望单次成本
     - 回本目标层级（见 3.4.3）

5. **节省金额** (Money Saved)
   - Σ(市场参考价 - 实际成本) × 活动次数

#### 3.4.2 双重回本计算详解

**模式 A：已扣费回本（短期激励）**

```javascript
// 示例：已训练 2 周
const actualPaid = 34;        // $17 × 2周
const currentActivities = 10; // 加权次数
const avgCost = 34 / 10;      // $3.4/次

// 结果：
// ✅ 已超值！单次仅 $3.4，远低于市场价 $50
```

**模式 B：全年预期回本（长期目标）**

```javascript
// 示例：周扣费年卡
const expectedTotal = 816;    // $17 × 48周
const marketPrice = 50;       // 单次游泳市场价

// 回本目标层级
const targets = {
  breakeven: {
    label: '回本线',
    requiredCount: 816 / 50,  // 16.32 次
    priceRatio: 1.0           // 市场价 100%
  },
  bronze: {
    label: '铜牌目标',
    requiredCount: 816 / (50 * 0.8),  // 20.4 次
    priceRatio: 0.8           // 市场价 80%
  },
  silver: {
    label: '银牌目标',
    requiredCount: 816 / (50 * 0.6),  // 27.2 次
    priceRatio: 0.6           // 市场价 60%
  },
  gold: {
    label: '金牌目标',
    requiredCount: 816 / (50 * 0.4),  // 40.8 次
    priceRatio: 0.4           // 市场价 40%
  }
};

// 当前进度：10 次
// 回本线：10/16.32 = 61% ✅ 接近达成
// 铜牌：10/20.4 = 49%
// 银牌：10/27.2 = 37%
// 金牌：10/40.8 = 24%
```

#### 3.4.3 回本目标层级系统（新增）

**目标配置**：
```javascript
const roiTargets = {
  breakeven: {
    label: "回本线",
    icon: "📍",
    priceRatio: 1.0,
    color: "gray",
    description: "达到市场价，不亏不赚"
  },
  bronze: {
    label: "铜牌目标",
    icon: "🥉",
    priceRatio: 0.8,
    color: "#CD7F32",
    description: "比市场价便宜 20%"
  },
  silver: {
    label: "银牌目标",
    icon: "🥈",
    priceRatio: 0.6,
    color: "#C0C0C0",
    description: "比市场价便宜 40%"
  },
  gold: {
    label: "金牌目标",
    icon: "🥇",
    priceRatio: 0.4,
    color: "#FFD700",
    description: "比市场价便宜 60%，超值！"
  },
  custom: {
    label: "自定义目标",
    icon: "💜",
    priceRatio: null,
    color: "#9C27B0",
    description: "设置你的专属目标"
  }
};
```

**智能折叠显示规则**：
- **默认显示**：
  - 已完成的最高目标（如果有）
  - 下一个未完成的目标（显示进度条）
- **折叠显示**：
  - 点击"展开更多目标"查看全部
  - 避免压力过大，保持积极激励

#### 3.4.4 计算公式（更新）

```javascript
// 加权总次数（使用动态权重）
const weightedTotal = activities.reduce((sum, act) => {
  let weight = calculateActivityWeight(act);
  return sum + weight;
}, 0);

// 计算活动权重（含强度和距离）
function calculateActivityWeight(activity) {
  const config = activityTypes[activity.type];
  let weight = config.baseWeight;

  // 游泳：距离动态权重
  if (activity.type === 'swimming') {
    weight = calculateSwimmingWeight(activity.data.distance);
  }

  // 其他活动：基础权重 × 强度系数
  if (activity.data.intensity && config.intensityMultiplier) {
    weight *= config.intensityMultiplier[activity.data.intensity];
  }

  return weight;
}

// 平均成本
const avgCost = totalExpense / weightedTotal;

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

#### 3.5.1 页面布局（更新）
```
+--------------------------------------------------+
|  Gym ROI Tracker - 管理中心         [NZD ⇄ RMB] |
+--------------------------------------------------+
|  [支出管理] [活动记录] [训练日记] [配置管理] [数据看板] |
+--------------------------------------------------+
|                                                  |
|  [录入表单区域]                                   |
|                                                  |
|  - 活动/支出类型选择                              |
|  - 日期选择（默认今天）                           |
|  - 金额/距离/强度输入                             |
|  - 其他字段...                                    |
|                                                  |
|  [提交] [重置]                                   |
|                                                  |
+--------------------------------------------------+
|  最近记录列表                                     |
|  - 编辑                                           |
|  - 删除                                           |
+--------------------------------------------------+
|  [导出数据到 JSON] [同步到 GitHub] [清空数据]     |
+--------------------------------------------------+
```

#### 3.5.2 新增：配置管理界面

**Tab 布局**：
```
+--------------------------------------------------+
|  配置管理                                         |
+--------------------------------------------------+
|  [货币设置] [活动权重] [目标配置] [游泳公式]      |
+--------------------------------------------------+
|                                                  |
|  【货币设置】                                     |
|  - 默认货币: [NZD ▼]                             |
|  - NZD → RMB 汇率: [4.1    ]                    |
|                                                  |
|  【活动权重配置】                                 |
|  游泳基础权重: [1.0    ]                         |
|  - 基准距离 (m): [1000  ]                        |
|  - 标准差 σ: [400  ]                            |
|                                                  |
|  团课基础权重: [1.5    ]                         |
|  强度系数:                                        |
|    轻松 [0.7 ] 常规 [1.0 ] 高强度 [1.3 ] 极限 [1.5] |
|                                                  |
|  私教基础权重: [3.0    ]                         |
|  强度系数:                                        |
|    轻松 [0.8 ] 常规 [1.0 ] 大重量 [1.3 ] 极限 [1.5] |
|                                                  |
|  力量训练基础权重: [1.2    ]                     |
|  强度系数:                                        |
|    轻松 [0.8 ] 常规 [1.0 ] 大重量 [1.2 ] 极限 [1.4] |
|                                                  |
|  【市场参考价】（NZD）                            |
|  游泳: [$50   ] 团课: [$80   ] 私教: [$300  ]   |
|                                                  |
|  【回本目标配置】                                 |
|  回本线: 市场价 × [1.0 ] (100%)                  |
|  铜牌: 市场价 × [0.8 ] (80%)                     |
|  银牌: 市场价 × [0.6 ] (60%)                     |
|  金牌: 市场价 × [0.4 ] (40%)                     |
|  自定义: [$    ] /次                             |
|                                                  |
|  [保存配置] [恢复默认] [导出配置]                |
+--------------------------------------------------+
```

#### 3.5.3 功能按钮（更新）

1. **导出数据到 JSON**
   - 将 localStorage 数据导出为 JSON 文件
   - 下载到本地（浏览器下载）

2. **同步到 GitHub**（新增）
   - **方案 A**（推荐）：半自动
     - 点击按钮后，数据写入 `src/apps/gym-roi/data/` 目录
     - 弹出提示框，显示需要执行的 Git 命令
     - 用户手动在终端执行 `git add . && git commit -m "update" && git push`
   - **方案 B**（可选）：一键部署
     - 需要配置 GitHub Personal Access Token
     - 点击按钮自动提交推送（未来实现）

3. **清空所有数据**
   - 清除 localStorage 中的所有数据
   - 需要二次确认（防止误操作）

4. **保存配置**
   - 将配置保存到 localStorage
   - 可导出为 config.json 文件

5. **恢复默认配置**
   - 恢复到初始默认值

### 3.6 展示页面 (Public)

#### 3.6.1 页面布局（更新）

**场景：刚开始（还没达成任何目标）**
```
+--------------------------------------------------------+
|  健身房回本计划 - 数据看板              [NZD ⇄ RMB]    |
+--------------------------------------------------------+
|  💰 总支出: $916 NZD / ¥3,756 RMB                      |
|  💰 已扣费: $34 NZD（2周） | 预期总价: $816 NZD        |
|  🏃 总活动: 10 次（加权）                               |
|  💵 平均成本: $91.6 NZD/次                             |
+--------------------------------------------------------+
|                                                        |
|  【已扣费回本】（短期激励）                             |
|  ✅ 已超值！单次仅 $3.4，远低于市场价 $50              |
|                                                        |
|  【全年预期回本】（长期目标）                           |
|                                                        |
|  🎯 下一个目标：📍 回本线 (市场价)                     |
|  ████████████░░░░░░░░ 61% (10/16 次)                  |
|  💰 当前单次: $81.6 vs 目标 $50                       |
|  📊 还需 6 次达成                                      |
|                                                        |
|  [▼ 展开更多目标 (3个)]                                |
|                                                        |
+--------------------------------------------------------+
|  [支出趋势] [活动频率] [回本曲线] [训练日记]            |
|  [图表区域]                                             |
+--------------------------------------------------------+
|  活动明细                                               |
|  - 游泳: 5次 (加权 7.2) × $91.6 = $659.5              |
|    市场价 $50/次，当前略贵                              |
|  - 团课 (HIIT): 2次 (加权 1.95×2) × $91.6 = $357     |
|    市场价 $80/次，超值！                                |
|  - 私教 (极限): 1次 (加权 4.5) × $91.6 = $412        |
|    市场价 $300/次，超值！                               |
|  - 力量训练: 2次 (加权 1.44×2) × $91.6 = $264        |
|    市场价 $0（包含在会员卡）                            |
+--------------------------------------------------------+
```

**场景：已达成回本线，冲刺铜牌（展开状态）**
```
+--------------------------------------------------------+
|  健身房回本计划 - 数据看板              [NZD ⇄ RMB]    |
+--------------------------------------------------------+
|  💰 预期总支出: $816 NZD / ¥3,346 RMB                 |
|  🏃 总活动: 18 次（加权）                               |
|  💵 平均成本: $45.3 NZD/次                             |
+--------------------------------------------------------+
|                                                        |
|  【全年预期回本进度】                                   |
|                                                        |
|  ✅ 已达成：📍 回本线                                  |
|  ████████████████████ 100% 已完成！                    |
|  💰 当前单次: $45.3 (低于市场价 $50)                   |
|                                                        |
|  🎯 进行中：🥉 铜牌目标                                 |
|  █████████████████░░░ 88% (18/20 次)                  |
|  💰 目标单次: $40                                      |
|  📊 还需 2 次达成，加油！                               |
|                                                        |
|  🥈 银牌目标 (市场价 60%)                              |
|  █████████████░░░░░░░ 66% (18/27 次)                  |
|  📊 还需 9 次                                          |
|                                                        |
|  🥇 金牌目标 (市场价 40%)                              |
|  █████████░░░░░░░░░░░ 44% (18/41 次)                  |
|  📊 还需 23 次                                         |
|                                                        |
|  [▲ 收起]                                              |
|                                                        |
+--------------------------------------------------------+
```

---

## 4. 数据模型

### 4.1 配置文件 (config.js)（完整更新）

```javascript
export const config = {
  // 货币设置（新增）
  currency: {
    default: 'NZD',
    exchangeRates: {
      'NZD_TO_RMB': 4.1
    }
  },

  // 活动权重配置
  activityTypes: {
    swimming: {
      label: '游泳',
      icon: '🏊',
      baseWeight: 1.0,
      dynamicWeight: true,    // 使用距离动态权重
      weightParams: {         // 游泳权重公式参数
        baseline: 1000,       // 基准距离（米）
        sigma: 400            // 标准差
      },
      referencePrice: 50,     // NZD
      fields: ['distance']
    },

    group_class: {
      label: '团课',
      icon: '🧘',
      baseWeight: 1.5,
      intensityMultiplier: {  // 强度系数（新增）
        light: 0.7,
        medium: 1.0,
        high: 1.3,
        extreme: 1.5
      },
      referencePrice: 80,     // NZD
      fields: ['className', 'intensity']
    },

    personal_training: {
      label: '私教',
      icon: '💪',
      baseWeight: 3.0,
      intensityMultiplier: {  // 强度系数
        light: 0.8,
        medium: 1.0,
        hard: 1.3,
        extreme: 1.5
      },
      referencePrice: 300,    // NZD
      fields: ['topic', 'duration', 'trainer', 'intensity', 'noteFile']
    },

    gym_day: {                // 新增
      label: '力量训练',
      icon: '🏋️',
      baseWeight: 1.2,
      intensityMultiplier: {
        light: 0.8,
        medium: 1.0,
        hard: 1.2,
        extreme: 1.4
      },
      referencePrice: 0,      // 包含在会员卡内
      fields: ['exercises', 'duration', 'intensity', 'noteFile']
    }
  },

  // 支出类型配置
  expenseTypes: {
    membership: {
      label: '会员费用',
      categories: ['周卡', '月卡', '季卡', '年卡', '次卡']
    },
    membership_weekly: {      // 新增
      label: '周扣费年卡',
      categories: ['周扣费年卡']
    },
    equipment: {
      label: '固定资产',
      categories: ['游泳装备', '健身服', '鞋', '锁', '其他装备'],
      assetTypes: ['essential', 'reward']  // 新增：必须/奖励
    },
    others: {
      label: '其他费用',
      categories: ['储物柜', '毛巾', '淋浴用品', '其他']
    }
  },

  // 回本目标层级（新增）
  roiTargets: {
    breakeven: {
      label: '回本线',
      icon: '📍',
      priceRatio: 1.0,
      color: '#9E9E9E',
      description: '达到市场价，不亏不赚'
    },
    bronze: {
      label: '铜牌目标',
      icon: '🥉',
      priceRatio: 0.8,
      color: '#CD7F32',
      description: '比市场价便宜 20%'
    },
    silver: {
      label: '银牌目标',
      icon: '🥈',
      priceRatio: 0.6,
      color: '#C0C0C0',
      description: '比市场价便宜 40%'
    },
    gold: {
      label: '金牌目标',
      icon: '🥇',
      priceRatio: 0.4,
      color: '#FFD700',
      description: '比市场价便宜 60%，超值！'
    },
    custom: {
      label: '自定义目标',
      icon: '💜',
      priceRatio: null,       // 用户自定义
      customPrice: null,      // 自定义单次价格
      color: '#9C27B0',
      description: '设置你的专属目标'
    }
  },

  // 团课类型列表
  groupClassTypes: [
    '瑜伽', '普拉提', '动感单车', 'HIIT',
    '搏击操', '有氧舞蹈', '核心训练', '拉伸放松', '其他'
  ]
};

export default config;
```

### 4.2 数据存储结构

#### expenses.json（更新）
```json
{
  "expenses": [
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
      "totalWeeks": 52,
      "paidWeeks": 48,
      "expectedTotal": 816,
      "actualPaid": 136,
      "discounts": [
        {
          "date": "2025-11-01",
          "amount": 17,
          "reason": "优惠活动"
        }
      ],
      "note": "每周一扣费 $17"
    },
    {
      "id": "exp_002",
      "type": "equipment",
      "category": "游泳装备",
      "amount": 100,
      "currency": "NZD",
      "assetType": "essential",
      "date": "2025-10-17",
      "note": "泳镜、泳帽、耳塞",
      "includeInROI": true
    }
  ],
  "meta": {
    "lastUpdated": "2025-10-19",
    "totalExpense": 916,
    "actualPaid": 236
  }
}
```

#### activities.json（更新）
```json
{
  "activities": [
    {
      "id": "act_001",
      "type": "swimming",
      "date": "2025-10-17",
      "data": {
        "distance": 1500
      },
      "calculatedWeight": 1.64,
      "note": "状态不错，多游了500m"
    },
    {
      "id": "act_002",
      "type": "group_class",
      "date": "2025-10-17",
      "data": {
        "className": "HIIT 燃脂",
        "intensity": "high"
      },
      "calculatedWeight": 1.95,
      "note": "高强度，出了很多汗"
    },
    {
      "id": "act_003",
      "type": "personal_training",
      "date": "2025-10-18",
      "data": {
        "topic": "腿部力量训练",
        "duration": 60,
        "trainer": "张教练",
        "intensity": "extreme",
        "noteFile": "2025-10-18-leg-training.md"
      },
      "calculatedWeight": 4.5,
      "note": "极限训练，突破个人记录"
    },
    {
      "id": "act_004",
      "type": "gym_day",
      "date": "2025-10-19",
      "data": {
        "exercises": "胸背日",
        "duration": 90,
        "intensity": "hard",
        "noteFile": "2025-10-19-chest-back-day.md"
      },
      "calculatedWeight": 1.44,
      "note": "卧推增重5kg"
    }
  ],
  "meta": {
    "lastUpdated": "2025-10-19",
    "totalActivities": 4,
    "weightedTotal": 9.53
  }
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
  <Route path="/admin/gym-roi" element={<GymROIAdmin />} />
</Routes>
```

---

## 6. 部署方案

### 6.1 开发环境 (localhost)

#### 6.1.1 Admin 模式（数据录入）
```bash
npm run dev
# 访问 http://localhost:5173/admin
```
- 数据存储在浏览器 localStorage
- 可以实时录入和查看数据
- 支持配置管理和数据导出

#### 6.1.2 Public 模式（本地测试展示效果）
```bash
npm run dev
# 访问 http://localhost:5173/gym-roi
```
- 读取 `src/apps/gym-roi/data/*.json` 文件
- 模拟 GitHub Pages 展示效果
- 测试数据可视化和回本进度显示

**重要**：
- Admin 和 Public 可以在同一个开发服务器中切换路由访问
- 数据流向：localStorage (Admin) → JSON 文件 → Public 页面

### 6.2 生产环境 (GitHub Pages)
- 推送代码到 GitHub 自动部署
- 读取静态 JSON 文件展示数据
- Public 页面只读展示
- 其他人可以访问查看
- 访问地址：https://chenmq77.github.io/duckiki/gym-roi

### 6.3 数据同步流程（更新）

**方案 A：半自动同步（推荐）**
1. 在 localhost Admin 页面录入数据
2. 点击"同步到 GitHub"按钮
3. 数据自动写入 `src/apps/gym-roi/data/*.json`
4. 系统弹出提示框，显示需要执行的命令：
   ```
   请在终端执行以下命令完成同步：
   git add src/apps/gym-roi/data
   git commit -m "更新健身数据"
   git push
   ```
5. 用户在终端手动执行命令
6. GitHub Actions 自动部署
7. 访问 Public 页面查看更新

**方案 B：手动导出（备用）**
1. 点击"导出数据到 JSON"
2. 下载 JSON 文件到本地
3. 手动复制到 `src/apps/gym-roi/data/` 目录
4. Git 提交推送

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

**文档版本**: v2.0
**创建日期**: 2025-10-17
**更新日期**: 2025-10-17
**作者**: Claude & chenmq77

## 版本更新记录

### v2.0 (2025-10-17)
- ✅ 新增多币种支持（NZD/RMB，可切换）
- ✅ 新增周扣费年卡模式
- ✅ 新增双重回本计算（已扣费 vs 全年预期）
- ✅ 新增回本目标层级系统（回本线/铜牌/银牌/金牌）
- ✅ 新增智能折叠显示（避免压力过大）
- ✅ 新增游泳距离动态权重（高斯函数 + 非对称奖励）
- ✅ 为所有活动类型添加强度权重
- ✅ 新增 Gym Day（力量训练日）活动类型
- ✅ 升级笔记系统为"训练日记"（支持所有活动）
- ✅ 新增配置管理界面（Admin 可编辑所有配置）
- ✅ 新增固定资产分类（必须投入 vs 阶段性奖励）
- ✅ 优化数据同步方案（半自动同步到 GitHub）
- ✅ 新增本地测试 Public 页面说明

### v1.0 (2025-10-17)
- 初始版本
