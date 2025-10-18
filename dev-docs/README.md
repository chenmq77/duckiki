# 📚 Duckiki 项目文档导航

> 本导航帮助你快速找到所需的文档和信息，是项目的中心文档

---

## 🗂️ 文档层级结构

```
📋 需求层（WHY + WHAT）
   ↓ 定义业务需求、功能规格

🏗️ 架构层（HOW - 整体设计）
   ↓ 技术选型、系统设计

🔧 实现层（HOW - 具体实现）
   ↓ 前后端开发指南、代码实现

📝 配置层（可执行配置）
   ↓ 配置文件、环境变量
```

---

## 📖 核心文档列表

### 1️⃣ 需求文档（业务层）
**文件**：[gym-roi-requirements.md](./gym-roi-requirements.md#1-项目概述) 或 [[gym-roi-requirements|需求文档]]

**职责**：定义 WHAT（做什么）和 WHY（为什么）

**内容**：
- ✅ 项目目标和核心价值
- ✅ 用户场景和使用流程
- ✅ 功能需求（支出管理、活动记录、ROI计算、训练日记）
- ✅ 数据模型（JSON schema，语言无关）
- ✅ 业务规则（伪代码或数学公式）
- ✅ 回本目标层级系统

**特点**：
- 🚫 不包含具体技术栈
- 🚫 不包含代码实现
- 🚫 语言无关（使用伪代码）

---

### 2️⃣ 架构设计文档（系统层）
**文件**：[gym-roi-architecture.md](./gym-roi-architecture.md#整体架构) 或 [[gym-roi-architecture|架构文档]]

**职责**：定义 HOW（怎么做，整体架构）

**内容**：
- ✅ 整体架构图（本地 Flask + GitHub Pages）
- ✅ 技术栈选型及理由
- ✅ 项目目录结构
- ✅ API 接口设计（概览）
- ✅ 数据流向
- ✅ 数据安全与隐私策略
- ✅ 部署策略

**特点**：
- 📐 系统级视角
- 🔗 引用实现层文档
- 🎯 技术决策说明

---

### 3️⃣ 开发最佳实践指南
**文件**：[development-guide.md](./development-guide.md#1-虚拟环境-virtual-environment) 或 [[development-guide|开发指南]]

**职责**：团队协作规范、代码风格、工作流

**内容**：
- ✅ 虚拟环境使用指南
- ✅ Git 分支管理策略
- ✅ 代码风格规范（Python PEP 8、React）
- ✅ 测试策略
- ✅ 文档编写规范

---

### 4️⃣ 后端开发指南（实现层）
**文件**：[backend/README.md](../backend/README.md#快速开始) 或 [[../backend/README|后端指南]]

**职责**：Python/Flask 后端实现细节

**内容**：
- ✅ 快速开始（环境配置）
- ✅ 项目结构（后端部分）
- ✅ API 接口（完整的请求/响应示例）
- ✅ **核心计算逻辑**（Python 代码实现）
- ✅ 数据库模型（SQLAlchemy）
- ✅ 开发工作流
- ✅ 调试技巧
- ✅ 常见错误解决

**特点**：
- 🐍 Python 实现
- 💻 可运行的代码示例
- 🔧 开发实践指南

---

### 5️⃣ 前端开发指南（实现层）
**文件**：[gym-roi/README.md](../src/apps/gym-roi/README.md#快速开始) 或 [[../src/apps/gym-roi/README#快速开始|前端指南]]

**职责**：React 前端实现细节

**内容**：
- ✅ 快速开始（本地开发、测试）
- ✅ 文件结构（前端部分）
- ✅ 数据模型（前端视角）
- ✅ 使用流程
- ✅ 功能特性清单
- ✅ 配置说明

**特点**：
- ⚛️ React 实现
- 🎨 UI 组件说明
- 🔄 数据流管理

---

### 6️⃣ 配置文件（可执行代码）
**文件**：[config.js](../src/apps/gym-roi/config.js) 或 [[../src/apps/gym-roi/config|配置文件]]

**职责**：前端可执行配置 + 计算函数

**内容**：
- ✅ 货币设置（汇率）
- ✅ 活动类型配置（权重、强度系数）
- ✅ 支出类型配置
- ✅ 回本目标层级
- ✅ **计算函数**（JavaScript 版本）
  - `calculateSwimmingWeight()`: 游泳距离动态权重
  - `calculateActivityWeight()`: 活动权重计算

**特点**：
- 🔧 可直接在代码中 import 使用
- 📝 注释详细，自解释
- 🔄 可在 Admin 页面动态修改

---

## 🔍 快速查找索引

### 业务概念查询

| 你想了解... | 查看文档（双链接）|
|------------|---------|
| **项目目标和价值** | [需求文档 1.项目概述](./gym-roi-requirements.md#1-项目概述) 或 [[gym-roi-requirements#1. 项目概述\|项目概述]] |
| **多币种支持** | [需求文档 1.4](./gym-roi-requirements.md#14-多币种支持) 或 [[gym-roi-requirements#1.4 多币种支持\|多币种]] |
| **支出管理功能** | [需求文档 3.1](./gym-roi-requirements.md#31-支出管理) 或 [[gym-roi-requirements#3.1 支出管理\|支出管理]] |
| **活动记录功能** | [需求文档 3.2](./gym-roi-requirements.md#32-活动记录) 或 [[gym-roi-requirements#3.2 活动记录\|活动记录]] |
| **游泳距离权重公式** | [需求文档 3.2.2](./gym-roi-requirements.md#322-游泳距离动态权重公式) 或 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式\|权重公式]] |
| **双重回本计算** | [需求文档 3.4.2](./gym-roi-requirements.md#342-双重回本计算详解) 或 [[gym-roi-requirements#3.4.2 双重回本计算详解\|双重回本]] |
| **回本目标层级** | [需求文档 3.4.3](./gym-roi-requirements.md#343-回本目标层级系统新增) 或 [[gym-roi-requirements#3.4.3 回本目标层级系统（新增）\|目标层级]] |
| **训练日记系统** | [需求文档 3.3](./gym-roi-requirements.md#33-训练日记系统升级) 或 [[gym-roi-requirements#3.3 训练日记系统（升级）\|训练日记]] |

---

### 技术实现查询

| 你想了解... | 查看文档（双链接）|
|------------|---------|
| **整体架构** | [架构文档-整体架构](./gym-roi-architecture.md#整体架构) 或 [[gym-roi-architecture#整体架构\|整体架构]] |
| **技术栈选型理由** | [架构文档-技术栈](./gym-roi-architecture.md#技术栈选型) 或 [[gym-roi-architecture#技术栈选型\|技术栈]] |
| **API 接口列表** | [架构文档-API](./gym-roi-architecture.md#api-接口设计) 或 [[gym-roi-architecture#API 接口设计\|API设计]] |
| **数据流向** | [架构文档-数据流向](./gym-roi-architecture.md#数据流向详解) 或 [[gym-roi-architecture#数据流向详解\|数据流向]] |
| **数据安全策略** | [架构文档-安全](./gym-roi-architecture.md#数据安全与隐私) 或 [[gym-roi-architecture#数据安全与隐私\|数据安全]] |
| **部署方案** | [架构文档-部署](./gym-roi-architecture.md#部署策略) 或 [[gym-roi-architecture#部署策略\|部署策略]] |

---

### 代码实现查询

| 你想实现... | 查看文档/代码 | 具体位置 |
|-----------|-------------|----------|
| **Python 高斯函数** | `backend/utils/gaussian.py` | - |
| **JavaScript 高斯函数** | `src/apps/gym-roi/config.js` | 第 182-209 行 |
| **活动权重计算（Python）** | `backend/utils/weight_calculator.py` | - |
| **活动权重计算（JavaScript）** | `src/apps/gym-roi/config.js` | 第 217-234 行 |
| **数据脱敏处理** | `backend/utils/data_sanitizer.py` | - |
| **ROI 计算引擎** | `backend/calculator.py` | - |
| **数据库模型** | `backend/models.py` | - |
| **API 路由** | `backend/routes/` | - |

---

### 开发操作查询

| 你想做... | 查看文档（双链接）|
|----------|---------|
| **配置 Python 虚拟环境** | [开发指南-虚拟环境](./development-guide.md#1-虚拟环境-virtual-environment) 或 [[development-guide#1. 虚拟环境 (Virtual Environment)\|虚拟环境]] |
| **启动后端开发服务器** | [后端指南-快速开始](../backend/README.md#快速开始) 或 [[../backend/README#快速开始\|后端启动]] |
| **启动前端开发服务器** | [前端指南-快速开始](../src/apps/gym-roi/README.md#快速开始) 或 [[../src/apps/gym-roi/README#快速开始\|前端启动]] |
| **录入数据** | [前端指南-使用流程](../src/apps/gym-roi/README.md#使用流程-v20) 或 [[../src/apps/gym-roi/README#使用流程 v2.0\|录入数据]] |
| **导出数据到 GitHub** | [前端指南-同步](../src/apps/gym-roi/README.md#同步到-github) 或 [[../src/apps/gym-roi/README#同步到 GitHub\|数据同步]] |
| **调试后端 API** | [后端指南-调试](../backend/README.md#调试技巧) 或 [[../backend/README#调试技巧\|调试技巧]] |
| **修改配置参数** | [配置文件](../src/apps/gym-roi/config.js) 或 [[../src/apps/gym-roi/config\|配置参数]] |

---

## 🔗 文档之间的引用关系

```
需求文档 (requirements.md)
    ↓
    ├─→ 架构文档 (architecture.md)
    │       ↓
    │       ├─→ 后端 README (backend/README.md)
    │       │       ↓
    │       │       └─→ 后端代码 (backend/utils/*.py)
    │       │
    │       └─→ 前端 README (src/apps/gym-roi/README.md)
    │               ↓
    │               └─→ 前端配置 (config.js)
    │
    └─→ 开发指南 (development-guide.md)
```

---

## 📝 文档编写原则

### 1. Single Source of Truth（单一真实来源）
每个知识点只在**一个地方**详细说明，其他地方**引用**。

**示例**：
```markdown
<!-- ✅ 好的做法（双链接语法）-->
## 游泳距离权重计算

详见 [需求文档 3.2.2](./gym-roi-requirements.md#322-游泳距离动态权重公式) 或 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式|权重公式]]

**Python 实现**：`backend/utils/gaussian.py`
**JavaScript 实现**：`src/apps/gym-roi/config.js`（第 182-209 行）

<!-- ❌ 不好的做法 -->
## 游泳距离权重计算

使用高斯函数计算...（复制粘贴大段内容，造成重复）
```

---

### 2. 分层引用，避免循环依赖

```
需求文档 → 架构文档 → 实现文档 → 代码
（单向引用，不回头）
```

---

### 3. 代码示例的语言选择

| 文档类型 | 代码形式 | 原因 |
|---------|---------|------|
| **需求文档** | 伪代码 / 数学公式 | 语言无关，便于理解业务逻辑 |
| **架构文档** | 简化示例（如必要） | 说明系统设计，不涉及实现细节 |
| **实现文档** | 真实可运行代码 | Python（后端）或 JavaScript（前端） |

---

## 🛠️ 文档维护指南

### 何时更新文档？

1. **需求变更**：
   - 更新 `requirements.md`
   - 检查 `architecture.md` 是否需要调整架构

2. **技术栈变更**：
   - 更新 `architecture.md`
   - 同步更新 `backend/README.md` 或 `frontend/README.md`

3. **API 接口变更**：
   - 更新 `backend/README.md`（详细接口）
   - 同步更新 `architecture.md`（概览）

4. **配置参数变更**：
   - 更新 `config.js` 注释
   - 必要时更新 `requirements.md`（业务规则）

---

### 文档同步检查清单

在重大变更后，使用此清单确保文档一致性：

- [ ] 需求文档的伪代码与实际实现逻辑一致
- [ ] 架构文档的技术栈与 `package.json` / `requirements.txt` 一致
- [ ] API 接口概览与后端实现一致
- [ ] 数据模型在需求、后端、前端文档中一致
- [ ] 配置参数在 `config.js` 和文档中一致
- [ ] 所有引用链接有效（无 404）

---

## 📧 反馈与贡献

如果你发现文档中有：
- ❌ 重复内容
- ❌ 过时信息
- ❌ 损坏的链接
- ❌ 不清晰的描述

请提交 Issue 或直接修改文档！

---

**创建日期**：2025-10-17
**作者**：chenmq77
**版本**：v1.0
