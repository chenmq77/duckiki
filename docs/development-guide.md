# 开发最佳实践指南 - 新手必读

> 这份文档专门为编程新手准备，详细解释每个开发步骤的**原理**和**为什么这样做**。

---

## 📚 目录

1. [虚拟环境 (Virtual Environment)](#1-虚拟环境-virtual-environment)
2. [环境变量 (.env)](#2-环境变量-env)
3. [Git 工作流](#3-git-工作流)
4. [代码提交规范](#4-代码提交规范)
5. [Python 依赖管理](#5-python-依赖管理)
6. [前端开发规范](#6-前端开发规范)
7. [数据库迁移](#7-数据库迁移)
8. [调试技巧](#8-调试技巧)

---

## 1. 虚拟环境 (Virtual Environment)

### 🤔 为什么需要虚拟环境？

想象你有两个 Python 项目：
- **项目 A** 需要 Flask 2.0
- **项目 B** 需要 Flask 3.0

如果直接用 `pip install` 安装，两个版本会冲突！虚拟环境就像给每个项目一个独立的"房间"，互不干扰。

### ✅ 优点

1. **依赖隔离**：每个项目有自己的库版本
2. **可复现性**：别人可以用 `requirements.txt` 安装相同版本
3. **系统干净**：不污染全局 Python 环境
4. **易于删除**：不需要项目时，直接删除 `venv/` 文件夹即可

### 📖 创建虚拟环境（一步一步）

#### 步骤 1：进入项目目录
```bash
cd /Users/chenmq/Documents/duckiki/backend
```

#### 步骤 2：创建虚拟环境
```bash
python3 -m venv venv
```

**解释**：
- `python3`: 使用 Python 3 (你的是 3.8.11)
- `-m venv`: 运行 Python 内置的 `venv` 模块
- 最后的 `venv`: 虚拟环境文件夹的名字（可以改，但 `venv` 是约定俗成）

**发生了什么？**
创建了一个 `venv/` 文件夹，里面有：
```
venv/
├── bin/           # 可执行文件（python, pip 等）
├── include/       # C 头文件
├── lib/           # 安装的 Python 库
└── pyvenv.cfg     # 配置文件
```

#### 步骤 3：激活虚拟环境
```bash
source venv/bin/activate
```

**在 Windows 上**：
```cmd
venv\Scripts\activate
```

**如何判断激活成功？**
终端提示符前面会出现 `(venv)`：
```bash
(venv) chenmq@MacBook backend %
```

#### 步骤 4：安装项目依赖
```bash
pip install flask flask-cors flask-sqlalchemy numpy python-dotenv
```

**为什么用 `pip` 而不是 `pip3`？**
激活虚拟环境后，`pip` 自动指向虚拟环境内的 pip，无需加 `3`。

#### 步骤 5：冻结依赖版本
```bash
pip freeze > requirements.txt
```

**`requirements.txt` 示例**：
```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
numpy==1.24.3
python-dotenv==1.0.0
```

**为什么要锁定版本？**
- 你今天安装的 Flask 可能是 3.0.0
- 明年别人安装可能是 3.5.0，可能不兼容
- `requirements.txt` 确保大家用相同版本

### 🔄 日常使用

#### 每次开始开发
```bash
cd backend
source venv/bin/activate  # 激活虚拟环境
```

#### 安装新库
```bash
pip install 新库名
pip freeze > requirements.txt  # 更新依赖列表
```

#### 退出虚拟环境
```bash
deactivate
```

### ❌ 常见错误

#### 错误 1：忘记激活虚拟环境
```bash
# ❌ 错误
pip install flask  # 安装到全局环境

# ✅ 正确
source venv/bin/activate
pip install flask  # 安装到虚拟环境
```

#### 错误 2：把 venv/ 推送到 Git
**后果**：
- `venv/` 可能有几百 MB
- 包含操作系统特定的文件，别人用不了

**解决**：
在 `.gitignore` 中添加 `venv/`（我们已经添加了）

---

## 2. 环境变量 (.env)

### 🤔 什么是环境变量？

环境变量是**不应该写死在代码里的配置**，比如：
- 数据库密码
- API 密钥
- 文件路径（不同电脑路径不同）

### ✅ 为什么用 .env 文件？

#### ❌ 不好的做法
```python
# app.py
DATABASE_PATH = '/Users/chenmq/Documents/duckiki/backend/gym_roi.db'
SECRET_KEY = 'my-secret-password-123'
```

**问题**：
1. 密码直接写在代码里，推送到 GitHub 后全世界可见
2. 别人的路径不是 `/Users/chenmq/...`，代码跑不起来

#### ✅ 好的做法
```python
# app.py
import os
from dotenv import load_dotenv

load_dotenv()  # 加载 .env 文件

DATABASE_PATH = os.getenv('DATABASE_PATH')
SECRET_KEY = os.getenv('SECRET_KEY')
```

```bash
# .env (不推送到 Git)
DATABASE_PATH=/Users/chenmq/Documents/duckiki/backend/gym_roi.db
SECRET_KEY=my-secret-password-123
```

```bash
# .env.example (推送到 Git，给别人参考)
DATABASE_PATH=你的数据库路径
SECRET_KEY=你的密钥
```

### 📖 创建 .env 文件

#### 步骤 1：在 backend/ 创建 .env.example
```bash
# .env.example
# 数据库路径
DATABASE_PATH=backend/gym_roi.db

# Flask 密钥（用于 session 加密）
SECRET_KEY=change-this-to-random-string

# Flask 运行模式
FLASK_ENV=development
FLASK_DEBUG=True

# CORS 允许的前端地址
CORS_ORIGINS=http://localhost:5173
```

#### 步骤 2：复制为真实的 .env
```bash
cd backend
cp .env.example .env
```

#### 步骤 3：修改 .env 中的值
```bash
# .env (你的真实配置，不推送)
DATABASE_PATH=/Users/chenmq/Documents/duckiki/backend/gym_roi.db
SECRET_KEY=hf9823hf923hf923hf923  # 改成随机字符串
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:5173
```

### ✅ .gitignore 检查

确保 `.env` 在 `.gitignore` 中（我们已经添加了）：
```
# .gitignore
.env
backend/.env
```

---

## 3. Git 工作流

### 📖 日常开发流程

#### 场景 1：开始新功能

```bash
# 1. 查看当前状态
git status

# 2. 拉取最新代码
git pull

# 3. 创建功能分支（可选，个人项目可以直接在 main）
git checkout -b feature/add-roi-calculator

# 4. 开始开发...
# （修改代码）

# 5. 查看改动
git status
git diff

# 6. 添加到暂存区
git add backend/calculator.py

# 7. 提交
git commit -m "实现 ROI 计算引擎"

# 8. 推送
git push
```

#### 场景 2：更新健身数据

```bash
# 在 Admin 页面点击"导出到 GitHub"后

# 1. 查看导出的文件
git status
# 输出:
#   modified:   src/apps/gym-roi/data/roi-summary.json
#   modified:   src/apps/gym-roi/data/activities-timeline.json

# 2. 添加数据文件
git add src/apps/gym-roi/data/

# 3. 提交
git commit -m "更新健身数据 $(date +%Y-%m-%d)"

# 4. 推送
git push

# 5. GitHub Actions 自动部署
```

### ✅ 提交前检查清单

- [ ] 代码能正常运行
- [ ] 没有把 `.env`、`venv/`、`*.db` 推送
- [ ] 提交信息清晰描述改动
- [ ] 没有遗留 `console.log()` 或调试代码

---

## 4. 代码提交规范

### 🎯 好的提交信息

```bash
# ✅ 好的示例
git commit -m "添加游泳距离高斯权重计算函数"
git commit -m "修复活动删除时的外键约束错误"
git commit -m "优化 ROI 图表加载性能"
git commit -m "更新健身数据 2025-10-17"

# ❌ 不好的示例
git commit -m "fix bug"
git commit -m "update"
git commit -m "aaa"
```

### 📖 提交信息格式（推荐）

```
<类型>: <简短描述>

<详细说明>（可选）
```

**类型**：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具配置

**示例**：
```bash
git commit -m "feat: 添加周扣费年卡支持

- 新增 membership_weekly 类型
- 实现每周自动扣费计算
- 更新数据模型"
```

---

## 5. Python 依赖管理

### 📖 安装依赖的两种方式

#### 方式 1：首次创建项目
```bash
# 安装单个库
pip install flask

# 安装多个库
pip install flask flask-cors flask-sqlalchemy
```

#### 方式 2：克隆已有项目
```bash
# 从 requirements.txt 安装所有依赖
pip install -r requirements.txt
```

### 🔄 更新依赖

```bash
# 更新单个库
pip install --upgrade flask

# 更新所有库（谨慎！可能破坏兼容性）
pip install --upgrade -r requirements.txt
```

### 📝 requirements.txt 的两种格式

#### 格式 1：锁定精确版本（推荐）
```
Flask==3.0.0
numpy==1.24.3
```

**优点**：可复现性强，避免版本冲突

#### 格式 2：指定最低版本
```
Flask>=3.0.0
numpy>=1.24.0
```

**优点**：可以获得最新的小版本更新（如 3.0.1）

---

## 6. 前端开发规范

### 📖 组件文件命名

```
✅ 大驼峰（PascalCase）
ExpenseForm.jsx
ActivityTimeline.jsx
ROIChart.jsx

❌ 小驼峰或下划线
expenseForm.jsx
activity_timeline.jsx
```

### 📖 API 调用封装

#### ❌ 不好的做法
```javascript
// ExpenseForm.jsx
const handleSubmit = async (data) => {
  const res = await fetch('http://localhost:5000/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};
```

**问题**：每个组件都要写一遍 `fetch`，修改 URL 时要改多处。

#### ✅ 好的做法
```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`)
};
```

```javascript
// ExpenseForm.jsx
import { expensesAPI } from '../services/api';

const handleSubmit = async (data) => {
  await expensesAPI.create(data);
};
```

---

## 7. 数据库迁移

### 🤔 什么是数据库迁移？

随着开发进行，数据库结构会变化：
- 添加新字段
- 修改字段类型
- 添加新表

**问题**：直接改 `models.py` 后，旧数据库结构不匹配！

**解决**：使用 **Flask-Migrate**（基于 Alembic）

### 📖 使用 Flask-Migrate

#### 步骤 1：安装
```bash
pip install flask-migrate
```

#### 步骤 2：初始化
```bash
flask db init
# 创建 migrations/ 文件夹
```

#### 步骤 3：创建迁移脚本
```bash
# 修改 models.py 后
flask db migrate -m "添加活动强度字段"
# 自动生成迁移脚本到 migrations/versions/
```

#### 步骤 4：应用迁移
```bash
flask db upgrade
# 更新数据库结构
```

### 🔄 回滚

```bash
# 回滚到上一个版本
flask db downgrade
```

---

## 8. 调试技巧

### 🐛 Python 调试

#### 技巧 1：print 调试（最简单）
```python
def calculate_roi(expenses, activities):
    print(f"DEBUG: expenses = {expenses}")
    print(f"DEBUG: activities = {activities}")

    result = expenses / activities
    print(f"DEBUG: result = {result}")

    return result
```

#### 技巧 2：pdb 调试器（高级）
```python
import pdb

def calculate_roi(expenses, activities):
    pdb.set_trace()  # 在这里暂停
    result = expenses / activities
    return result
```

运行后会进入交互式调试：
```
> /path/to/file.py(10)calculate_roi()
-> result = expenses / activities
(Pdb) p expenses  # 打印变量
816
(Pdb) n  # 下一行
(Pdb) c  # 继续运行
```

### 🐛 Flask 调试模式

```bash
# .env
FLASK_DEBUG=True
```

**效果**：
- 代码改动自动重启服务器
- 错误页面显示详细堆栈信息

---

## 9. 常见错误及解决

### 错误 1：ModuleNotFoundError

```
ModuleNotFoundError: No module named 'flask'
```

**原因**：没有激活虚拟环境或没有安装依赖

**解决**：
```bash
source venv/bin/activate
pip install -r requirements.txt
```

---

### 错误 2：端口被占用

```
OSError: [Errno 48] Address already in use
```

**原因**：5000 端口已被其他程序占用

**解决**：
```bash
# 查找占用端口的进程
lsof -i :5000

# 杀死进程
kill -9 <PID>

# 或者换个端口
flask run --port 5001
```

---

### 错误 3：CORS 错误

```
Access to fetch at 'http://localhost:5000/api/expenses' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**原因**：Flask 没有配置 CORS

**解决**：
```bash
pip install flask-cors
```

```python
# app.py
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])
```

---

## 📚 推荐学习资源

### Python
- [Python 官方教程（中文）](https://docs.python.org/zh-cn/3/tutorial/)
- [Flask 官方文档](https://flask.palletsprojects.com/)

### React
- [React 官方文档（中文）](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)

### Git
- [Git 官方文档（中文）](https://git-scm.com/book/zh/v2)
- [GitHub 文档](https://docs.github.com/cn)

---

## 🎓 开发习惯清单

### 每天开始开发前
- [ ] `git pull` 拉取最新代码
- [ ] `source venv/bin/activate` 激活虚拟环境
- [ ] `git status` 检查是否有未提交的改动

### 每次提交前
- [ ] 运行项目确保没有错误
- [ ] `git status` 查看改动文件
- [ ] `git diff` 检查具体改动
- [ ] 写清晰的提交信息

### 每周
- [ ] 备份数据库（`cp gym_roi.db gym_roi.db.backup`）
- [ ] 检查 `.gitignore` 是否正确
- [ ] 更新 `requirements.txt`

---

## 10. 文档写作指南（AI 辅助开发时代）

> **核心观点**：在 AI 时代，好文档 = 高效开发。文档是 AI 的"长期记忆"，写好文档能让 AI 生成更准确的代码。

### 10.1 为什么文档在 AI 时代更重要？

#### 问题：AI 很强大，为什么还需要写文档？

**答案**：AI 是优秀的**执行者**，但需要清晰的**指令**。

#### 对比：有文档 vs 无文档

**场景：让 AI 实现游泳权重计算**

```
❌ 没有文档（模糊指令）
你: "帮我写一个游泳权重计算函数"

AI: "好的，这是一个简单的权重计算：
def calculate_weight(distance):
    return distance / 1000"

你: "不对！我要的是高斯函数..."
（多轮解释，浪费时间）
```

```
✅ 有文档（精确指令）
你: "参考 docs/gym-roi-requirements.md 第 3.2.2 节
的高斯函数公式，实现 calculate_swimming_weight() 函数"

AI: "好的，基于文档中的公式：
def calculate_swimming_weight(distance, baseline=1000, sigma=400):
    if distance <= 0:
        return 0
    deviation = distance - baseline
    gaussian_weight = np.exp(-(deviation ** 2) / (2 * sigma ** 2))
    if distance <= baseline:
        return gaussian_weight
    else:
        return gaussian_weight + 1.0"

你: "完美！"（一次成功）
```

#### 文档的三大价值

1. **AI 的"长期记忆"**
   - AI 对话有 token 限制（如 200k tokens）
   - 文档可以无限长
   - AI 随时可以读取文档，获取上下文

2. **保持多轮对话一致性**
   ```
   第1轮对话: "游泳基准距离是 1000m"
   第2轮对话: AI可能忘记，说成 800m

   有文档: AI 每次都读 config.js，永远是 1000m
   ```

3. **团队协作的基础**
   - 你和 AI 是"团队"
   - 文档是你们共同的"规范"
   - 避免"我以为你理解了我的意思"

### 10.2 需求文档 vs 架构文档

#### 核心区别一览表

| 维度 | 需求文档 | 架构文档 |
|------|----------|----------|
| **英文名** | Requirements | Architecture |
| **核心问题** | **要什么**（WHAT） | **怎么做**（HOW） |
| **视角** | 产品 / 业务 | 技术 / 实现 |
| **受众** | 产品经理、开发者、测试 | 开发者、架构师、运维 |
| **关键内容** | 功能、数据模型、UI/UX | 技术选型、API、数据流 |
| **示例问题** | "游泳距离如何计算权重？" | "权重计算在哪里执行（前端/后端）？" |

#### 实战案例：健身房回本计划

让我们用你的项目举例：

**需求文档 (`gym-roi-requirements.md`)**

```markdown
### 3.2.2 游泳距离动态权重公式

使用**高斯函数 + 非对称奖励机制**：

function calculateSwimmingWeight(distance, baseline = 1000, sigma = 400) {
  if (distance <= 0) return 0;

  const deviation = distance - baseline;
  const gaussianWeight = Math.exp(
    -(deviation * deviation) / (2 * sigma * sigma)
  );

  if (distance <= baseline) {
    return gaussianWeight;  // 500m → 0.64
  } else {
    return gaussianWeight + 1.0;  // 1500m → 1.64
  }
}
```

**关注点**：
- ✅ **业务逻辑**："如何计算"
- ✅ **公式细节**：高斯函数、边界条件
- ✅ **示例数据**：500m → 0.64，1500m → 1.64

---

**架构文档 (`gym-roi-architecture.md`)**

```markdown
### 2. 活动管理 API

#### 2.2 添加活动
POST /api/activities

{
  "type": "swimming",
  "date": "2025-10-17",
  "data": { "distance": 1500 }
}

**后端自动计算**：
- calculatedWeight: 基于高斯函数计算游泳权重
- 存入数据库

---

### 场景 1：本地录入活动

用户在 Admin 填表
  → POST /api/activities
  → Python 计算权重（高斯函数）
  → 存入 SQLite
  → 返回成功响应
```

**关注点**：
- ✅ **技术实现**："在哪里计算"（后端 Python）
- ✅ **API 设计**：请求格式、响应格式
- ✅ **数据流向**：从前端到数据库的完整流程

#### 什么时候需要哪份文档？

**场景 1：产品需求不清楚**
→ 查看 **需求文档**
→ "啊，原来游泳少于 1000m 要惩罚，多于要奖励！"

**场景 2：不知道如何实现**
→ 查看 **架构文档**
→ "原来计算在后端 Python，前端只管调用 API！"

**场景 3：让 AI 写代码**
→ 同时提供**两份文档**
→ "基于需求文档的公式，按照架构文档的 API 设计实现"

### 10.3 需求文档写作模板

#### 模板结构

```markdown
# [项目名称] - 需求文档

## 1. 项目概述
- 项目名称
- 项目目标（WHY：为什么做这个项目）
- 核心价值（解决什么问题）
- 目标用户

## 2. 用户场景
- 主要用户画像
- 使用场景（WHEN & WHERE）
- 操作流程（WHAT：用户要做什么）

## 3. 功能需求
### 3.1 功能模块 A
- 功能描述
- 输入/输出
- 数据字段（JSON 示例）
- 业务规则（计算公式、边界条件）

### 3.2 功能模块 B
...

## 4. 数据模型
- JSON 结构示例
- 字段说明
- 数据关系

## 5. UI/UX 设计
- 页面布局（ASCII 图或截图）
- 交互流程
- 用户反馈

## 6. 非功能需求
- 性能要求
- 安全要求
- 兼容性要求
```

#### 实战示例：活动记录功能

```markdown
### 3.2 活动记录

#### 3.2.1 活动类型

1. **游泳** (Swimming)
   - **记录字段**：距离（米）
   - **动态权重**：基于高斯函数（详见 3.2.3）
     - 基准距离 1000m → 权重 1.0
     - 少于基准 → 权重降低（500m → 0.64）
     - 多于基准 → 权重增加（1500m → 1.64）
   - **市场参考价**：$50 NZD/次
   - **WHY**: 鼓励多游泳，但避免过度

#### 3.2.2 数据字段

游泳记录：
{
  "id": "act_001",
  "type": "swimming",
  "date": "2025-10-17",
  "data": {
    "distance": 1500
  },
  "calculatedWeight": 1.64,
  "note": "状态不错"
}

#### 3.2.3 游泳权重计算公式

【公式代码和详细说明】
```

**关键点**：
- ✅ **每个字段都有说明**
- ✅ **提供 JSON 示例**（不是抽象描述）
- ✅ **解释 WHY**（为什么这样设计）

### 10.4 架构文档写作模板

#### 模板结构

```markdown
# [项目名称] - 技术架构设计

## 1. 整体架构图
- 系统组成部分
- 数据流向
- 环境划分（开发 vs 生产）

## 2. 技术栈选型
- 后端技术（语言、框架、数据库）
- 前端技术（框架、库、工具）
- 部署技术（CI/CD、托管平台）
- **WHY**: 为什么选这个技术

## 3. 目录结构
- 文件组织方式
- 模块划分

## 4. API 设计
- 接口定义（URL、方法、参数）
- 请求/响应示例
- 错误处理

## 5. 数据库设计
- 表结构
- 字段类型
- 索引和关系

## 6. 数据流向
- 关键场景的数据流程
- 交互时序图

## 7. 部署策略
- 开发环境配置
- 生产环境部署
- CI/CD 流程
```

#### 实战示例：API 设计

```markdown
### 4. API 接口设计

#### 基础 URL
本地开发: http://localhost:5000/api
生产环境: 无（GitHub Pages 无后端）

#### 4.1 添加活动
POST /api/activities

**请求**:
Content-Type: application/json

{
  "type": "swimming",
  "date": "2025-10-17",
  "data": {
    "distance": 1500
  },
  "note": "状态不错"
}

**响应**（成功）:
HTTP 201 Created

{
  "id": "act_001",
  "type": "swimming",
  "date": "2025-10-17",
  "data": {
    "distance": 1500
  },
  "calculatedWeight": 1.64,  # 后端自动计算
  "note": "状态不错"
}

**响应**（失败）:
HTTP 400 Bad Request

{
  "error": "Invalid distance value"
}

**后端处理逻辑**:
1. 验证输入数据
2. 调用 calculator.py 计算权重
3. 存入 SQLite 数据库
4. 返回完整记录
```

**关键点**：
- ✅ **完整的请求/响应示例**（不只是接口定义）
- ✅ **说明后端处理逻辑**（数据如何流转）
- ✅ **错误处理**（失败时返回什么）

### 10.5 与 AI 协作的文档写作技巧

#### 技巧 1：使用结构化格式

**❌ 不好的文档**（AI 难以理解）
```
游泳权重计算比较复杂，少游要惩罚多游要奖励，
基准是1000米，用高斯函数，sigma是400
```

**✅ 好的文档**（AI 易于解析）
```markdown
### 游泳权重计算

**算法**: 高斯函数 + 非对称奖励

**参数**:
- baseline: 1000 (基准距离，米)
- sigma: 400 (标准差)

**规则**:
- distance ≤ baseline: 权重 = 高斯函数值（惩罚）
- distance > baseline: 权重 = 高斯函数值 + 1.0（奖励）

**代码**:
def calculate_swimming_weight(distance, baseline=1000, sigma=400):
    # ...
```

**为什么好？**
- 清晰的标题层级
- 参数列表（key-value 格式）
- 规则用条件表达式
- 代码块有语法高亮

#### 技巧 2：提供具体示例（而非抽象描述）

**❌ 抽象描述**
```
系统应该支持多种活动类型，每种类型有不同的权重
```

**✅ 具体示例**
```markdown
### 活动类型权重

| 类型 | 基础权重 | 强度系数 | 示例 |
|------|----------|----------|------|
| 游泳 | 1.0 | 动态（高斯函数） | 1500m → 1.64 |
| 团课 | 1.5 | light(0.7) ~ extreme(1.5) | HIIT高强度 → 1.95 |
| 私教 | 3.0 | light(0.8) ~ extreme(1.5) | 极限训练 → 4.5 |
| 力量训练 | 1.2 | light(0.8) ~ extreme(1.4) | 大重量 → 1.44 |

**计算公式**:
最终权重 = 基础权重 × 强度系数
```

**AI 可以立即理解**：
- 每种类型的具体数值
- 如何计算最终权重
- 真实的输入输出示例

#### 技巧 3：标注优先级

```markdown
### 功能列表

#### Phase 1（必须，本周完成）
- [ ] ✅ 支出录入 API
- [ ] ✅ 活动录入 API
- [ ] ✅ 游泳权重计算

#### Phase 2（重要，下周完成）
- [ ] 🔴 ROI 双重计算
- [ ] 🔴 配置管理界面

#### Phase 3（可选，未来实现）
- [ ] ⚪ 数据导出 Excel
- [ ] ⚪ 邮件提醒
```

**AI 知道优先级** → 先实现重要功能

#### 技巧 4：记录决策原因（WHY）

**❌ 只说 WHAT**
```markdown
使用 Flask + SQLite
```

**✅ 说明 WHY**
```markdown
### 技术选型

**后端**: Flask + SQLite

**WHY**:
- **Flask**: 轻量级，快速开发 RESTful API
- **SQLite**: 零配置，本地文件数据库，适合个人项目
- **放弃 PostgreSQL**: 个人项目无需重量级数据库
- **放弃 Django**: 功能过重，学习成本高
```

**好处**：
- AI 理解设计意图
- 未来修改时知道当初为什么这样做
- 避免重复讨论已经决定的事情

#### 技巧 5：保持文档更新

**文档 → 代码 → 更新文档** 的循环

```bash
# 1. 需求变更：新增 Gym Day 类型
# 2. 更新需求文档
git add docs/gym-roi-requirements.md
git commit -m "docs: 新增 Gym Day 活动类型"

# 3. 让 AI 基于文档生成代码
AI: "基于更新后的需求文档实现 Gym Day"

# 4. 代码实现后，更新 changelog
git add changelog.md
git commit -m "feat: 实现 Gym Day 功能"
```

### 10.6 文档驱动开发 (Documentation-Driven Development)

#### 传统开发流程

```
需求（口头） → 写代码 → （可能）补文档
```

**问题**：
- 需求理解不一致
- 代码写完才发现理解错了
- 文档和代码不同步

#### 文档驱动开发流程

```
1. 写需求文档（WHAT）
   ↓
2. 写架构文档（HOW）
   ↓
3. AI 读文档 → 生成代码
   ↓
4. Code Review（对照文档检查）
   ↓
5. 更新 Changelog（记录改动）
```

**优势**：
- ✅ **需求先明确**：写文档时就发现需求问题
- ✅ **AI 生成准确**：文档即规范，AI 不会偏离
- ✅ **易于维护**：文档和代码同步
- ✅ **团队协作**：文档是"合同"

#### 实战案例：游泳权重功能

**第1步：写需求文档**
```markdown
### 3.2.2 游泳距离动态权重

使用高斯函数，基准 1000m，sigma 400
- distance ≤ 1000m: 惩罚
- distance > 1000m: 奖励

示例:
- 500m → 0.64
- 1500m → 1.64
```

**第2步：写架构文档**
```markdown
### 计算逻辑位置

**后端**: `backend/calculator.py`

def calculate_swimming_weight(distance, baseline, sigma):
    # Python 实现

**调用方**: `POST /api/activities` 接口
```

**第3步：让 AI 生成代码**
```
你: "基于 docs/gym-roi-requirements.md 3.2.2 节的公式，
在 backend/calculator.py 实现 calculate_swimming_weight 函数"

AI: [生成准确的 Python 代码]
```

**第4步：Code Review**
```
检查清单:
- [ ] 是否符合需求文档的公式？
- [ ] 参数名是否和架构文档一致？
- [ ] 边界条件是否处理？
- [ ] 测试用例覆盖 500m、1000m、1500m？
```

**第5步：更新 Changelog**
```markdown
## [2025-10-17] - 实现游泳距离动态权重

### 添加内容
- 游泳权重计算函数（高斯函数）

### 为什么这样做
- 鼓励多游泳，但避免过度
- 边际收益递减符合运动科学

### 如何工作
- distance ≤ 1000m: 高斯惩罚
- distance > 1000m: 高斯 + 1.0 奖励
```

### 10.7 实战案例：健身房回本计划的文档体系

你的项目是一个完美的文档驱动开发案例！

#### 文档层级

```
文档体系
├── README.md                      # 项目总览（给所有人看）
├── changelog.md                   # 改动历史（WHY改）
├── docs/
│   ├── gym-roi-requirements.md   # 需求文档（WHAT要做）
│   ├── gym-roi-architecture.md   # 架构文档（HOW实现）
│   └── development-guide.md      # 最佳实践（教学）
└── backend/
    └── README.md                  # 后端手册（操作指南）
```

#### 每份文档的作用

**1. README.md**
- **受众**：所有人（开发者、访客、招聘者）
- **内容**：快速开始、功能特性、技术栈
- **目标**：让人5分钟理解项目

**2. requirements.md**
- **受众**：产品经理、开发者、AI
- **内容**：功能需求、数据模型、业务规则
- **目标**：定义"要什么"

**3. architecture.md**
- **受众**：开发者、AI
- **内容**：技术选型、API、数据流
- **目标**：定义"怎么做"

**4. development-guide.md**
- **受众**：新手开发者
- **内容**：最佳实践、常见错误、教学
- **目标**：教会"如何做"

**5. changelog.md**
- **受众**：团队成员、未来的你
- **内容**：每次改动的 WHAT/WHY/HOW
- **目标**：记录决策历史

#### 如何使用文档协作

**场景 1：实现新功能**
```
你: "我要实现回本目标层级系统"
  ↓
1. 打开 requirements.md 查看详细需求
2. 打开 architecture.md 查看 API 设计
3. 告诉 AI: "基于这两份文档实现"
  ↓
AI: [生成准确代码]
  ↓
你: Code Review（对照文档）
  ↓
更新 changelog.md 记录改动
```

**场景 2：遇到问题**
```
你: "不知道游泳权重怎么算"
  ↓
查看 requirements.md 3.2.2 节
  ↓
找到公式和示例
```

**场景 3：部署上线**
```
你: "忘记如何启动后端"
  ↓
查看 backend/README.md
  ↓
按照步骤操作
```

### 10.8 文档写作清单

在写文档前，问自己这些问题：

#### 目标读者

- [ ] **谁会读这份文档？**
  - 开发者 → 技术细节
  - 产品经理 → 业务逻辑
  - AI → 结构化、示例丰富

- [ ] **读者的技术水平？**
  - 新手 → 详细解释、教学式
  - 专家 → 简洁高效、直接要点

#### 内容完整性

- [ ] **是否回答了核心问题？**
  - 需求文档 → WHAT & WHY
  - 架构文档 → HOW & WHERE

- [ ] **是否包含足够的示例？**
  - JSON 数据结构
  - API 请求/响应
  - 代码片段

- [ ] **是否说明了边界条件？**
  - 输入为空怎么办？
  - 异常情况如何处理？

#### AI 友好性

- [ ] **AI 能否根据文档直接生成代码？**
  - 测试方法：把文档给 AI，看生成的代码是否正确

- [ ] **格式是否结构化？**
  - Markdown 标题层级清晰
  - 代码块有语法高亮
  - 表格、列表规范

#### 可维护性

- [ ] **文档是否易于更新？**
  - 模块化（每个功能独立章节）
  - 版本号管理

- [ ] **是否记录了决策原因？**
  - 为什么选这个技术？
  - 为什么不用那个方案？

### 10.9 常见文档错误

#### 错误 1：只写 WHAT，不写 WHY

**❌ 不好**
```markdown
使用 SQLite 数据库
```

**✅ 好**
```markdown
### 数据库选型：SQLite

**WHY**:
- 个人项目，数据量小
- 零配置，开箱即用
- 本地文件，无需额外服务器

**放弃 PostgreSQL**:
- 配置复杂，增加学习成本
- 个人项目无需分布式特性
```

#### 错误 2：抽象描述，缺少示例

**❌ 不好**
```markdown
系统支持多种活动类型，每种类型有不同的权重系数
```

**✅ 好**
```markdown
### 活动权重示例

**游泳 1500m**:
- 基础权重: 1.0
- 距离动态权重: 1.64（高斯函数）
- 最终权重: 1.64

**高强度团课**:
- 基础权重: 1.5
- 强度系数: 1.3
- 最终权重: 1.5 × 1.3 = 1.95
```

#### 错误 3：文档和代码不同步

**问题**：文档说一套，代码做一套

**解决**：
1. 每次改代码后，立即更新文档
2. 在 Git 提交信息中说明文档变更
3. 定期 Review 文档和代码的一致性

```bash
git commit -m "feat: 新增 Gym Day 类型

- 更新需求文档添加 Gym Day 说明
- 更新架构文档添加相关 API
- 实现后端代码"
```

---

### 10.8 文档重构实战案例：Duckiki 项目

> 本节记录了 2025-10-18 完成的文档重构经验，展示如何用"Single Source of Truth"原则解决文档重复问题。

#### 问题诊断

**重构前的症状**：
- ❌ 游泳权重公式在 3 个地方重复（需求文档 JS 代码 + 后端文档 Python 代码 + 前端 README）
- ❌ 需求文档混入 JavaScript 实现代码，违背了"语言无关"原则
- ❌ 技术栈、API 接口、部署方案等信息分散在多个文档中
- ❌ 没有文档导航，查找信息困难
- ❌ 文档间引用只到文件级别，需要手动滚动查找章节

**根本原因**：
1. **文档职责不清**：需求文档和实现文档混在一起
2. **复制粘贴文化**：每个文档都想"自包含"，导致大量重复
3. **缺少导航系统**：没有统一的入口文档

#### 解决方案：分层架构 + Single Source of Truth

**核心理念**：
```
每个知识点只在一个地方详细说明，其他地方通过精准引用链接。
```

**文档分层**：
```
📋 需求层（requirements.md）
   ↓ 定义 WHY + WHAT（业务需求、功能规格）
   ↓ 使用伪代码或数学公式（语言无关）

🏗️ 架构层（architecture.md）
   ↓ 定义 HOW（整体设计）
   ↓ 技术选型、系统设计、API概览

🔧 实现层（backend/README.md, frontend/README.md）
   ↓ 定义 HOW（具体实现）
   ↓ 可运行的代码、开发指南

📝 配置层（config.js）
   ↓ 可执行配置 + 计算函数
```

#### 实施过程

**步骤 1：创建文档导航（docs/README.md）**
- 建立清晰的文档层级结构
- 提供快速查找索引（业务概念、技术实现、代码实现、开发操作）
- 说明文档之间的引用关系
- 包含文档维护指南和同步检查清单

**步骤 2：重构需求文档**

**修改前**（第 185-222 行）：
```javascript
// ❌ JavaScript 实现代码
export function calculateSwimmingWeight(distance, baseline = 1000, sigma = 400) {
  if (distance <= 0) return 0;
  // ... 50 行代码
}
```

**修改后**：
```markdown
<!-- ✅ 伪代码 + 数学公式 -->
函数 calculateSwimmingWeight(distance, baseline, sigma):
    输入：
        distance - 游泳距离（米）
        baseline - 基准距离（默认 1000m）
        sigma    - 标准差（默认 400）
    输出：
        weight - 权重系数

    deviation = distance - baseline
    gaussianWeight = exp(-(deviation²) / (2 × sigma²))

    如果 distance ≤ baseline:
        返回 gaussianWeight
    否则:
        返回 gaussianWeight + 1.0

**具体实现**：
- Python 后端：backend/utils/gaussian.py
- JavaScript 前端：src/apps/gym-roi/config.js（第 182-209 行）
```

**步骤 3：优化引用链接（精准定位到章节）**

**修改前**：
```markdown
详见 [需求文档](./gym-roi-requirements.md)
```

**修改后**（双链接语法，兼容 Cursor + Obsidian）：
```markdown
详见 [需求文档 3.2.2](./gym-roi-requirements.md#322-游泳距离动态权重公式) 或 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式|权重公式]]
```

**步骤 4：添加"相关文档"章节**

在每个实现层文档开头添加引用：
```markdown
## 📚 相关文档

在开始之前，建议先阅读：

- **业务需求**：[需求文档 - 项目概述](../docs/gym-roi-requirements.md#1-项目概述) - 了解项目目标
- **游泳权重公式**：[需求文档 3.2.2](../docs/gym-roi-requirements.md#322-游泳距离动态权重公式) - 高斯函数计算逻辑
```

#### 效果对比

| 维度 | 修改前 | 修改后 |
|------|--------|--------|
| **重复度** | 游泳公式重复 3 次 | 每个概念只在一处详细说明 |
| **查找效率** | 需要逐个文档翻阅 | 一键跳转到具体章节 |
| **维护成本** | 改一处需要同步 3 个文件 | 改一次，其他引用自动同步 |
| **职责清晰度** | 需求和实现混在一起 | 分层明确，各司其职 |
| **导航体验** | 没有导航，靠记忆 | 文档导航 + 快速索引表 |
| **工具兼容性** | 只支持 Cursor | Cursor + Obsidian 双工具 |

#### 经验教训

**1. 先文档架构，后内容填充**
- ✅ 先确定文档分层和职责
- ✅ 再填充具体内容
- ❌ 避免一边写一边想结构

**2. 锚点语法要规范**
```markdown
标题：#### 3.2.2 游泳距离动态权重公式
正确锚点：#322-游泳距离动态权重公式
错误锚点：#游泳距离动态权重公式（缺少章节编号）

规则：
- 数字间的点（.）删除或替换为 -
- 空格替换为 -
- 中文保持不变
```

**3. 双链接语法提升兼容性**
```markdown
[标准 Markdown](./file.md#anchor) 或 [[Obsidian双链#章节|显示文本]]

- 第一个：Cursor 点击跳转
- 第二个：Obsidian 双向链接、反向链接、关系图
```

**4. 文档维护清单必不可少**
```markdown
重大变更后检查：
- [ ] 需求文档的伪代码与实际实现逻辑一致
- [ ] 架构文档的技术栈与 package.json 一致
- [ ] 所有引用链接有效（无 404）
```

**5. 用 changelog.md 记录决策过程**

每次文档重构都记录：
- **为什么要做**（问题是什么）
- **修改内容**（做了什么）
- **如何工作**（原理和效果）

#### 完整案例参考

详见 [changelog.md - 文档重构](../changelog.md#2025-10-17---文档重构消除重复建立分层引用体系)

---

### 10.9 Markdown 章节锚点最佳实践

> 本节解释 Markdown 锚点的生成规则，以及如何在 Cursor 和 Obsidian 中正确使用。

#### 什么是锚点？

锚点（Anchor）是 Markdown 文档内跳转的机制，允许你直接跳转到特定章节。

**语法**：
```markdown
[链接文本](./文件名.md#锚点ID)
```

**示例**：
```markdown
查看 [需求文档 3.2.2](./gym-roi-requirements.md#322-游泳距离动态权重公式)
```

点击后直接跳转到 `gym-roi-requirements.md` 的"3.2.2 游泳距离动态权重公式"章节。

#### 锚点生成规则（GitHub/Cursor/Obsidian 通用）

**基本规则**：

1. **移除标题标记符号**：`##`、`###` 等移除
2. **数字间的点（`.`）处理**：删除或替换为 `-`
3. **空格替换为 `-`**
4. **中文保持不变**
5. **英文转小写**（中文不转）
6. **特殊字符移除**：`()`、`[]`、`!` 等

#### 实例对照表

| 原始标题 | 正确锚点 | 错误示例 |
|---------|---------|---------|
| `## 1. 项目概述` | `#1-项目概述` | `#项目概述`（缺数字） |
| `### 1.4 多币种支持` | `#14-多币种支持` | `#1-4-多币种支持`（点变-） |
| `### 3.2 活动记录` | `#32-活动记录` | `#3.2-活动记录`（点未删） |
| `#### 3.2.2 游泳距离动态权重公式` | `#322-游泳距离动态权重公式` | `#游泳距离动态权重公式` |
| `#### 3.4.2 双重回本计算详解` | `#342-双重回本计算详解` | `#3-4-2-双重回本计算详解` |
| `## 5. 技术架构` | `#5-技术架构` | `#5技术架构`（缺-） |
| `### API 接口设计` | `#api-接口设计` | `#API-接口设计`（英文未小写） |
| `## 10. 文档写作指南（AI 辅助开发时代）` | `#10-文档写作指南ai-辅助开发时代` | `#10-文档写作指南（AI-辅助开发时代）`（括号未删） |

#### 双链接语法（兼容 Cursor + Obsidian）

**格式**：
```markdown
[标准 Markdown 链接](./file.md#anchor) 或 [[Obsidian双链语法#章节|显示文本]]
```

**实际示例**：
```markdown
详见 [需求文档 3.2.2](./gym-roi-requirements.md#322-游泳距离动态权重公式) 或 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式|权重公式]]
```

**工作原理**：
- **Cursor**：识别第一个标准 Markdown 链接，点击跳转
- **Obsidian**：识别第二个双向链接，提供反向链接、关系图功能

#### 如何验证锚点是否正确？

**方法 1：在 Cursor 中测试**
1. 在 Markdown 文档中创建链接
2. Cmd/Ctrl + 点击链接
3. 如果跳转成功 → 锚点正确
4. 如果 404 或无反应 → 锚点错误

**方法 2：在 Obsidian 中测试**
1. 打开项目文件夹作为 Vault
2. 点击双向链接 `[[文件#章节]]`
3. 查看是否正确跳转

**方法 3：使用脚本自动生成**

创建 `scripts/generate-anchors.py`：
```python
import re

def generate_anchor(title):
    """自动生成符合规范的锚点"""
    # 移除标题标记符号
    title = re.sub(r'^#+\s+', '', title)

    # 数字间的点删除（3.2.2 → 322）
    title = re.sub(r'(\d+)\.(\d+)\.(\d+)', r'\1\2\3', title)
    title = re.sub(r'(\d+)\.(\d+)', r'\1\2', title)

    # 空格替换为 -
    title = title.replace(' ', '-')

    # 英文转小写
    title = title.lower()

    # 移除特殊字符
    title = re.sub(r'[（）\(\)\[\]！!]', '', title)

    return f'#{title}'

# 测试
print(generate_anchor('#### 3.2.2 游泳距离动态权重公式'))
# 输出：#322-游泳距离动态权重公式
```

#### 常见错误和解决方案

**错误 1：锚点中包含点号**
```markdown
❌ 错误：#3.2.2-游泳距离动态权重公式
✅ 正确：#322-游泳距离动态权重公式
```

**错误 2：缺少章节编号**
```markdown
❌ 错误：#游泳距离动态权重公式
✅ 正确：#322-游泳距离动态权重公式
```

**错误 3：英文未转小写**
```markdown
❌ 错误：#API-接口设计
✅ 正确：#api-接口设计
```

**错误 4：括号未移除**
```markdown
❌ 错误：#10-文档写作指南（AI-辅助开发时代）
✅ 正确：#10-文档写作指南ai-辅助开发时代
```

#### Obsidian 特殊用法

**1. 反向链接（Backlinks）**

当你在文档 A 中引用文档 B 的章节：
```markdown
详见 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式|权重公式]]
```

在 Obsidian 中打开 `gym-roi-requirements.md`，右侧会显示"Backlinks"面板，列出所有引用了这个文档的地方。

**2. 关系图（Graph View）**

Obsidian 会自动生成文档间的关系网络图：
- 节点：每个文档
- 边：文档间的引用关系
- 中心节点：被引用最多的文档（如 `docs/README.md`）

**3. 块引用（Block Reference）**

除了章节级别，Obsidian 还支持段落级别的引用：
```markdown
详见 [[gym-roi-requirements#^block-id]]
```

---

### 10.10 文档内链接快速索引

> 本节提供 Duckiki 项目所有关键章节的锚点列表，方便快速查找和引用。

#### 需求文档（gym-roi-requirements.md）

**1. 项目概述**
```markdown
[需求文档 - 项目概述](./gym-roi-requirements.md#1-项目概述)
[[gym-roi-requirements#1. 项目概述|项目概述]]
```

| 章节编号 | 标题 | 锚点 |
|---------|------|------|
| 1 | 项目概述 | `#1-项目概述` |
| 1.1 | 项目名称 | `#11-项目名称` |
| 1.2 | 项目目标 | `#12-项目目标` |
| 1.3 | 核心价值 | `#13-核心价值` |
| 1.4 | 多币种支持 | `#14-多币种支持` |
| 2 | 用户场景 | `#2-用户场景` |
| 3.1 | 支出管理 | `#31-支出管理` |
| 3.2 | 活动记录 | `#32-活动记录` |
| 3.2.2 | 游泳距离动态权重公式 | `#322-游泳距离动态权重公式` |
| 3.3 | 训练日记系统 | `#33-训练日记系统升级` |
| 3.4 | 数据分析与可视化 | `#34-数据分析与可视化` |
| 3.4.2 | 双重回本计算详解 | `#342-双重回本计算详解` |
| 3.4.3 | 回本目标层级系统 | `#343-回本目标层级系统新增` |
| 5 | 技术架构 | `#5-技术架构` |
| 6 | 部署方案 | `#6-部署方案` |

#### 架构文档（gym-roi-architecture.md）

| 章节 | 锚点 |
|------|------|
| 整体架构 | `#整体架构` |
| 技术栈选型 | `#技术栈选型` |
| API 接口设计 | `#api-接口设计` |
| 数据流向详解 | `#数据流向详解` |
| 数据安全与隐私 | `#数据安全与隐私` |
| 部署策略 | `#部署策略` |

#### 开发指南（development-guide.md）

| 章节 | 锚点 |
|------|------|
| 1. 虚拟环境 | `#1-虚拟环境-virtual-environment` |
| 2. 环境变量 | `#2-环境变量-env` |
| 3. Git 工作流 | `#3-git-工作流` |
| 10. 文档写作指南 | `#10-文档写作指南ai-辅助开发时代` |
| 10.8 文档重构实战案例 | `#108-文档重构实战案例duckiki-项目` |
| 10.9 Markdown 锚点 | `#109-markdown-章节锚点最佳实践` |
| 10.10 文档内链接索引 | `#1010-文档内链接快速索引` |

#### 后端指南（backend/README.md）

| 章节 | 锚点 |
|------|------|
| 快速开始 | `#快速开始` |
| 核心计算逻辑 | `#核心计算逻辑` |
| 调试技巧 | `#调试技巧` |

#### 前端指南（src/apps/gym-roi/README.md）

| 章节 | 锚点 |
|------|------|
| 快速开始 | `#快速开始` |
| 使用流程 v2.0 | `#使用流程-v20` |
| 同步到 GitHub | `#同步到-github` |

#### 文档导航（docs/README.md）

| 章节 | 锚点 |
|------|------|
| 文档层级结构 | `#文档层级结构` |
| 核心文档列表 | `#核心文档列表` |
| 快速查找索引 | `#快速查找索引` |
| 文档编写原则 | `#文档编写原则` |

#### 使用示例

**场景 1：在代码注释中引用文档**
```python
# 游泳权重计算逻辑详见：
# docs/gym-roi-requirements.md#322-游泳距离动态权重公式
def calculate_swimming_weight(distance, baseline=1000, sigma=400):
    pass
```

**场景 2：在 README 中引用章节**
```markdown
## 核心功能

- 支出管理：参见 [需求文档 3.1](./docs/gym-roi-requirements.md#31-支出管理)
- 活动记录：参见 [需求文档 3.2](./docs/gym-roi-requirements.md#32-活动记录)
```

**场景 3：在 Issue 中引用文档**
```markdown
## Bug 描述

游泳权重计算结果不符合预期。

## 相关文档

需求定义：[gym-roi-requirements.md#322](https://github.com/chenmq77/duckiki/blob/main/docs/gym-roi-requirements.md#322-游泳距离动态权重公式)

后端实现：[backend/README.md#核心计算逻辑](https://github.com/chenmq77/duckiki/blob/main/backend/README.md#核心计算逻辑)
```

#### 维护建议

**1. 新增章节时立即更新此索引**
```bash
# 工作流程
1. 在文档中新增章节
2. 根据锚点生成规则，在本索引表中添加条目
3. 在其他文档中引用时，直接复制锚点
```

**2. 定期检查链接有效性**

创建 `scripts/check-links.sh`：
```bash
#!/bin/bash
# 检查所有 Markdown 文件中的链接是否有效

find docs -name "*.md" -exec markdown-link-check {} \;
```

**3. 使用 VS Code 插件辅助**

推荐插件：
- **Markdown All in One**：自动生成目录
- **Markdown Link Check**：检查链接有效性
- **Markdown Preview Enhanced**：增强预览

---

## 📚 总结

### AI 时代的文档价值

1. **文档是 AI 的"记忆"** → 让 AI 生成更准确的代码
2. **文档是团队的"合同"** → 你和 AI 的协作规范
3. **文档是未来的"地图"** → 3个月后的你需要它

### 文档写作黄金法则

1. **先文档，后代码**（Documentation-Driven Development）
2. **写给 AI 看**（结构化、示例丰富）
3. **记录 WHY，不只是 WHAT**（决策原因很重要）
4. **保持同步**（文档和代码一起更新）

### 立即行动

下次开发新功能时，试试这个流程：

```
1. 打开 requirements.md，写下需求（5分钟）
2. 打开 architecture.md，写下设计（5分钟）
3. 让 AI 基于文档生成代码（1分钟）
4. Review 代码是否符合文档（3分钟）
5. 更新 changelog.md 记录改动（2分钟）

总计: 16分钟（vs 无文档时可能要1小时反复沟通）
```

**好文档 = 高效开发 = 更多时间去健身房！😊**

---

**创建日期**: 2025-10-17
**更新日期**: 2025-10-17
**作者**: chenmq77
**适用对象**: 编程新手和初学者
