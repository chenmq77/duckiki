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

**创建日期**: 2025-10-17
**作者**: chenmq77
**适用对象**: 编程新手和初学者
