# Changelog

All notable changes to this project will be documented in this file.

## [2025-10-17] - 健身房回本计划 v2.0 需求细化

### 添加内容
- 🌐 **多币种支持**：新增 NZD/RMB 双币种切换功能，汇率可在 Admin 配置
- 📅 **周扣费年卡模式**：支持每周自动扣费模式，记录已扣费和预期总价
- 🎯 **双重回本计算系统**：
  - 模式 A：已扣费回本（短期激励）
  - 模式 B：全年预期回本（长期目标）
- 🏅 **回本目标层级**：回本线/铜牌/银牌/金牌/自定义，基于市场价不同比例
- 📊 **智能折叠显示**：默认只显示已完成目标 + 下一个目标，避免压力过大
- 🏊 **游泳距离动态权重**：使用高斯函数 + 非对称奖励机制
  - 少于基准距离：权重降低（惩罚）
  - 等于基准距离：权重 1.0
  - 多于基准距离：权重增加（奖励递减）
- 💪 **所有活动类型强度权重**：为团课、私教、Gym Day 添加强度系数
- 🏋️ **新增活动类型**：Gym Day（力量训练日）
- 📝 **训练日记系统**：从"私教笔记"升级为支持所有活动类型的训练日记
- ⚙️ **配置管理界面**：Admin 可直接修改所有配置（权重、汇率、目标等）
- 🏷️ **固定资产分类**：区分必须投入 vs 阶段性奖励
- 🔄 **半自动数据同步**：点击按钮生成 JSON，提示 Git 命令

### 为什么这样做
- **多币种支持**：用户在新西兰使用 NZD，但也想看 RMB 对比，方便跨国理解成本
- **周扣费模式**：反映真实的健身房付费模式（按周扣费而非一次性支付）
- **双重回本计算**：
  - 短期激励：看到每周的实际成本很低，增加健身动力
  - 长期目标：清晰的全年回本进度，游戏化激励
- **目标层级系统**：类似游戏成就系统，设置多个里程碑，更有成就感
- **智能折叠显示**：避免一次性看到太多未完成目标而产生压力
- **游泳距离动态权重**：
  - 鼓励游更多，但避免过度（边际收益递减）
  - 游少了给予惩罚，游多了给予奖励
  - 符合实际运动价值（1500m 比 1000m 更有价值）
- **强度权重**：高强度训练应该获得更高权重，反映实际付出
- **Gym Day**：记录自主力量训练，完整反映健身房使用情况
- **训练日记**：记录成长轨迹，查看进步曲线
- **配置管理**：随着体能提升，可以调整基准距离等参数
- **资产分类**：区分必要投入和奖励性购买，更准确的 ROI 计算

### 如何工作

#### 1. 游泳距离动态权重公式
```javascript
// 高斯函数 + 非对称奖励
if (distance <= baseline) {
  weight = exp(-(distance-baseline)^2 / (2*sigma^2))  // 高斯惩罚
} else {
  weight = exp(-(distance-baseline)^2 / (2*sigma^2)) + 1.0  // 高斯 + 奖励
}
```

#### 2. 强度权重计算
```javascript
最终权重 = 基础权重 × 强度系数
示例：
- 高强度团课 = 1.5 × 1.3 = 1.95
- 极限私教 = 3.0 × 1.5 = 4.5
- 大重量 Gym = 1.2 × 1.2 = 1.44
```

#### 3. 双重回本计算
```javascript
// 模式 A：已扣费回本
单次成本 = 已扣费金额 ÷ 当前加权次数

// 模式 B：全年预期回本
目标次数 = 预期总价 ÷ (市场价 × 目标比例)
进度 = 当前次数 ÷ 目标次数 × 100%
```

#### 4. 智能折叠显示逻辑
```javascript
// 默认显示
- 已完成的最高目标（如果有）
- 下一个未完成的目标（显示进度条）

// 点击"展开"后
- 显示所有目标和进度
```

#### 5. 数据同步流程
```
Admin 录入 → localStorage → 点击同步 → 写入 JSON →
提示 Git 命令 → 用户执行 → GitHub Actions → Public 页面
```

### 技术实现
- **config.js v2.0**：新增 currency、roiTargets、强度系数等配置
- **expenses.json**：新增 membership_weekly 类型，assetType 字段
- **activities.json**：新增 gym_day 类型，intensity 字段，calculatedWeight 字段
- **游泳权重函数**：在 config.js 中导出 calculateSwimmingWeight()
- **活动权重函数**：在 config.js 中导出 calculateActivityWeight()

### 架构变更
```
src/apps/gym-roi/
├── config.js (v2.0)          # 新增多币种、目标层级、强度配置
├── data/
│   ├── expenses.json (v2.0)  # 新增周扣费年卡示例
│   ├── activities.json (v2.0)# 新增 Gym Day 示例
│   └── notes/
│       ├── 2025-10-18-leg-training.md
│       └── 2025-10-19-chest-back-day.md (新增)
├── components/ (待开发)
│   └── ConfigManager.jsx (新增)  # 配置管理界面
└── README.md (v2.0)          # 更新所有新功能说明
```

### 文档更新
- ✅ `docs/gym-roi-requirements.md` 升级到 v2.0（所有新功能完整文档）
- ✅ `src/apps/gym-roi/config.js` 完全重写（多币种、回本目标、强度系数）
- ✅ `src/apps/gym-roi/README.md` 升级到 v2.0（详细使用说明）
- ✅ 数据模板更新（expenses.json, activities.json）
- ✅ 新增 Gym Day 训练日记示例（2025-10-19-chest-back-day.md）
- ✅ Changelog 完整记录所有改动原因和实现方式

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
