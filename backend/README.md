# Gym ROI Backend - Flask API

> 本地 Flask API 服务，提供数据录入、ROI 计算、统计分析和 JSON 导出功能

---

## 📚 相关文档

在开始之前，建议先阅读：

- **业务需求**：[需求文档 - 项目概述](../docs/gym-roi-requirements.md#1-项目概述) 或 [[gym-roi-requirements#1. 项目概述|需求文档]] - 了解项目目标和功能
- **游泳权重公式**：[需求文档 3.2.2](../docs/gym-roi-requirements.md#322-游泳距离动态权重公式) 或 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式|权重公式]] - 高斯函数计算逻辑
- **整体架构**：[架构设计文档 - 整体架构](../docs/gym-roi-architecture.md#整体架构) 或 [[gym-roi-architecture#整体架构|架构文档]] - 了解系统设计和技术选型
- **开发规范**：[开发最佳实践指南 - 虚拟环境](../docs/development-guide.md#1-虚拟环境-virtual-environment) 或 [[development-guide#1. 虚拟环境 (Virtual Environment)|开发指南]] - Python 代码风格和工作流

---

## 📦 技术栈

- **Python**: 3.8.11
- **Flask**: 3.0+ (Web 框架)
- **SQLAlchemy**: 2.0+ (ORM)
- **SQLite**: 3.x (数据库)
- **NumPy**: 1.24+ (科学计算)
- **Flask-CORS**: 4.0+ (跨域支持)

---

## 🚀 快速开始

### 1. 创建虚拟环境

```bash
cd backend
python3 -m venv venv
```

**为什么需要虚拟环境？**
- 隔离项目依赖，避免版本冲突
- 方便管理和复现环境
- 详见 [开发最佳实践指南](../docs/development-guide.md#1-虚拟环境-virtual-environment)

---

### 2. 激活虚拟环境

**macOS/Linux**:
```bash
source venv/bin/activate
```

**Windows**:
```cmd
venv\Scripts\activate
```

**如何判断成功？**
终端提示符会显示 `(venv)`：
```bash
(venv) chenmq@MacBook backend %
```

---

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

**首次创建项目时（手动安装）**:
```bash
pip install flask flask-cors flask-sqlalchemy numpy python-dotenv
pip freeze > requirements.txt
```

---

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改为你的真实配置
# vim .env 或使用其他编辑器
```

**.env 示例**:
```bash
DATABASE_PATH=backend/gym_roi.db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:5173
```

⚠️ **重要**：`.env` 文件包含敏感信息，已添加到 `.gitignore`，不会推送到 GitHub。

---

### 5. 初始化数据库

```bash
flask db init       # 初始化迁移环境（仅首次）
flask db migrate -m "初始化数据库"  # 生成迁移脚本
flask db upgrade    # 应用迁移，创建表
```

**或者直接创建（开发初期）**:
```bash
python3 -c "from app import db; db.create_all()"
```

---

### 6. 启动开发服务器

```bash
flask run
```

**或指定端口**:
```bash
flask run --port 5001
```

**成功输出**:
```
 * Running on http://127.0.0.1:5000
 * Restarting with stat
 * Debugger is active!
```

访问 http://localhost:5000/api/health 测试 API 是否正常。

---

## 📁 项目结构

```
backend/
├── app.py                  # Flask 主应用
├── models.py               # 数据库模型（SQLAlchemy）
├── calculator.py           # ROI 计算引擎
├── config.py               # Flask 配置
├── requirements.txt        # Python 依赖列表
├── .env.example            # 环境变量模板（推送到 Git）
├── .env                    # 环境变量（不推送，本地使用）
├── venv/                   # 虚拟环境（不推送）
├── gym_roi.db              # SQLite 数据库（不推送）
├── migrations/             # 数据库迁移脚本
│
├── routes/                 # API 路由
│   ├── __init__.py
│   ├── expenses.py         # 支出相关 API
│   ├── activities.py       # 活动相关 API
│   ├── roi.py              # ROI 计算 API
│   ├── stats.py            # 统计分析 API
│   └── export.py           # JSON 导出 API
│
├── utils/                  # 工具函数
│   ├── __init__.py
│   ├── gaussian.py         # 高斯函数计算
│   ├── weight_calculator.py# 活动权重计算
│   └── data_sanitizer.py   # 数据脱敏处理
│
└── README.md               # 本文件
```

---

## 🔌 API 接口

### 基础 URL
```
http://localhost:5000/api
```

### 健康检查
```http
GET /api/health

响应:
{
  "status": "ok",
  "database": "connected"
}
```

### 支出管理

#### 获取所有支出
```http
GET /api/expenses
```

#### 添加支出
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

#### 更新支出
```http
PUT /api/expenses/<expense_id>
```

#### 删除支出
```http
DELETE /api/expenses/<expense_id>
```

---

### 活动管理

#### 获取所有活动
```http
GET /api/activities
```

#### 添加活动
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
- `calculatedWeight`: 基于高斯函数自动计算权重
- 存入数据库

---

### ROI 计算

#### 获取 ROI 摘要
```http
GET /api/roi/summary

响应:
{
  "mode_a": {
    "actualPaid": 136,
    "weightedActivities": 11.72,
    "costPerActivity": 11.60
  },
  "mode_b": {
    "expectedTotal": 816,
    "currentProgress": {
      "breakeven": {
        "percentage": 71.8,
        "remaining": 4.6
      }
    }
  }
}
```

---

### 数据导出（核心功能）

#### 导出 JSON 文件
```http
POST /api/export/json

响应:
{
  "success": true,
  "files": [
    "src/apps/gym-roi/data/roi-summary.json",
    "src/apps/gym-roi/data/activities-timeline.json"
  ],
  "message": "数据导出成功！请执行以下命令推送到 GitHub:\n\ngit add src/apps/gym-roi/data\ngit commit -m \"更新健身数据 2025-10-17\"\ngit push"
}
```

**功能**：
1. 从 SQLite 读取所有数据
2. 数据脱敏（移除敏感信息）
3. 计算 ROI、统计数据
4. 生成 JSON 文件到 `../src/apps/gym-roi/data/`
5. 返回 Git 命令提示

---

## 🧮 核心计算逻辑

### 游泳距离动态权重（高斯函数）

```python
# utils/gaussian.py
import numpy as np

def calculate_swimming_weight(distance, baseline=1000, sigma=400):
    """
    计算游泳距离的动态权重

    参数:
        distance: 游泳距离（米）
        baseline: 基准距离（默认 1000m）
        sigma: 标准差（默认 400）

    返回:
        weight: 计算后的权重

    示例:
        500m  → 0.64 (少游，惩罚)
        1000m → 1.0  (基准)
        1500m → 1.64 (多游500m，奖励！)
        2000m → 1.14 (继续奖励，但递减)
    """
    if distance <= 0:
        return 0

    deviation = distance - baseline
    gaussian_weight = np.exp(-(deviation ** 2) / (2 * sigma ** 2))

    if distance <= baseline:
        # 少于基准：只有高斯惩罚
        return gaussian_weight
    else:
        # 多于基准：高斯 + 1.0 奖励
        return gaussian_weight + 1.0
```

### 活动权重计算（强度系数）

```python
# utils/weight_calculator.py
def calculate_activity_weight(activity, config):
    """
    计算活动的最终权重

    最终权重 = 基础权重 × 强度系数

    示例:
        高强度团课 = 1.5 × 1.3 = 1.95
        极限私教 = 3.0 × 1.5 = 4.5
    """
    activity_type = activity['type']
    base_weight = config['activityTypes'][activity_type]['baseWeight']

    # 游泳使用动态权重
    if activity_type == 'swimming':
        return calculate_swimming_weight(activity['data']['distance'])

    # 其他活动使用强度乘数
    intensity = activity['data'].get('intensity', 'medium')
    multiplier = config['activityTypes'][activity_type]['intensityMultiplier'][intensity]

    return base_weight * multiplier
```

---

## 🗃️ 数据库模型

### Expense (支出)

```python
class Expense(db.Model):
    id = db.Column(db.String, primary_key=True)
    type = db.Column(db.String)           # membership_weekly | equipment | other
    category = db.Column(db.String)
    amount = db.Column(db.Float)
    currency = db.Column(db.String)
    asset_type = db.Column(db.String)     # essential | reward
    include_in_roi = db.Column(db.Boolean)
    date = db.Column(db.Date)
    note = db.Column(db.Text)
```

### Activity (活动)

```python
class Activity(db.Model):
    id = db.Column(db.String, primary_key=True)
    type = db.Column(db.String)           # swimming | group_class | personal_training | gym_day
    date = db.Column(db.Date)
    data = db.Column(db.JSON)             # 活动特定数据（距离、强度等）
    calculated_weight = db.Column(db.Float)  # 自动计算的权重
    note = db.Column(db.Text)
```

---

## 🔧 开发工作流

### 日常开发

```bash
# 1. 激活虚拟环境
source venv/bin/activate

# 2. 启动 Flask 服务器（自动重载）
flask run

# 3. 开发代码...
# 修改 routes/expenses.py 等文件

# 4. 测试 API
curl http://localhost:5000/api/expenses

# 5. 查看数据库
sqlite3 gym_roi.db
sqlite> SELECT * FROM expense;
```

### 添加新依赖

```bash
pip install 新库名
pip freeze > requirements.txt
```

### 数据库迁移（修改 models.py 后）

```bash
flask db migrate -m "添加新字段"
flask db upgrade
```

---

## 🐛 调试技巧

### 1. 查看日志

Flask 会在终端输出请求日志：
```
127.0.0.1 - - [17/Oct/2025 10:30:15] "GET /api/expenses HTTP/1.1" 200 -
```

### 2. 使用 print 调试

```python
@app.route('/api/expenses')
def get_expenses():
    expenses = Expense.query.all()
    print(f"DEBUG: 查询到 {len(expenses)} 条支出记录")
    return jsonify(expenses)
```

### 3. 使用 pdb 调试器

```python
import pdb

@app.route('/api/roi/calculate')
def calculate_roi():
    pdb.set_trace()  # 在这里暂停，进入交互式调试
    # ...
```

### 4. 查看数据库

```bash
sqlite3 gym_roi.db

sqlite> .tables
sqlite> SELECT * FROM activity;
sqlite> .quit
```

---

## ❌ 常见错误

### 错误 1：端口被占用

```
OSError: [Errno 48] Address already in use
```

**解决**:
```bash
lsof -i :5000
kill -9 <PID>

# 或换个端口
flask run --port 5001
```

---

### 错误 2：找不到模块

```
ModuleNotFoundError: No module named 'flask'
```

**解决**:
```bash
# 确保激活了虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

---

### 错误 3：数据库锁定

```
sqlite3.OperationalError: database is locked
```

**原因**：SQLite 不支持高并发写入

**解决**：
- 关闭其他正在访问数据库的程序
- 使用 `db.session.commit()` 后及时关闭连接

---

## 📚 相关文档

- [架构设计文档](../docs/gym-roi-architecture.md)
- [开发最佳实践指南](../docs/development-guide.md)
- [需求文档 v2.0](../docs/gym-roi-requirements.md)

---

## 🤝 贡献指南

### 提交代码前

1. 运行测试（如果有）
2. 确保代码符合 PEP 8 规范
3. 写清晰的提交信息

### 代码风格

```python
# ✅ 好的命名
def calculate_swimming_weight(distance, baseline):
    pass

# ❌ 不好的命名
def calc(d, b):
    pass
```

---

**创建日期**: 2025-10-17
**作者**: chenmq77
**Python 版本**: 3.8.11
